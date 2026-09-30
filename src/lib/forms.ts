// Form submission flow for TechBuilt Open School.
//
// Submissions are sent to a Google Apps Script Web App endpoint, which:
//   1. Appends the data as a row in a Google Sheet (with timestamp)
//   2. Sends a Gmail notification to the academy inbox
//
// Set the deployed Apps Script URL in your environment as:
//   VITE_GOOGLE_SCRIPT_URL
// See GOOGLE_INTEGRATION.md in the project root for the full setup.
//
// Phase 5 will add Supabase persistence as the primary storage layer.

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

const ENDPOINT = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined;

export type SubmitResult = { ok: boolean; error?: string };

export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  // Spam protection: silently drop if honeypot is filled.
  if (payload.company && payload.company.trim() !== "") {
    return { ok: true };
  }

  // Populate legacy field names alongside normalized names for 100% sheet compatibility
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

  if (!ENDPOINT) {
    console.info(
      "VITE_GOOGLE_SCRIPT_URL is not set. Submission accepted locally (ready for Google Sheets / Supabase).",
    );
    return { ok: true };
  }

  try {
    // text/plain avoids a CORS preflight against Apps Script.
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    // With no-cors we cannot read the response body; assume network dispatch success.
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Something went wrong. Please try again or use WhatsApp.",
    };
  }
}

export const courseTypeOptions = applicationTypeOptions;
export const gradeOptions = educationLevelOptions;
export const classTypeOptions = learningPreferenceOptions;
