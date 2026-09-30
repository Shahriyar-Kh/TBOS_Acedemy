import { courses } from "@/data/courses";
import { specializations } from "@/data/specializations";
import { liveOffers } from "@/data/liveOffers";
import { tutoringSubjects } from "@/data/tutoring";

export type ApplicationType =
  | "Single Course"
  | "Specialization"
  | "Live Group Offer"
  | "Academic Tutoring"
  | "Quran & Islamic Studies"
  | "One-to-One Learning"
  | "General Admissions Inquiry";

export const applicationTypeOptions: readonly ApplicationType[] = [
  "Single Course",
  "Specialization",
  "Live Group Offer",
  "Academic Tutoring",
  "Quran & Islamic Studies",
  "One-to-One Learning",
  "General Admissions Inquiry",
] as const;

export const educationLevelOptions = [
  "Grade 5-8 (Middle School)",
  "Grade 9-10 / Matric / O-Level",
  "Grade 11-12 / Inter / A-Level",
  "Undergraduate / University Student",
  "Graduated / Working Professional",
  "Parent inquiring for child",
  "Self-Taught / Other",
] as const;

export const learningPreferenceOptions = [
  "One-to-One (Personalized Private Tuition)",
  "Small Group Batch (3-8 Students)",
  "Flexible / Need Admissions Guidance",
] as const;

export const preferredDaysOptions = [
  "Flexible / Any Day",
  "Weekdays (Mon - Fri)",
  "Weekends (Sat - Sun)",
  "Mon / Wed / Fri",
  "Tue / Thu / Sat",
  "Specific Days (Mention in Notes)",
] as const;

export const preferredTimeOptions = [
  "Flexible / Let Admissions Suggest",
  "Morning (9:00 AM - 12:00 PM PKT)",
  "Afternoon (12:00 PM - 5:00 PM PKT)",
  "Evening (5:00 PM - 9:00 PM PKT)",
  "Night (9:00 PM - 12:00 AM PKT)",
] as const;

export const skillLevelOptions = [
  "Complete Beginner (No prior experience)",
  "Beginner (Basic concepts only)",
  "Intermediate (Some practical practice)",
  "Advanced (Looking for deep dive)",
] as const;

export const classesPerWeekOptions = [
  "Flexible / Recommend for my goal",
  "2 Classes / Week",
  "3 Classes / Week",
  "4 Classes / Week",
  "Daily (Mon - Fri)",
] as const;

export interface ProgramOption {
  label: string;
  value: string;
  group: ApplicationType;
  slug?: string;
}

/**
 * Normalizes query string or legacy formType values into a standard ApplicationType
 */
export function normalizeApplicationType(raw?: string | null): ApplicationType {
  if (!raw) return "Single Course";

  const clean = raw.trim().toLowerCase();

  if (
    clean === "academic tutoring" ||
    clean === "academic subject" ||
    clean === "academic" ||
    clean === "mathematics" ||
    clean === "physics"
  ) {
    return "Academic Tutoring";
  }

  if (
    clean === "quran & islamic studies" ||
    clean === "quran tutoring" ||
    clean === "quran" ||
    clean === "islamic studies" ||
    clean === "tajweed"
  ) {
    return "Quran & Islamic Studies";
  }

  if (
    clean === "live group offer" ||
    clean === "live batch" ||
    clean === "live-batch" ||
    clean === "live-group-offer" ||
    clean === "live offer" ||
    clean === "cohort"
  ) {
    return "Live Group Offer";
  }

  if (
    clean === "specialization" ||
    clean === "career track" ||
    clean === "career-track"
  ) {
    return "Specialization";
  }

  if (
    clean === "single course" ||
    clean === "course" ||
    clean === "technical course" ||
    clean === "programming"
  ) {
    return "Single Course";
  }

  if (
    clean === "one-to-one learning" ||
    clean === "one-to-one" ||
    clean === "1-on-1" ||
    clean === "tutor service" ||
    clean === "tutor" ||
    clean === "tutoring"
  ) {
    return "One-to-One Learning";
  }

  if (
    clean === "general admissions inquiry" ||
    clean === "general" ||
    clean === "inquiry" ||
    clean === "other inquiry" ||
    clean === "contact"
  ) {
    return "General Admissions Inquiry";
  }

  // Exact match attempt
  const found = applicationTypeOptions.find(
    (opt) => opt.toLowerCase() === clean,
  );
  if (found) return found;

  return "Single Course";
}

/**
 * Compiles all active programs, courses, specializations, and tutoring subjects
 * into a single unified list for dropdowns and auto-suggest.
 */
export function getAllProgramOptions(): ProgramOption[] {
  const options: ProgramOption[] = [];

  // Live Group Offers
  liveOffers
    .filter((o) => o.status === "active")
    .forEach((o) => {
      options.push({
        label: `${o.title} (Live Batch)`,
        value: o.title,
        group: "Live Group Offer",
        slug: o.slug,
      });
    });

  // Specializations
  specializations.forEach((s) => {
    options.push({
      label: `${s.title} Specialization (${s.duration})`,
      value: `${s.title} Specialization`,
      group: "Specialization",
      slug: s.slug,
    });
  });

  // Technical Courses
  courses.forEach((c) => {
    options.push({
      label: `${c.title} (${c.category})`,
      value: c.title,
      group: "Single Course",
      slug: c.slug,
    });
  });

  // Tutoring Subjects
  tutoringSubjects.forEach((t) => {
    const group: ApplicationType =
      t.category === "Quran & Islamic Studies"
        ? "Quran & Islamic Studies"
        : "Academic Tutoring";
    options.push({
      label: `${t.title} (${t.level})`,
      value: `${t.title} Tutoring`,
      group,
      slug: t.slug,
    });
  });

  return options;
}

/**
 * Minor detection rule:
 * Learners < 18, school grades 5-10, or youth-focused programs
 * require/strongly prompt parent or guardian contact details.
 */
export function isMinorLearner(
  age?: string | null,
  educationLevel?: string | null,
  programOrCourse?: string | null,
): boolean {
  if (age) {
    const parsedAge = parseInt(age.trim(), 10);
    if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 18) {
      return true;
    }
  }

  if (educationLevel) {
    const edu = educationLevel.toLowerCase();
    if (
      edu.includes("grade 5") ||
      edu.includes("grade 6") ||
      edu.includes("grade 7") ||
      edu.includes("grade 8") ||
      edu.includes("grade 9") ||
      edu.includes("grade 10") ||
      edu.includes("middle school") ||
      edu.includes("matric") ||
      edu.includes("o-level") ||
      edu.includes("parent inquiring")
    ) {
      return true;
    }
  }

  if (programOrCourse) {
    const prog = programOrCourse.toLowerCase();
    if (
      prog.includes("young developer") ||
      prog.includes("junior") ||
      prog.includes("kids") ||
      prog.includes("grade 5") ||
      prog.includes("grade 6") ||
      prog.includes("grade 7") ||
      prog.includes("grade 8") ||
      prog.includes("grade 9") ||
      prog.includes("grade 10")
    ) {
      return true;
    }
  }

  return false;
}
