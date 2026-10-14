import crypto from "node:crypto";
import { getSupabaseServerClient } from "./supabase.server";

// ==============================================================================
// Domain Entity Interfaces
// ==============================================================================

export interface StudentRecord {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  country: string;
  city?: string | null;
  timezone: string;
  status: "active" | "trial" | "paused" | "on_hold" | "completed" | "dropped" | "cancelled";
  enrollment_date: string;
  billing_day: number;
  notes?: string | null;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchRecord {
  id: string;
  name: string;
  program_slug: string;
  program_title: string;
  program_type: "live_batch" | "specialization" | "course" | "tutoring";
  mode: "group" | "one_on_one";
  instructor_id?: string | null;
  instructor_name?: string | null;
  start_date?: string | null;
  expected_end_date?: string | null;
  days_of_week: string[];
  start_time?: string | null;
  end_time?: string | null;
  timezone: string;
  max_capacity: number;
  active_student_count: number;
  meeting_link?: string | null;
  status: "planned" | "enrolling" | "active" | "paused" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRecord {
  id: string;
  student_id: string;
  batch_id?: string | null;
  program_slug: string;
  program_title: string;
  program_type: string;
  instructor_id?: string | null;
  instructor_name?: string | null;
  agreed_fee: number;
  discount: number;
  billing_day: number;
  enrollment_date: string;
  schedule?: string | null;
  status: "active" | "paused" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeInvoiceRecord {
  id: string;
  invoice_number: string;
  student_id: string;
  enrollment_id?: string | null;
  billing_month: string; // YYYY-MM
  amount_due: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: "upcoming" | "due" | "partially_paid" | "paid" | "overdue" | "waived" | "refunded";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeePaymentRecord {
  id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: "bank_transfer" | "jazzcash" | "easypaisa" | "cash" | "other";
  reference_number?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
}

export interface ClassSessionRecord {
  id: string;
  batch_id?: string | null;
  enrollment_id?: string | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_link?: string | null;
  status: "scheduled" | "completed" | "rescheduled" | "cancelled" | "missed";
  topic_covered?: string | null;
  homework?: string | null;
  instructor_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassAttendanceRecord {
  id: string;
  class_session_id: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string | null;
  recorded_at: string;
}

export interface CrmTaskRecord {
  id: string;
  title: string;
  description?: string | null;
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string | null;
  related_type?: "lead" | "student" | "class" | "payment" | "other" | null;
  related_id?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmNotificationRecord {
  id: string;
  title: string;
  message: string;
  type: "new_application" | "demo_due" | "follow_up_due" | "class_soon" | "payment_due" | "reminder_failed" | "conflict" | "info";
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MessageLogRecord {
  id: string;
  channel: "email" | "whatsapp";
  recipient: string;
  recipient_name?: string | null;
  subject?: string | null;
  content: string;
  status: "sent" | "failed" | "prepared_link" | "skipped";
  error_message?: string | null;
  created_by?: string | null;
  created_at: string;
}

// ==============================================================================
// Identification Number Generators
// ==============================================================================

export function formatStudentId(sequence: number, year = new Date().getFullYear()): string {
  return `TBOS-${year}-${String(sequence).padStart(4, "0")}`;
}

export function formatInvoiceNumber(sequence: number, now = new Date()): string {
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${yearMonth}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Generates the next unique Student ID in format TBOS-YYYY-XXXX.
 */
export async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TBOS-${currentYear}-`;

  const { client } = getSupabaseServerClient();
  if (!client) {
    // Fallback safe random identifier if database client not ready
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const { count } = await client
    .from("students")
    .select("*", { count: "exact", head: true })
    .ilike("student_id", `${prefix}%`);

  const nextSeq = (count || 0) + 1;
  return formatStudentId(nextSeq, currentYear);
}

/**
 * Generates the next unique Invoice Number in format INV-YYYYMM-XXXX.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `INV-${yearMonth}-`;

  const { client } = getSupabaseServerClient();
  if (!client) {
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const { count } = await client
    .from("fee_invoices")
    .select("*", { count: "exact", head: true })
    .ilike("invoice_number", `${prefix}%`);

  const nextSeq = (count || 0) + 1;
  return formatInvoiceNumber(nextSeq, now);
}

// ==============================================================================
// Audit Trail Helper
// ==============================================================================

export async function logCrmAction(params: {
  adminUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  const { client } = getSupabaseServerClient();
  if (!client) return;

  try {
    await client.from("crm_audit_logs").insert({
      admin_user_id: params.adminUserId || null,
      actor_email: params.actorEmail || null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId || null,
      details: params.details || null,
    });
  } catch (err) {
    console.error("Failed to write CRM audit log:", err);
  }
}

// ==============================================================================
// Schedule Conflict Detection
// ==============================================================================

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: "instructor_overlap" | "batch_overlap";
    message: string;
    conflictingSessionId: string;
    conflictingTitle: string;
    time: string;
  }>;
}

export function isTimeWindowOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Checks for hard schedule clashes for a proposed session date and time window.
 */
export async function checkClassScheduleConflicts(params: {
  sessionDate: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  instructorId?: string | null;
  batchId?: string | null;
  excludeSessionId?: string | null;
}): Promise<ConflictCheckResult> {
  const { client } = getSupabaseServerClient();
  if (!client) return { hasConflict: false, conflicts: [] };

  const { data: existingSessions, error } = await client
    .from("class_sessions")
    .select("id, title, session_date, start_time, end_time, instructor_id, batch_id, status")
    .eq("session_date", params.sessionDate)
    .in("status", ["scheduled", "rescheduled"]);

  if (error || !existingSessions) {
    return { hasConflict: false, conflicts: [] };
  }

  const conflicts: ConflictCheckResult["conflicts"] = [];

  for (const session of existingSessions) {
    if (params.excludeSessionId && session.id === params.excludeSessionId) {
      continue;
    }

    // Time window overlap condition: (startA < endB) && (endA > startB)
    const overlaps = isTimeWindowOverlapping(
      params.startTime,
      params.endTime,
      session.start_time,
      session.end_time,
    );

    if (!overlaps) continue;

    // Check Instructor overlap
    if (params.instructorId && session.instructor_id && params.instructorId === session.instructor_id) {
      conflicts.push({
        type: "instructor_overlap",
        message: `Instructor is already teaching "${session.title}" (${session.start_time} - ${session.end_time}) on this date.`,
        conflictingSessionId: session.id,
        conflictingTitle: session.title,
        time: `${session.start_time} - ${session.end_time}`,
      });
    }

    // Check Batch overlap
    if (params.batchId && session.batch_id && params.batchId === session.batch_id) {
      conflicts.push({
        type: "batch_overlap",
        message: `Batch already has session "${session.title}" scheduled (${session.start_time} - ${session.end_time}) on this date.`,
        conflictingSessionId: session.id,
        conflictingTitle: session.title,
        time: `${session.start_time} - ${session.end_time}`,
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

// ==============================================================================
// Cryptographic Password Reset Tokens
// ==============================================================================

export function generatePasswordResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashPasswordResetToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

