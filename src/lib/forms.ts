// Admissions persistence architecture for TechBuilt Open School:
//   Primary: Supabase / PostgreSQL via secure server endpoint (/api/admissions)
//   Secondary: Google Apps Script / Google Sheets server mirror (via /api/admissions)

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
  submissionType?: "application" | "demo" | "contact";
  applicationType?: string;
  selectedProgram?: string;
  studentName?: string;
  email: string;
  phone?: string;
  country?: string;
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

  // Backwards-compatible aliases:
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

export type SubmitResult = { ok: boolean; referenceId?: string; error?: string };

/**
 * Universal submission handler:
 * Routes all admissions, demo, and contact inquiries through the primary server
 * endpoint (/api/admissions), where Supabase persists the primary record and then
 * orchestrates secondary notifications and Google Sheets server mirroring.
 */
export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  // Honeypot spam check
  if (payload.company && payload.company.trim() !== "") {
    return { ok: true, referenceId: "TBOS-OK" };
  }

  const isDemo = payload.submissionType === "demo" || payload.formType === "Free Demo";
  const studentName = (payload.studentName || payload.fullName || "").trim();
  const phone = (payload.phone || payload.whatsapp || "").trim();
  const applicationType = (payload.applicationType || payload.courseType || "General Admissions Inquiry").trim();
  const selectedProgram = (payload.selectedProgram || payload.selected || "General Admissions Inquiry").trim();
  const educationLevel = (payload.educationLevel || payload.grade || "Other / Not Specified").trim();
  const country = (payload.country || "Pakistan").trim();
  const notes = (payload.notes || payload.message || "").trim();

  try {
    const response = await fetch("/api/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionKind: isDemo ? "demo" : "application",
        applicationType,
        selectedProgram,
        studentName,
        email: payload.email.trim(),
        phone,
        country,
        city: payload.city?.trim() || "",
        age: payload.age?.trim() || "",
        educationLevel,
        institution: payload.institution?.trim() || "",
        skillLevel: payload.skillLevel?.trim() || "",
        learningGoal: (payload.learningGoal || payload.goal)?.trim() || "",
        learningPreference: (payload.learningPreference || payload.classType)?.trim() || "",
        preferredDays: payload.preferredDays?.trim() || "",
        preferredTime: payload.preferredTime?.trim() || "",
        timezone: payload.timezone?.trim() || "",
        guardianName: payload.guardianName?.trim() || "",
        guardianPhone: payload.guardianPhone?.trim() || "",
        guardianEmail: payload.guardianEmail?.trim() || "",
        notes,
        sourcePage: payload.sourcePage,
        company: payload.company || "",
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
          (isDemo
            ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
            : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp."),
      };
    }

    return {
      ok: true,
      referenceId: data.referenceId,
    };
  } catch (err) {
    console.error("Admissions server request failed:", err);
    return {
      ok: false,
      error: isDemo
        ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
        : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.",
    };
  }
}

export const courseTypeOptions = applicationTypeOptions;
export const gradeOptions = educationLevelOptions;
export const classTypeOptions = learningPreferenceOptions;
