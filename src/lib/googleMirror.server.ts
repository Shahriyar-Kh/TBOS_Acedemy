import { getServerConfig } from "./config.server";
import type { AdmissionsRequestRecord } from "./supabase.server";

export interface GoogleMirrorResult {
  status: "success" | "failed" | "skipped";
  duplicate?: boolean;
  sheetStatus?: "success" | "failed";
  adminEmailStatus?: "success" | "failed" | "skipped";
  learnerEmailStatus?: "success" | "failed" | "skipped";
  learnerRecipientType?: "learner" | "guardian";
  errorSummary?: string | null;
}

/**
 * Sanitizes error strings to remove any embedded sensitive query params or secrets.
 */
export function sanitizeIntegrationError(errorStr: unknown): string {
  if (!errorStr) return "Unknown integration error";
  const str = errorStr instanceof Error ? errorStr.message : String(errorStr);
  return str
    .replace(/(key|token|secret|password|auth)=([^& \t\r\n]+)/gi, "$1=[REDACTED]")
    .replace(/https?:\/\/[^\s]+/gi, (url) => {
      try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}${u.pathname}`;
      } catch {
        return "[URL]";
      }
    })
    .slice(0, 200);
}

/**
 * Server-side best-effort mirror to Google Sheets via Google Apps Script Webhook v2.
 * Failures here NEVER cause user-facing submission errors or revert database records.
 *
 * Implements:
 * - HTTPS-first execution
 * - Idempotency reference ID
 * - Response body JSON validation (requiring ok === true)
 * - Transient retry with exponential backoff on network errors or 5xx/429
 */
export async function mirrorToGoogleSheetsServer(
  admission: AdmissionsRequestRecord,
  referenceId?: string,
  maxRetries = 2,
): Promise<GoogleMirrorResult> {
  const config = getServerConfig();
  const scriptUrl = config.googleScriptUrl;

  if (!scriptUrl) {
    return {
      status: "skipped",
      errorSummary: "GOOGLE_SCRIPT_URL not configured",
    };
  }

  const ref =
    referenceId || (admission.id ? `TBOS-${admission.id.slice(0, 8).toUpperCase()}` : "TBOS-NEW");
  const nowIso = new Date().toISOString();

  // Normalized payload + legacy Google Apps Script field aliases
  const payload = {
    // Primary normalized fields (Section 5)
    referenceId: ref,
    submissionKind: admission.submission_kind,
    applicationType: admission.application_type,
    selectedProgram: admission.selected_program_title,
    studentName: admission.student_name,
    email: admission.email,
    phone: admission.phone,
    country: admission.country,
    city: admission.city || "",
    age: admission.age ? String(admission.age) : "",
    educationLevel: admission.education_level,
    institution: admission.institution || "",
    skillLevel: admission.skill_level || "",
    learningGoal: admission.learning_goal || "",
    learningPreference: admission.learning_preference || "",
    preferredDays: admission.preferred_days || "",
    preferredTime: admission.preferred_time || "",
    timezone: admission.timezone || "",
    guardianName: admission.guardian_name || "",
    guardianPhone: admission.guardian_phone || "",
    guardianEmail: admission.guardian_email || "",
    notes: admission.notes || "",
    sourcePage: admission.source_page || "Admissions",
    status: admission.status || "new",
    createdAt: admission.created_at || nowIso,

    // Legacy Apps Script contract aliases:
    submittedAt: admission.created_at || nowIso,
    formType: admission.submission_kind === "demo" ? "Free Demo" : admission.application_type,
    fullName: admission.student_name,
    whatsapp: admission.phone,
    grade: admission.education_level,
    courseType: admission.application_type,
    selected: admission.selected_program_title,
    goal: admission.learning_goal || "",
    classType: admission.learning_preference || "",
    message: admission.notes || "",
  };

  let lastErrorSummary = "Unknown mirror failure";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Status 429 or 5xx indicates transient server issue; retry if attempts remain
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        lastErrorSummary = `Google Apps Script returned HTTP ${response.status}`;
        await new Promise((r) => setTimeout(r, (attempt + 1) * 350));
        continue;
      }

      if (!response.ok && response.status !== 302) {
        return {
          status: "failed",
          errorSummary: sanitizeIntegrationError(
            `Google Apps Script returned HTTP ${response.status}`,
          ),
        };
      }

      // Parse JSON body for Google Apps Script Webhook v2 contract
      let jsonBody: {
        ok?: boolean;
        duplicate?: boolean;
        error?: string;
        sheet?: { status?: "success" | "failed" };
        adminEmail?: { status?: "success" | "failed" | "skipped" };
        learnerEmail?: {
          status?: "success" | "failed" | "skipped";
          recipientType?: "learner" | "guardian";
        };
      };

      try {
        jsonBody = (await response.json()) as {
          ok?: boolean;
          duplicate?: boolean;
          error?: string;
          sheet?: { status?: "success" | "failed" };
          adminEmail?: { status?: "success" | "failed" | "skipped" };
          learnerEmail?: {
            status?: "success" | "failed" | "skipped";
            recipientType?: "learner" | "guardian";
          };
        };
      } catch {
        return {
          status: "failed",
          errorSummary: "Invalid non-JSON response from Google Apps Script Webhook",
        };
      }

      if (jsonBody && jsonBody.ok === false) {
        return {
          status: "failed",
          errorSummary: sanitizeIntegrationError(jsonBody.error || "Webhook returned ok: false"),
        };
      }

      const isDuplicate = Boolean(jsonBody?.duplicate);
      const sheetStatus = (jsonBody?.sheet?.status as "success" | "failed") || "success";
      const adminEmailStatus =
        (jsonBody?.adminEmail?.status as "success" | "failed" | "skipped") || "success";
      const learnerEmailStatus =
        (jsonBody?.learnerEmail?.status as "success" | "failed" | "skipped") || undefined;
      const learnerRecipientType =
        (jsonBody?.learnerEmail?.recipientType as "learner" | "guardian") || undefined;

      return {
        status: "success",
        duplicate: isDuplicate,
        sheetStatus,
        adminEmailStatus,
        learnerEmailStatus,
        learnerRecipientType,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      lastErrorSummary = sanitizeIntegrationError(err);
      if (attempt < maxRetries) {
        // Wait exponential backoff before next attempt
        await new Promise((r) => setTimeout(r, (attempt + 1) * 350));
      }
    }
  }

  console.warn(
    "Server Google Sheets mirror failed after retries (secondary integration):",
    lastErrorSummary,
  );
  return {
    status: "failed",
    errorSummary: lastErrorSummary,
  };
}
