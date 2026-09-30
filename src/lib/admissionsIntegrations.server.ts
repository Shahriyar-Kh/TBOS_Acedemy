import { getSupabaseServerClient, type AdmissionsRequestRecord } from "./supabase.server";
import {
  sendAdminNotificationEmail,
  sendLearnerAcknowledgementEmail,
  type EmailSendResult,
} from "./email.server";
import {
  mirrorToGoogleSheetsServer,
  type GoogleMirrorResult,
} from "./googleMirror.server";

export interface IntegrationExecutionReport {
  adminEmail: EmailSendResult;
  learnerEmail: EmailSendResult;
  googleMirror: GoogleMirrorResult;
}

/**
 * Orchestrates secondary post-submission integrations:
 * 1. Admin notification email
 * 2. Learner/guardian acknowledgement email
 * 3. Google Sheets server mirror
 * 4. Admissions delivery log persistence
 *
 * IMPORTANT: Failures in any or all secondary integrations NEVER fail the primary admission.
 */
export async function runAdmissionsIntegrations(
  admissionId: string,
  admission: AdmissionsRequestRecord,
  referenceId?: string,
): Promise<IntegrationExecutionReport> {
  const ref = referenceId || `TBOS-${admissionId.slice(0, 8).toUpperCase()}`;

  // Execute all three secondary integrations concurrently and independently
  const [adminEmailSettled, learnerEmailSettled, googleMirrorSettled] =
    await Promise.allSettled([
      sendAdminNotificationEmail(admission, ref),
      sendLearnerAcknowledgementEmail(admission, ref),
      mirrorToGoogleSheetsServer(admission, ref),
    ]);

  const adminEmailResult: EmailSendResult =
    adminEmailSettled.status === "fulfilled"
      ? adminEmailSettled.value
      : {
          status: "failed",
          recipientType: "admin",
          errorSummary: String(adminEmailSettled.reason).slice(0, 200),
        };

  const learnerEmailResult: EmailSendResult =
    learnerEmailSettled.status === "fulfilled"
      ? learnerEmailSettled.value
      : {
          status: "failed",
          recipientType: "learner",
          errorSummary: String(learnerEmailSettled.reason).slice(0, 200),
        };

  const googleMirrorResult: GoogleMirrorResult =
    googleMirrorSettled.status === "fulfilled"
      ? googleMirrorSettled.value
      : {
          status: "failed",
          errorSummary: String(googleMirrorSettled.reason).slice(0, 200),
        };

  // Prepare delivery log records
  const deliveryLogs = [
    {
      admission_id: admissionId,
      channel: "admin_email",
      recipient_type: adminEmailResult.recipientType || "admin",
      status: adminEmailResult.status,
      error_summary: adminEmailResult.errorSummary || null,
    },
    {
      admission_id: admissionId,
      channel: "learner_email",
      recipient_type: learnerEmailResult.recipientType || "learner",
      status: learnerEmailResult.status,
      error_summary: learnerEmailResult.errorSummary || null,
    },
    {
      admission_id: admissionId,
      channel: "google_sheet",
      recipient_type: "google_sheet",
      status: googleMirrorResult.status,
      error_summary: googleMirrorResult.errorSummary || null,
    },
  ];

  // Persist delivery logs using elevated server Supabase client
  try {
    const { client } = getSupabaseServerClient();
    if (client) {
      const { error: logError } = await client
        .from("admissions_delivery_log")
        .insert(deliveryLogs);

      if (logError) {
        console.warn("Writing admissions_delivery_log failed (safe ignore):", logError.message);
      }
    }
  } catch (err: unknown) {
    // Delivery log failure must NEVER invalidate the admission
    console.warn("Delivery log recording encountered an unexpected error:", err);
  }

  return {
    adminEmail: adminEmailResult,
    learnerEmail: learnerEmailResult,
    googleMirror: googleMirrorResult,
  };
}
