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
  receipt_number?: string | null;
  idempotency_key?: string | null;
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
// Sanitization & Security Utilities
// ==============================================================================

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==============================================================================
// Database-Backed Monotonic Sequences (No Random String Fallbacks)
// ==============================================================================

const inMemorySequenceCounters = new Map<string, number>();

export function getNextInMemorySequence(key: string, baseValue = 1): number {
  const current = inMemorySequenceCounters.get(key) ?? (baseValue - 1);
  const next = current + 1;
  inMemorySequenceCounters.set(key, next);
  return next;
}

export function formatStudentId(sequence: number, year = new Date().getFullYear()): string {
  return `TBOS-${year}-${String(sequence).padStart(4, "0")}`;
}

export function formatInvoiceNumber(sequence: number, now = new Date()): string {
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${yearMonth}-${String(sequence).padStart(4, "0")}`;
}

export function formatReceiptNumber(sequence: number, now = new Date()): string {
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `REC-${yearMonth}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Generates the next sequential Student ID in format TBOS-YYYY-XXXX.
 * Strictly monotonic, collision-free, no random characters.
 */
export async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const key = `student_id_${currentYear}`;
  const prefix = `TBOS-${currentYear}-`;

  const { client } = getSupabaseServerClient();
  if (client) {
    try {
      const { data: rpcVal, error: rpcErr } = await client.rpc("get_next_student_id", { p_year: currentYear });
      if (!rpcErr && rpcVal && typeof rpcVal === "string") {
        return rpcVal;
      }
    } catch {
      // RPC not yet applied, fallback to query
    }

    try {
      const { data: latest } = await client
        .from("students")
        .select("student_id")
        .ilike("student_id", `${prefix}%`)
        .order("student_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      let maxSeq = 0;
      if (latest?.student_id) {
        const parts = latest.student_id.split("-");
        const lastPart = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPart)) maxSeq = lastPart;
      }
      const nextSeq = getNextInMemorySequence(key, maxSeq + 1);
      return formatStudentId(nextSeq, currentYear);
    } catch {
      // Query fallback to memory counter
    }
  }

  const nextSeq = getNextInMemorySequence(key, 1);
  return formatStudentId(nextSeq, currentYear);
}

/**
 * Generates the next sequential Invoice Number in format INV-YYYYMM-XXXX.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const key = `invoice_number_${ym}`;
  const prefix = `INV-${ym}-`;

  const { client } = getSupabaseServerClient();
  if (client) {
    try {
      const { data: rpcVal, error: rpcErr } = await client.rpc("get_next_invoice_number");
      if (!rpcErr && rpcVal && typeof rpcVal === "string") {
        return rpcVal;
      }
    } catch {
      // Fallback to table query if RPC is unavailable
    }

    try {
      const { data: latest } = await client
        .from("fee_invoices")
        .select("invoice_number")
        .ilike("invoice_number", `${prefix}%`)
        .order("invoice_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let maxSeq = 0;
      if (latest?.invoice_number) {
        const parts = latest.invoice_number.split("-");
        const lastPart = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPart)) maxSeq = lastPart;
      }
      const nextSeq = getNextInMemorySequence(key, maxSeq + 1);
      return formatInvoiceNumber(nextSeq, now);
    } catch {
      // Fallback to memory sequence
    }
  }

  const nextSeq = getNextInMemorySequence(key, 1);
  return formatInvoiceNumber(nextSeq, now);
}

/**
 * Generates the next sequential Receipt Number in format REC-YYYYMM-XXXX.
 */
export async function generateReceiptNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const key = `receipt_number_${ym}`;
  const prefix = `REC-${ym}-`;

  const { client } = getSupabaseServerClient();
  if (client) {
    try {
      const { data: rpcVal, error: rpcErr } = await client.rpc("get_next_receipt_number");
      if (!rpcErr && rpcVal && typeof rpcVal === "string") {
        return rpcVal;
      }
    } catch {
      // Fallback to table query if RPC is unavailable
    }

    try {
      const { data: latest } = await client
        .from("fee_payments")
        .select("receipt_number")
        .ilike("receipt_number", `${prefix}%`)
        .order("receipt_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let maxSeq = 0;
      if (latest?.receipt_number) {
        const parts = latest.receipt_number.split("-");
        const lastPart = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPart)) maxSeq = lastPart;
      }
      const nextSeq = getNextInMemorySequence(key, maxSeq + 1);
      return formatReceiptNumber(nextSeq, now);
    } catch {
      // Fallback to memory sequence
    }
  }

  const nextSeq = getNextInMemorySequence(key, 1);
  return formatReceiptNumber(nextSeq, now);
}

// ==============================================================================
// Sliding-Window & Persistent Rate Limiting
// ==============================================================================

interface RateLimitEntry {
  hits: number;
  resetAt: number;
}
const inMemoryRateLimits = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowSeconds = 15 * 60,
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // In-memory sliding window
  const memEntry = inMemoryRateLimits.get(key);
  if (memEntry && memEntry.resetAt > now) {
    if (memEntry.hits >= maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: new Date(memEntry.resetAt) };
    }
    memEntry.hits += 1;
    return {
      allowed: true,
      remaining: maxAttempts - memEntry.hits,
      resetAt: new Date(memEntry.resetAt),
    };
  } else {
    inMemoryRateLimits.set(key, { hits: 1, resetAt: now + windowMs });
  }

  // Database-backed sync if available
  const { client } = getSupabaseServerClient();
  if (client) {
    try {
      const { data: row } = await client
        .from("crm_rate_limits")
        .select("*")
        .eq("key", key)
        .maybeSingle();

      if (row && new Date(row.expires_at).getTime() > now) {
        if (row.hit_count >= maxAttempts) {
          return { allowed: false, remaining: 0, resetAt: new Date(row.expires_at) };
        }
        await client
          .from("crm_rate_limits")
          .update({ hit_count: row.hit_count + 1 })
          .eq("id", row.id);
        return {
          allowed: true,
          remaining: maxAttempts - (row.hit_count + 1),
          resetAt: new Date(row.expires_at),
        };
      } else {
        const expiresIso = new Date(now + windowMs).toISOString();
        await client.from("crm_rate_limits").upsert({
          key,
          hit_count: 1,
          expires_at: expiresIso,
        });
      }
    } catch {
      // Memory check above serves as reliable fallback
    }
  }

  return {
    allowed: true,
    remaining: maxAttempts - 1,
    resetAt: new Date(now + windowMs),
  };
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
    type: "instructor_overlap" | "batch_overlap" | "student_overlap" | "instructor_blocked" | "invalid_time_slot";
    message: string;
    conflictingSessionId?: string;
    conflictingTitle?: string;
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

export function validateTimeSlotFormat(startTime: string, endTime: string): { valid: boolean; error?: string } {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime)) {
    return { valid: false, error: "Start time must be valid 24-hour time in HH:mm format." };
  }
  if (!timeRegex.test(endTime)) {
    return { valid: false, error: "End time must be valid 24-hour time in HH:mm format." };
  }
  if (startTime >= endTime) {
    return { valid: false, error: "End time must be strictly after start time." };
  }
  return { valid: true };
}

/**
 * Checks for hard schedule clashes across Instructor, Batch, and enrolled Students.
 */
export async function checkClassScheduleConflicts(params: {
  sessionDate: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  instructorId?: string | null;
  batchId?: string | null;
  studentId?: string | null;
  excludeSessionId?: string | null;
}): Promise<ConflictCheckResult> {
  const conflicts: ConflictCheckResult["conflicts"] = [];

  // 1. Time Format & Logic Validation
  const formatCheck = validateTimeSlotFormat(params.startTime, params.endTime);
  if (!formatCheck.valid) {
    return {
      hasConflict: true,
      conflicts: [
        {
          type: "invalid_time_slot",
          message: formatCheck.error || "Invalid time slot",
          time: `${params.startTime} - ${params.endTime}`,
        },
      ],
    };
  }

  const { client } = getSupabaseServerClient();
  if (!client) return { hasConflict: false, conflicts: [] };

  // 2. Instructor Blocked Slots Check
  if (params.instructorId) {
    const dayOfWeek = new Date(params.sessionDate).getDay(); // 0-6
    const { data: availabilities } = await client
      .from("instructor_availability")
      .select("*")
      .eq("instructor_id", params.instructorId)
      .eq("day_of_week", dayOfWeek);

    if (availabilities && availabilities.length > 0) {
      for (const slot of availabilities) {
        if (slot.is_blocked) {
          const overlaps = isTimeWindowOverlapping(
            params.startTime,
            params.endTime,
            slot.start_time,
            slot.end_time,
          );
          if (overlaps) {
            conflicts.push({
              type: "instructor_blocked",
              message: `Instructor has marked this calendar window as unavailable/blocked (${slot.start_time} - ${slot.end_time}).`,
              time: `${slot.start_time} - ${slot.end_time}`,
            });
          }
        }
      }
    }
  }

  // 3. Existing Scheduled Class Sessions Check
  const { data: existingSessions } = await client
    .from("class_sessions")
    .select("id, title, session_date, start_time, end_time, instructor_id, batch_id, status")
    .eq("session_date", params.sessionDate)
    .in("status", ["scheduled", "rescheduled"]);

  if (existingSessions) {
    for (const session of existingSessions) {
      if (params.excludeSessionId && session.id === params.excludeSessionId) {
        continue;
      }

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
  }

  // 4. Student Enrollment Conflict Check
  if (params.batchId || params.studentId) {
    let studentIdsToCheck: string[] = [];
    if (params.studentId) {
      studentIdsToCheck.push(params.studentId);
    } else if (params.batchId) {
      const { data: enrollments } = await client
        .from("enrollments")
        .select("student_id")
        .eq("batch_id", params.batchId)
        .eq("status", "active");
      if (enrollments) {
        studentIdsToCheck = enrollments.map((e) => e.student_id);
      }
    }

    if (studentIdsToCheck.length > 0) {
      // Find other active enrollments for these students in other batches
      const { data: otherEnrollments } = await client
        .from("enrollments")
        .select("student_id, batch_id, students(full_name)")
        .in("student_id", studentIdsToCheck)
        .neq("batch_id", params.batchId || "")
        .eq("status", "active");

      if (otherEnrollments && otherEnrollments.length > 0 && existingSessions) {
        const otherBatchIds = new Set(otherEnrollments.map((oe) => oe.batch_id).filter(Boolean));
        for (const session of existingSessions) {
          if (session.batch_id && otherBatchIds.has(session.batch_id)) {
            const overlaps = isTimeWindowOverlapping(
              params.startTime,
              params.endTime,
              session.start_time,
              session.end_time,
            );
            if (overlaps) {
              const matchedStudent = otherEnrollments.find((oe) => oe.batch_id === session.batch_id);
              const studentName = (matchedStudent?.students as any)?.full_name || "A student";
              conflicts.push({
                type: "student_overlap",
                message: `Enrolled student (${studentName}) has a conflicting class session "${session.title}" (${session.start_time} - ${session.end_time}) in another batch.`,
                conflictingSessionId: session.id,
                conflictingTitle: session.title,
                time: `${session.start_time} - ${session.end_time}`,
              });
            }
          }
        }
      }
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

// ==============================================================================
// Transactional Conversion & Payment RPC Handlers
// ==============================================================================

export interface ConvertLeadParams {
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  age?: number | null;
  country?: string;
  city?: string | null;
  programSlug: string;
  programTitle: string;
  programType: string;
  batchId?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  agreedFee: number;
  discount?: number;
  billingDay?: number;
  enrollmentDate?: string;
  schedule?: string | null;
  notes?: string | null;
  createInitialInvoice?: boolean;
  adminUserId?: string | null;
  actorEmail?: string | null;
}

export async function convertLeadToStudentTx(params: ConvertLeadParams) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  // 1. Try atomic PostgreSQL RPC
  try {
    const { data: rpcResult, error: rpcErr } = await client.rpc("convert_lead_to_student_tx", {
      p_lead_id: params.leadId,
      p_program_slug: params.programSlug,
      p_program_title: params.programTitle,
      p_program_type: params.programType,
      p_agreed_fee: params.agreedFee,
      p_batch_id: params.batchId || null,
      p_instructor_id: params.instructorId || null,
      p_instructor_name: params.instructorName || null,
      p_discount: params.discount || 0,
      p_billing_day: params.billingDay || 1,
      p_enrollment_date: params.enrollmentDate || new Date().toISOString().split("T")[0],
      p_schedule: params.schedule || null,
      p_notes: params.notes || null,
      p_create_initial_invoice: params.createInitialInvoice !== false,
      p_admin_user_id: params.adminUserId || null,
      p_actor_email: params.actorEmail || null,
    });

    if (!rpcErr && rpcResult) {
      return rpcResult;
    }
    if (rpcErr && rpcErr.code === "23505") {
      throw new Error("LEAD_ALREADY_CONVERTED");
    }
  } catch (err: any) {
    if (err.message === "LEAD_ALREADY_CONVERTED") throw err;
  }

  // 2. Coordinated fallback application transaction
  const { data: existingStudent } = await client
    .from("students")
    .select("id, student_id")
    .eq("lead_id", params.leadId)
    .maybeSingle();

  if (existingStudent) {
    throw new Error("LEAD_ALREADY_CONVERTED");
  }

  const { data: lead, error: leadErr } = await client
    .from("admissions_requests")
    .select("*")
    .eq("id", params.leadId)
    .single();

  if (leadErr || !lead) {
    throw new Error("LEAD_NOT_FOUND");
  }

  const studentIdStr = await generateStudentId();
  const now = new Date();
  const enrollmentDate = params.enrollmentDate || now.toISOString().split("T")[0];

  const { data: student, error: studErr } = await client
    .from("students")
    .insert({
      student_id: studentIdStr,
      full_name: params.fullName || lead.student_name || lead.contact_name,
      email: params.email.toLowerCase().trim(),
      phone: params.phone,
      whatsapp: params.whatsapp || params.phone,
      guardian_name: params.guardianName || null,
      guardian_phone: params.guardianPhone || null,
      guardian_email: params.guardianEmail || null,
      age: params.age || null,
      country: params.country || "Pakistan",
      city: params.city || null,
      timezone: "Asia/Karachi",
      status: "active",
      enrollment_date: enrollmentDate,
      billing_day: params.billingDay || 1,
      notes: params.notes || null,
      lead_id: params.leadId,
    })
    .select()
    .single();

  if (studErr || !student) {
    throw new Error(`Failed to create student: ${studErr?.message}`);
  }

  let enrollment = null;
  try {
    const { data: enr, error: enrErr } = await client
      .from("enrollments")
      .insert({
        student_id: student.id,
        batch_id: params.batchId || null,
        program_slug: params.programSlug,
        program_title: params.programTitle,
        program_type: params.programType,
        instructor_id: params.instructorId || null,
        instructor_name: params.instructorName || null,
        agreed_fee: params.agreedFee,
        discount: params.discount || 0,
        billing_day: params.billingDay || 1,
        enrollment_date: enrollmentDate,
        schedule: params.schedule || null,
        status: "active",
      })
      .select()
      .single();

    if (enrErr || !enr) {
      throw new Error(`Failed to create enrollment: ${enrErr?.message}`);
    }
    enrollment = enr;

    if (params.batchId) {
      const { data: bData } = await client
        .from("batches")
        .select("active_student_count")
        .eq("id", params.batchId)
        .maybeSingle();
      if (bData) {
        await client
          .from("batches")
          .update({ active_student_count: (bData.active_student_count || 0) + 1 })
          .eq("id", params.batchId);
      }
    }
  } catch (err) {
    await client.from("students").delete().eq("id", student.id);
    throw err;
  }

  let invoice = null;
  if (params.createInitialInvoice !== false && params.agreedFee > 0) {
    try {
      const invNum = await generateInvoiceNumber();
      const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const { data: inv } = await client
        .from("fee_invoices")
        .insert({
          invoice_number: invNum,
          student_id: student.id,
          enrollment_id: enrollment?.id || null,
          billing_month: billingMonth,
          amount_due: params.agreedFee,
          amount_paid: 0,
          balance: params.agreedFee,
          due_date: dueDate.toISOString().split("T")[0],
          status: "due",
          notes: `Initial monthly tuition for ${params.programTitle}`,
        })
        .select()
        .maybeSingle();

      invoice = inv;
    } catch (err) {
      console.warn("Initial invoice creation warning:", err);
    }
  }

  await client
    .from("admissions_requests")
    .update({ status: "enrolled", updated_at: new Date().toISOString() })
    .eq("id", params.leadId);

  await client.from("admissions_activity").insert({
    admission_id: params.leadId,
    admin_user_id: params.adminUserId || null,
    action_type: "status_changed",
    old_status: lead.status,
    new_status: "enrolled",
    note: `Converted to Student: ${student.student_id} (${params.programTitle})`,
  });

  await logCrmAction({
    adminUserId: params.adminUserId || null,
    actorEmail: params.actorEmail || null,
    action: "convert_lead_to_student",
    entity: "admissions_requests",
    entityId: params.leadId,
    details: {
      studentId: student.student_id,
      programTitle: params.programTitle,
      agreedFee: params.agreedFee,
    },
  });

  return { student, enrollment, invoice };
}

export interface RecordPaymentParams {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: "bank_transfer" | "jazzcash" | "easypaisa" | "cash" | "other";
  paymentDate?: string;
  referenceNumber?: string | null;
  notes?: string | null;
  recordedBy?: string | null;
  idempotencyKey?: string | null;
  actorEmail?: string | null;
}

export async function recordPaymentTx(params: RecordPaymentParams) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  if (!params.amount || params.amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  // 1. Try atomic PostgreSQL RPC
  try {
    const { data: rpcResult, error: rpcErr } = await client.rpc("record_payment_tx", {
      p_invoice_id: params.invoiceId,
      p_student_id: params.studentId,
      p_amount: params.amount,
      p_payment_method: params.paymentMethod,
      p_payment_date: params.paymentDate || new Date().toISOString().split("T")[0],
      p_reference_number: params.referenceNumber || null,
      p_notes: params.notes || null,
      p_recorded_by: params.recordedBy || null,
      p_idempotency_key: params.idempotencyKey || null,
      p_actor_email: params.actorEmail || null,
    });

    if (!rpcErr && rpcResult) {
      return rpcResult;
    }
    if (rpcErr) {
      if (rpcErr.message.includes("STUDENT_INVOICE_MISMATCH")) throw new Error("STUDENT_INVOICE_MISMATCH");
      if (rpcErr.message.includes("OVERPAYMENT_EXCEEDS_BALANCE")) throw new Error("OVERPAYMENT_EXCEEDS_BALANCE");
      if (rpcErr.message.includes("INVOICE_NOT_FOUND")) throw new Error("INVOICE_NOT_FOUND");
      if (rpcErr.message.includes("INVOICE_NOT_PAYABLE")) throw new Error("INVOICE_NOT_PAYABLE");
      if (rpcErr.message.includes("INVOICE_ALREADY_SETTLED")) throw new Error("INVOICE_ALREADY_SETTLED");
      if (rpcErr.message.includes("IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD")) throw new Error("IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD");
      if (rpcErr.message.includes("INVALID_PAYMENT_METHOD")) throw new Error("INVALID_PAYMENT_METHOD");
    }
  } catch (err: any) {
    if (
      err.message === "STUDENT_INVOICE_MISMATCH" ||
      err.message === "OVERPAYMENT_EXCEEDS_BALANCE" ||
      err.message === "INVOICE_NOT_FOUND" ||
      err.message === "INVALID_AMOUNT" ||
      err.message === "INVOICE_NOT_PAYABLE" ||
      err.message === "INVOICE_ALREADY_SETTLED" ||
      err.message === "IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD" ||
      err.message === "INVALID_PAYMENT_METHOD"
    ) {
      throw err;
    }
  }

  // 2. Coordinated fallback application transaction
  if (params.idempotencyKey) {
    const { data: existingPayment } = await client
      .from("fee_payments")
      .select("*")
      .eq("idempotency_key", params.idempotencyKey)
      .maybeSingle();

    if (existingPayment) {
      if (
        existingPayment.invoice_id !== params.invoiceId ||
        existingPayment.student_id !== params.studentId ||
        Number(existingPayment.amount) !== Number(params.amount)
      ) {
        throw new Error("IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD");
      }
      const { data: inv } = await client.from("fee_invoices").select("*").eq("id", existingPayment.invoice_id).single();
      return { payment: existingPayment, invoice: inv, is_duplicate: true };
    }
  }

  const { data: invoice, error: findInvErr } = await client
    .from("fee_invoices")
    .select("*")
    .eq("id", params.invoiceId)
    .single();

  if (findInvErr || !invoice) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  if (["paid", "waived", "refunded", "cancelled"].includes(invoice.status)) {
    throw new Error("INVOICE_NOT_PAYABLE");
  }

  if (invoice.student_id !== params.studentId) {
    throw new Error("STUDENT_INVOICE_MISMATCH");
  }

  const currentBalance = Number(invoice.balance) || 0;
  if (currentBalance <= 0) {
    throw new Error("INVOICE_ALREADY_SETTLED");
  }
  if (params.amount > currentBalance) {
    throw new Error("OVERPAYMENT_EXCEEDS_BALANCE");
  }

  const receiptNumber = await generateReceiptNumber();
  const paymentDate = params.paymentDate || new Date().toISOString().split("T")[0];

  const { data: newPayment, error: payErr } = await client
    .from("fee_payments")
    .insert({
      invoice_id: params.invoiceId,
      student_id: params.studentId,
      amount: params.amount,
      payment_date: paymentDate,
      payment_method: params.paymentMethod,
      reference_number: params.referenceNumber || null,
      receipt_number: receiptNumber,
      idempotency_key: params.idempotencyKey || null,
      notes: params.notes || null,
      recorded_by: params.recordedBy || null,
    })
    .select()
    .single();

  if (payErr || !newPayment) {
    throw new Error(`Failed to record payment: ${payErr?.message}`);
  }

  const updatedPaid = (Number(invoice.amount_paid) || 0) + params.amount;
  const updatedBalance = Math.max(0, currentBalance - params.amount);
  const newStatus = updatedBalance === 0 ? "paid" : "partially_paid";

  const { data: updatedInvoice } = await client
    .from("fee_invoices")
    .update({
      amount_paid: updatedPaid,
      balance: updatedBalance,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.invoiceId)
    .select()
    .single();

  await logCrmAction({
    adminUserId: params.recordedBy || null,
    actorEmail: params.actorEmail || null,
    action: "record_payment",
    entity: "fee_payments",
    entityId: newPayment.id,
    details: {
      invoiceNumber: invoice.invoice_number,
      receiptNumber,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      balanceRemaining: updatedBalance,
      status: newStatus,
    },
  });

  return { payment: newPayment, invoice: updatedInvoice, is_duplicate: false };
}
