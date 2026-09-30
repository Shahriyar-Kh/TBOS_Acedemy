// Admissions persistence architecture for TechBuilt Open School:
//   Primary: Supabase / PostgreSQL via secure server endpoint (/api/admissions)
//   Secondary: Google Apps Script / Google Sheets as best-effort backup mirror

import {
  type ApplicationType,
  applicationTypeOptions,
  educationLevelOptions,
  learningPreferenceOptions,
} from "./programs";

export type FormType =
  | ApplicationType
  | "Academic Subject"
  | "Tutor Service"
  | "Other Inquiry"
  | "Free Demo"
  | "Contact";

export interface SubmissionPayload {
  submissionType: "application" | "demo" | "contact";
  applicationType: string;
  selectedProgram: string;
  studentName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  age?: string;
  educationLevel?: string;
  institution?: string;
  skillLevel?: string;
  learningGoal?: string;
  learningPreference?: string;
  preferredDays?: string;
  preferredTime?: string;
  timezone?: string;
  classesPerWeek?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  notes?: string;
  sourcePage: string;
  // Honeypot — must remain empty (spam protection)
  company?: string;

  // Backwards-compatible aliases for existing Google Sheet / Apps Script integration:
  formType?: string;
  fullName?: string;
  whatsapp?: string;
  grade?: string;
  courseType?: string;
  selected?: string;
  goal?: string;
  classType?: string;
  message?: string;
}

const GOOGLE_SCRIPT_ENDPOINT = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined;

export type SubmitResult = { ok: boolean; referenceId?: string; error?: string };

/**
 * Secondary best-effort mirror to Google Sheets via Google Apps Script.
 * Failures here NEVER cause user-facing submission errors or revert database records.
 */
async function mirrorToGoogleSheets(payload: SubmissionPayload): Promise<void> {
  if (!GOOGLE_SCRIPT_ENDPOINT) {
    return;
  }

  try {
    const body = {
      ...payload,
      fullName: payload.fullName || payload.studentName,
      whatsapp: payload.whatsapp || payload.phone,
      grade: payload.grade || payload.educationLevel || "",
      courseType: payload.courseType || payload.applicationType,
      selected: payload.selected || payload.selectedProgram,
      classType: payload.classType || payload.learningPreference || "",
      goal: payload.goal || payload.learningGoal || "",
      message: payload.message || payload.notes || "",
      submittedAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    await fetch(GOOGLE_SCRIPT_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("Secondary Google Sheets mirror failed (best-effort):", err);
  }
}

/**
 * Universal submission handler:
 * 1. Submits to primary Supabase server endpoint (/api/admissions)
 * 2. On confirmed database success, fires best-effort Google Sheets mirror
 */
export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  // Honeypot spam check
  if (payload.company && payload.company.trim() !== "") {
    return { ok: true, referenceId: "TBOS-OK" };
  }

  // Admissions and Free Demo flows route through the primary Supabase endpoint
  if (payload.submissionType === "application" || payload.submissionType === "demo") {
    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKind: payload.submissionType,
          applicationType: payload.applicationType,
          selectedProgram: payload.selectedProgram,
          studentName: payload.studentName,
          email: payload.email,
          phone: payload.phone,
          country: payload.country,
          city: payload.city,
          age: payload.age,
          educationLevel: payload.educationLevel,
          institution: payload.institution,
          skillLevel: payload.skillLevel,
          learningGoal: payload.learningGoal,
          learningPreference: payload.learningPreference,
          preferredDays: payload.preferredDays,
          preferredTime: payload.preferredTime,
          timezone: payload.timezone,
          guardianName: payload.guardianName,
          guardianPhone: payload.guardianPhone,
          guardianEmail: payload.guardianEmail,
          notes: payload.notes,
          sourcePage: payload.sourcePage,
          company: payload.company,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        referenceId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        return {
          ok: false,
          error:
            data.error ||
            (payload.submissionType === "demo"
              ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
              : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp."),
        };
      }

      // Supabase insertion succeeded! Trigger secondary Google Sheets mirror in background (best-effort)
      mirrorToGoogleSheets(payload).catch(() => {});

      return {
        ok: true,
        referenceId: data.referenceId,
      };
    } catch (err) {
      console.error("Admissions server request failed:", err);
      return {
        ok: false,
        error:
          payload.submissionType === "demo"
            ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
            : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.",
      };
    }
  }

  // Fallback for contact inquiries: trigger mirror directly
  await mirrorToGoogleSheets(payload);
  return { ok: true };
}

export const courseTypeOptions = applicationTypeOptions;
export const gradeOptions = educationLevelOptions;
export const classTypeOptions = learningPreferenceOptions;
