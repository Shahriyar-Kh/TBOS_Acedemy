import { z } from "zod";

export const CRM_STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { value: "contacted", label: "Contacted", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { value: "qualified", label: "Qualified", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
  { value: "demo_requested", label: "Demo Requested", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { value: "demo_scheduled", label: "Demo Scheduled", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  { value: "demo_completed", label: "Demo Completed", color: "bg-teal-500/10 text-teal-600 border-teal-200" },
  { value: "enrolled", label: "Enrolled", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { value: "closed", label: "Closed", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
] as const;

export type CrmStatus = (typeof CRM_STATUS_OPTIONS)[number]["value"];

export const adminAdmissionsPatchSchema = z
  .object({
    status: z
      .enum([
        "new",
        "contacted",
        "qualified",
        "demo_requested",
        "demo_scheduled",
        "demo_completed",
        "enrolled",
        "closed",
      ])
      .optional(),
    adminNotes: z
      .string()
      .max(5000, "Admin notes cannot exceed 5000 characters")
      .optional()
      .nullable(),
    nextFollowUpAt: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          return !isNaN(Date.parse(val));
        },
        { message: "Invalid date format for follow-up" },
      ),
    demoScheduledAt: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          return !isNaN(Date.parse(val));
        },
        { message: "Invalid date format for demo schedule" },
      ),
    demoMeetingLink: z
      .string()
      .max(500, "Meeting link cannot exceed 500 characters")
      .optional()
      .nullable(),
    lastContactedAt: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          return !isNaN(Date.parse(val));
        },
        { message: "Invalid date format for last contacted timestamp" },
      ),
    closedReason: z
      .string()
      .max(500, "Closed reason cannot exceed 500 characters")
      .optional()
      .nullable(),
  })
  .strict(); // Rejects arbitrary database columns

export type AdminAdmissionsPatchInput = z.infer<typeof adminAdmissionsPatchSchema>;

export function getFollowUpStatus(dateStr?: string | null): {
  label: "Overdue" | "Due Soon" | "Upcoming" | "None";
  badgeClass: string;
} {
  if (!dateStr) {
    return { label: "None", badgeClass: "text-muted-foreground" };
  }

  const target = new Date(dateStr).getTime();
  if (isNaN(target)) {
    return { label: "None", badgeClass: "text-muted-foreground" };
  }

  const now = Date.now();
  const diffHours = (target - now) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return { label: "Overdue", badgeClass: "bg-red-500/10 text-red-600 border-red-200" };
  }
  if (diffHours <= 24) {
    return { label: "Due Soon", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-200" };
  }
  return { label: "Upcoming", badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200" };
}
