import { z } from "zod";
import {
  type ApplicationType,
  getAllProgramOptions,
  isMinorLearner,
  normalizeApplicationType,
} from "./programs";

export const admissionsSubmissionSchema = z.object({
  submissionKind: z.enum(["application", "demo"]),
  applicationType: z.string().min(1, "Application category is required"),
  selectedProgram: z.string().trim().min(2, "Program or course name is required").max(160),
  selectedProgramSlug: z.string().trim().max(100).optional().or(z.literal("")),
  selectedProgramCategory: z.string().trim().max(100).optional().or(z.literal("")),

  studentName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Valid email address is required").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Valid phone/WhatsApp number is required")
    .max(25)
    .regex(/^[+0-9\s-]+$/, "Use digits, +, spaces, or dashes only"),
  country: z.string().trim().min(2, "Country is required").max(60),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  age: z
    .string()
    .trim()
    .max(3)
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && Number.isInteger(num) && num >= 4 && num <= 100;
      },
      { message: "Please enter a valid age between 4 and 100" },
    ),
  educationLevel: z.string().min(1, "Education level is required"),
  institution: z.string().trim().max(120).optional().or(z.literal("")),
  skillLevel: z.string().trim().max(100).optional().or(z.literal("")),

  learningGoal: z.string().trim().max(500).optional().or(z.literal("")),
  learningPreference: z.string().trim().max(100).optional().or(z.literal("")),

  preferredDays: z.string().trim().max(100).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(100).optional().or(z.literal("")),
  timezone: z.string().trim().max(60).optional().or(z.literal("")),

  guardianName: z.string().trim().max(100).optional().or(z.literal("")),
  guardianPhone: z.string().trim().max(25).optional().or(z.literal("")),
  guardianEmail: z.string().trim().max(255).optional().or(z.literal("")),

  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  sourcePage: z.string().trim().max(100).optional().or(z.literal("")),
  // Honeypot field: bounded optional string so bots don't fail Zod parsing
  company: z.string().trim().max(100).optional().or(z.literal("")),
});

export type AdmissionsSubmissionInput = z.infer<typeof admissionsSubmissionSchema>;

export interface AdmissionsApiResponse {
  ok: boolean;
  referenceId?: string;
  error?: string;
}

export interface ResolvedProgramResult {
  valid: boolean;
  applicationType: ApplicationType;
  selectedProgramTitle: string;
  selectedProgramSlug: string | null;
  selectedProgramCategory: string | null;
  error?: string;
}

/**
 * Validates selected program against real repository catalog data
 * and resolves program metadata while strictly maintaining the normalized application_type.
 */
export function resolveAndValidateProgram(
  selectedProgram: string,
  rawAppType?: string,
): ResolvedProgramResult {
  const normAppType = normalizeApplicationType(rawAppType);
  const cleanName = (selectedProgram ?? "").trim();
  const lowerName = cleanName.toLowerCase();

  // Special Case 1: General Admissions Inquiry (no specific catalog program required)
  if (normAppType === "General Admissions Inquiry") {
    return {
      valid: true,
      applicationType: normAppType,
      selectedProgramTitle: cleanName || "General Admissions Inquiry",
      selectedProgramSlug: null,
      selectedProgramCategory: "General Inquiry",
    };
  }

  // Special Case 2: One-to-One Learning without specific course requirement
  if (normAppType === "One-to-One Learning") {
    if (
      !cleanName ||
      lowerName === "one-to-one learning" ||
      lowerName === "1-on-1 tutoring" ||
      lowerName === "general one-to-one inquiry" ||
      lowerName === "tutor service"
    ) {
      return {
        valid: true,
        applicationType: normAppType,
        selectedProgramTitle: cleanName || "One-to-One Learning",
        selectedProgramSlug: null,
        selectedProgramCategory: "Personalized Tutoring",
      };
    }
  }

  const all = getAllProgramOptions();

  // Match against real catalog entries
  const found = all.find(
    (p) =>
      p.value.toLowerCase() === lowerName ||
      p.label.toLowerCase() === lowerName ||
      (p.slug && p.slug.toLowerCase() === lowerName) ||
      (lowerName.includes(p.value.toLowerCase()) && p.value.length > 3),
  );

  if (found) {
    return {
      valid: true,
      applicationType: normAppType,
      selectedProgramTitle: found.value,
      selectedProgramSlug: found.slug ?? null,
      selectedProgramCategory: found.group,
    };
  }

  // Allow custom learning requirements for One-to-One Learning inquiries
  if (normAppType === "One-to-One Learning" && cleanName.length >= 3) {
    return {
      valid: true,
      applicationType: normAppType,
      selectedProgramTitle: cleanName,
      selectedProgramSlug: null,
      selectedProgramCategory: "Personalized Tutoring",
    };
  }

  // Catalog-tied application types must match an actual offering in the repository
  return {
    valid: false,
    applicationType: normAppType,
    selectedProgramTitle: cleanName,
    selectedProgramSlug: null,
    selectedProgramCategory: null,
    error: `Please select a valid program or course from our catalog for ${normAppType}.`,
  };
}

/**
 * Server-side domain validation rules
 */
export function validateAdmissionsPayload(
  payload: AdmissionsSubmissionInput,
): { valid: true } | { valid: false; error: string } {
  // 1. Minor / Guardian requirement check
  const isMinor = isMinorLearner(payload.age, payload.educationLevel, payload.selectedProgram);
  if (isMinor) {
    if (!payload.guardianName || payload.guardianName.trim().length < 2) {
      return {
        valid: false,
        error: "Parent or guardian name is required for learners under 18.",
      };
    }
    if (!payload.guardianPhone || payload.guardianPhone.trim().length < 7) {
      return {
        valid: false,
        error: "Parent or guardian contact number is required for learners under 18.",
      };
    }
  }

  // 2. Demo schedule preference check
  if (payload.submissionKind === "demo") {
    if (!payload.preferredDays || payload.preferredDays.trim().length === 0) {
      return {
        valid: false,
        error: "Please specify preferred day(s) for the trial demo.",
      };
    }
    if (!payload.preferredTime || payload.preferredTime.trim().length === 0) {
      return {
        valid: false,
        error: "Please specify a preferred time window for the trial demo.",
      };
    }
  }

  return { valid: true };
}
