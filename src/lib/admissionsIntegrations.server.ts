import { getSupabaseServerClient, type AdmissionsRequestRecord } from "./supabase.server";
import {
  sendAdminNotificationEmail,
  sendLearnerAcknowledgementEmail,
  type EmailSendResult,
} from "./email.server";
import {
  mirrorToGoogleSheetsServer,
  sanitizeIntegrationError,
  type GoogleMirrorResult,
} from "./googleMirror.server";

export interface IntegrationExecutionReport {
  adminEmail: EmailSendResult;
  learnerEmail: EmailSendResult;
  googleMirror: GoogleMirrorResult;
}

export type IntegrationChannel = "admin_email" | "learner_email" | "google_sheet";

/**
 * Orchestrates secondary post-submission integrations:
 * 1. Google Sheets server mirror (HTTPS-first webhook v2)
 * 2. SMTP fallback gating (only attempts SMTP if Apps Script did not already send the email)
 * 3. Learner/guardian acknowledgement email
 * 4. Admissions delivery log persistence
 *
 * IMPORTANT INVARIANTS:
 * - Supabase is the primary source of truth.
 * - Failures in any or all secondary integrations NEVER fail the primary admission or throw errors to users.
 */
export async function runAdmissionsIntegrations(
  admissionId: string,
  admission: AdmissionsRequestRecord,
  referenceId?: string,
): Promise<IntegrationExecutionReport> {
  const ref = referenceId || `TBOS-${admissionId.slice(0, 8).toUpperCase()}`;

  // 1. HTTPS-first: Execute Google Sheets mirror first
  let googleMirrorResult: GoogleMirrorResult;
  try {
    googleMirrorResult = await mirrorToGoogleSheetsServer(admission, ref);
  } catch (err) {
    googleMirrorResult = {
      status: "failed",
      errorSummary: sanitizeIntegrationError(err),
    };
  }

  // 2. SMTP Fallback Gating for Admin Notification Email
  let adminEmailResult: EmailSendResult;
  const scriptHandledAdminEmail =
    googleMirrorResult.status === "success" &&
    (googleMirrorResult.adminEmailStatus === "success" ||
      (googleMirrorResult.duplicate && googleMirrorResult.adminEmailStatus === "skipped"));

  if (scriptHandledAdminEmail) {
    adminEmailResult = {
      status: "success",
      recipientType: "admin",
      errorSummary: null,
    };
  } else {
    // Apps Script was skipped, failed, or did not send admin email -> fallback to SMTP
    try {
      adminEmailResult = await sendAdminNotificationEmail(admission, ref);
    } catch (err) {
      adminEmailResult = {
        status: "failed",
        recipientType: "admin",
        errorSummary: sanitizeIntegrationError(err),
      };
    }
  }

  // 3. Learner / Guardian Acknowledgement Email
  let learnerEmailResult: EmailSendResult;
  const scriptHandledLearnerEmail =
    googleMirrorResult.status === "success" &&
    (googleMirrorResult.learnerEmailStatus === "success" ||
      (googleMirrorResult.duplicate && googleMirrorResult.learnerEmailStatus === "skipped"));

  if (scriptHandledLearnerEmail) {
    learnerEmailResult = {
      status: "success",
      recipientType: googleMirrorResult.learnerRecipientType || "learner",
      errorSummary: null,
    };
  } else {
    try {
      learnerEmailResult = await sendLearnerAcknowledgementEmail(admission, ref);
    } catch (err) {
      learnerEmailResult = {
        status: "failed",
        recipientType: "learner",
        errorSummary: sanitizeIntegrationError(err),
      };
    }
  }

  // 4. Prepare delivery log records
  const deliveryLogs = [
    {
      admission_id: admissionId,
      channel: "admin_email",
      recipient_type: adminEmailResult.recipientType || "admin",
      status: adminEmailResult.status,
      error_summary: adminEmailResult.errorSummary
        ? sanitizeIntegrationError(adminEmailResult.errorSummary)
        : null,
    },
    {
      admission_id: admissionId,
      channel: "learner_email",
      recipient_type: learnerEmailResult.recipientType || "learner",
      status: learnerEmailResult.status,
      error_summary: learnerEmailResult.errorSummary
        ? sanitizeIntegrationError(learnerEmailResult.errorSummary)
        : null,
    },
    {
      admission_id: admissionId,
      channel: "google_sheet",
      recipient_type: "google_sheet",
      status: googleMirrorResult.status,
      error_summary: googleMirrorResult.errorSummary
        ? sanitizeIntegrationError(googleMirrorResult.errorSummary)
        : null,
    },
  ];

  // Persist delivery logs using elevated server Supabase client
  try {
    const { client } = getSupabaseServerClient();
    if (client) {
      const { error: logError } = await client.from("admissions_delivery_log").insert(deliveryLogs);

      if (logError) {
        console.warn("Writing admissions_delivery_log failed (safe ignore):", logError.message);
      }
    }
  } catch (err: unknown) {
    console.warn("Delivery log recording encountered an unexpected error:", err);
  }

  return {
    adminEmail: adminEmailResult,
    learnerEmail: learnerEmailResult,
    googleMirror: googleMirrorResult,
  };
}

/**
 * Admin CRM Retry Action:
 * Safely re-attempts failed or skipped delivery channels for an existing admission record.
 *
 * Guarantees:
 * - Only operates on an existing Supabase admission row
 * - Retries only requested / unsent channels
 * - Does not duplicate already successful deliveries
 * - Appends new delivery logs
 * - Does not fire Meta Lead
 * - Does not alter source attribution
 */
export async function retryAdmissionsDeliveries(
  admissionId: string,
  admission: AdmissionsRequestRecord,
  requestedChannels?: IntegrationChannel[],
): Promise<{
  ok: boolean;
  retriedChannels: string[];
  report: Partial<IntegrationExecutionReport>;
  error?: string;
}> {
  const { client } = getSupabaseServerClient();
  if (!client) {
    return { ok: false, retriedChannels: [], report: {}, error: "Database client unavailable" };
  }

  // 1. Fetch existing delivery logs to determine which channels need retry
  const { data: existingLogs } = await client
    .from("admissions_delivery_log")
    .select("channel, status, created_at")
    .eq("admission_id", admissionId)
    .order("created_at", { ascending: false });

  // Map latest status per channel
  const latestStatusMap = new Map<IntegrationChannel, string>();
  if (existingLogs) {
    for (const log of existingLogs) {
      const ch = log.channel as IntegrationChannel;
      if (!latestStatusMap.has(ch)) {
        latestStatusMap.set(ch, log.status);
      }
    }
  }

  // Channels to retry: either explicitly requested, or all non-success channels
  const channelsToAttempt: IntegrationChannel[] = (
    requestedChannels && requestedChannels.length > 0
      ? requestedChannels
      : (["admin_email", "learner_email", "google_sheet"] as IntegrationChannel[])
  ).filter((ch) => latestStatusMap.get(ch) !== "success");

  if (channelsToAttempt.length === 0) {
    return {
      ok: true,
      retriedChannels: [],
      report: {},
    };
  }

  const ref = `TBOS-${admissionId.slice(0, 8).toUpperCase()}`;
  const report: Partial<IntegrationExecutionReport> = {};
  const newDeliveryLogs: {
    admission_id: string;
    channel: string;
    recipient_type: string;
    status: string;
    error_summary: string | null;
  }[] = [];

  // 2. Prefer the HTTPS Apps Script path for retries whenever the Sheet itself
  // needs retry OR the Sheet previously succeeded and an email channel now needs retry.
  // In the latter case the webhook uses referenceId idempotency and never appends a duplicate row.
  const shouldRetryViaWebhook =
    channelsToAttempt.includes("google_sheet") ||
    (latestStatusMap.get("google_sheet") === "success" &&
      (channelsToAttempt.includes("admin_email") || channelsToAttempt.includes("learner_email")));

  let retryMirrorResult: GoogleMirrorResult | undefined;

  if (shouldRetryViaWebhook) {
    try {
      retryMirrorResult = await mirrorToGoogleSheetsServer(admission, ref);
      report.googleMirror = retryMirrorResult;

      if (channelsToAttempt.includes("google_sheet")) {
        newDeliveryLogs.push({
          admission_id: admissionId,
          channel: "google_sheet",
          recipient_type: "google_sheet",
          status: retryMirrorResult.status,
          error_summary: retryMirrorResult.errorSummary
            ? sanitizeIntegrationError(retryMirrorResult.errorSummary)
            : null,
        });
      }
    } catch (err) {
      const errSummary = sanitizeIntegrationError(err);
      retryMirrorResult = { status: "failed", errorSummary: errSummary };
      report.googleMirror = retryMirrorResult;

      if (channelsToAttempt.includes("google_sheet")) {
        newDeliveryLogs.push({
          admission_id: admissionId,
          channel: "google_sheet",
          recipient_type: "google_sheet",
          status: "failed",
          error_summary: errSummary,
        });
      }
    }
  }

  // 3. Retry Admin Email. Prefer Apps Script result; use SMTP only when the
  // webhook did not successfully handle the requested channel.
  if (channelsToAttempt.includes("admin_email")) {
    const scriptHandledAdmin =
      retryMirrorResult?.status === "success" &&
      (retryMirrorResult.adminEmailStatus === "success" ||
        (retryMirrorResult.duplicate && retryMirrorResult.adminEmailStatus === "skipped"));

    let adminResult: EmailSendResult;
    if (scriptHandledAdmin) {
      adminResult = { status: "success", recipientType: "admin", errorSummary: null };
    } else {
      try {
        adminResult = await sendAdminNotificationEmail(admission, ref);
      } catch (err) {
        adminResult = {
          status: "failed",
          recipientType: "admin",
          errorSummary: sanitizeIntegrationError(err),
        };
      }
    }

    report.adminEmail = adminResult;
    newDeliveryLogs.push({
      admission_id: admissionId,
      channel: "admin_email",
      recipient_type: adminResult.recipientType || "admin",
      status: adminResult.status,
      error_summary: adminResult.errorSummary
        ? sanitizeIntegrationError(adminResult.errorSummary)
        : null,
    });
  }

  // 4. Retry Learner/Guardian Email with the same HTTPS-first gating.
  if (channelsToAttempt.includes("learner_email")) {
    const scriptHandledLearner =
      retryMirrorResult?.status === "success" &&
      (retryMirrorResult.learnerEmailStatus === "success" ||
        (retryMirrorResult.duplicate && retryMirrorResult.learnerEmailStatus === "skipped"));

    let learnerResult: EmailSendResult;
    if (scriptHandledLearner) {
      learnerResult = {
        status: "success",
        recipientType: retryMirrorResult?.learnerRecipientType || "learner",
        errorSummary: null,
      };
    } else {
      try {
        learnerResult = await sendLearnerAcknowledgementEmail(admission, ref);
      } catch (err) {
        learnerResult = {
          status: "failed",
          recipientType: "learner",
          errorSummary: sanitizeIntegrationError(err),
        };
      }
    }

    report.learnerEmail = learnerResult;
    newDeliveryLogs.push({
      admission_id: admissionId,
      channel: "learner_email",
      recipient_type: learnerResult.recipientType || "learner",
      status: learnerResult.status,
      error_summary: learnerResult.errorSummary
        ? sanitizeIntegrationError(learnerResult.errorSummary)
        : null,
    });
  }

  // 5. Append new delivery log entries
  if (newDeliveryLogs.length > 0) {
    try {
      await client.from("admissions_delivery_log").insert(newDeliveryLogs);
    } catch (logErr) {
      console.warn("Failed to append retry delivery logs:", logErr);
    }
  }

  return {
    ok: true,
    retriedChannels: channelsToAttempt,
    report,
  };
}
