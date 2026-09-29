// Form submission flow for TechBuilt Open School.
//
// Submissions are sent to a Google Apps Script Web App endpoint, which:
//   1. Appends the data as a row in a Google Sheet (with timestamp)
//   2. Sends a Gmail notification to the academy inbox
//
// Set the deployed Apps Script URL in your environment as:
//   VITE_GOOGLE_SCRIPT_URL
// See GOOGLE_INTEGRATION.md in the project root for the full setup
// (Google Sheet structure + ready-to-paste Apps Script code).

export type FormType =
  | "Single Course"
  | "Specialization"
  | "Academic Subject"
  | "Tutor Service"
  | "Other Inquiry"
  | "Contact";

export type SubmissionPayload = {
  formType: FormType;
  sourcePage: string;
  fullName: string;
  guardianName?: string;
  email: string;
  whatsapp: string;
  country?: string;
  city?: string;
  grade?: string;
  courseType?: string;
  selected?: string;
  goal?: string;
  preferredTime?: string;
  classType?: string;
  message?: string;
  // Honeypot — must remain empty (spam protection)
  company?: string;
};

const ENDPOINT = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined;

export type SubmitResult = { ok: boolean; error?: string };

export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  // Spam protection: silently drop if honeypot is filled.
  if (payload.company && payload.company.trim() !== "") {
    return { ok: true };
  }

  const body = {
    ...payload,
    submittedAt: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };

  if (!ENDPOINT) {
    // Endpoint not configured yet — fail gracefully with guidance.
    console.warn(
      "VITE_GOOGLE_SCRIPT_URL is not set. Configure it to enable Google Sheets + Gmail delivery.",
    );
    return {
      ok: false,
      error:
        "Form delivery is not configured yet. Please add your Google Apps Script URL (VITE_GOOGLE_SCRIPT_URL).",
    };
  }

  try {
    // text/plain avoids a CORS preflight against Apps Script.
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    // With no-cors we cannot read the response; assume success if no network error.
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
    };
  }
}

export const courseTypeOptions = [
  "Single Course",
  "Specialization",
  "Academic Subject",
  "Tutor Service",
  "Other Inquiry",
] as const;

export const classTypeOptions = ["One-to-one", "Group", "Online (flexible)"] as const;

export const gradeOptions = [
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10 / Matric",
  "Grade 11 / 1st Year",
  "Grade 12 / 2nd Year",
  "O Level",
  "A Level",
  "Bachelor's / University",
  "Master's / MS",
  "Other / Adult learner",
] as const;
