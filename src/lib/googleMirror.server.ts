import { getServerConfig } from "./config.server";
import type { AdmissionsRequestRecord } from "./supabase.server";

export interface GoogleMirrorResult {
  status: "success" | "failed" | "skipped";
  errorSummary?: string | null;
}

/**
 * Server-side best-effort mirror to Google Sheets via Google Apps Script.
 * Failures here NEVER cause user-facing submission errors or revert database records.
 */
export async function mirrorToGoogleSheetsServer(
  admission: AdmissionsRequestRecord,
  referenceId?: string,
): Promise<GoogleMirrorResult> {
  const config = getServerConfig();
  const scriptUrl = config.googleScriptUrl;

  if (!scriptUrl) {
    return {
      status: "skipped",
      errorSummary: "GOOGLE_SCRIPT_URL not configured",
    };
  }

  const ref = referenceId || (admission.id ? `TBOS-${admission.id.slice(0, 8).toUpperCase()}` : "TBOS-NEW");
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

    // Legacy Apps Script contract aliases (from GOOGLE_INTEGRATION.md):
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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

    // Google Apps Script redirects or returns 200/302
    if (!response.ok && response.status !== 302) {
      return {
        status: "failed",
        errorSummary: `Google Apps Script returned HTTP ${response.status}`,
      };
    }

    return { status: "success" };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Server Google Sheets mirror failed (secondary integration):", errorMsg);
    return {
      status: "failed",
      errorSummary: errorMsg.slice(0, 200),
    };
  }
}
