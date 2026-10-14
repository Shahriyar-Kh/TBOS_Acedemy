import { z } from "zod";

// Roles
export const CRM_ROLES = ["owner", "admin", "admissions", "instructor", "accountant"] as const;
export type CrmRole = (typeof CRM_ROLES)[number];

// Lead / Admissions Statuses
export const LEAD_STATUSES = [
  "new",
  "reviewed",
  "contacted",
  "demo_requested",
  "demo_scheduled",
  "demo_completed",
  "follow_up_due",
  "qualified",
  "enrolled",
  "not_interested",
  "unresponsive",
  "rejected",
  "archived",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Student Statuses
export const STUDENT_STATUSES = [
  "active",
  "trial",
  "paused",
  "on_hold",
  "completed",
  "dropped",
  "cancelled",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

// Batch Statuses
export const BATCH_STATUSES = [
  "planned",
  "enrolling",
  "active",
  "paused",
  "completed",
  "cancelled",
] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

// Fee Payment Statuses
export const INVOICE_STATUSES = [
  "upcoming",
  "due",
  "partially_paid",
  "paid",
  "overdue",
  "waived",
  "refunded",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Payment Methods
export const PAYMENT_METHODS = [
  "bank_transfer",
  "jazzcash",
  "easypaisa",
  "cash",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Class Statuses
export const CLASS_STATUSES = [
  "scheduled",
  "completed",
  "rescheduled",
  "cancelled",
  "missed",
] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

// Attendance Statuses
export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// Task Priorities
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// Task Statuses
export const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// --- Zod Validation Schemas ---

export const createStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is too short").max(25),
  whatsapp: z.string().max(25).optional().nullable(),
  guardianName: z.string().max(120).optional().nullable(),
  guardianPhone: z.string().max(25).optional().nullable(),
  guardianEmail: z.string().email().optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().optional().nullable(),
  age: z.number().int().min(4).max(120).optional().nullable(),
  country: z.string().default("Pakistan"),
  city: z.string().max(80).optional().nullable(),
  timezone: z.string().default("Asia/Karachi"),
  status: z.enum(STUDENT_STATUSES).default("active"),
  enrollmentDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  billingDay: z.number().int().min(1).max(28).default(1),
  notes: z.string().max(2000).optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const convertLeadToStudentSchema = z.object({
  leadId: z.string().uuid("Lead ID must be a valid UUID"),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  whatsapp: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  guardianEmail: z.string().optional().nullable(),
  age: z.number().int().optional().nullable(),
  country: z.string().default("Pakistan"),
  city: z.string().optional().nullable(),
  programSlug: z.string().min(1),
  programTitle: z.string().min(1),
  programType: z.enum(["live_batch", "specialization", "course", "tutoring"]),
  batchId: z.string().uuid().optional().nullable(),
  instructorId: z.string().uuid().optional().nullable(),
  instructorName: z.string().optional().nullable(),
  agreedFee: z.number().min(0),
  discount: z.number().min(0).default(0),
  billingDay: z.number().int().min(1).max(28).default(1),
  enrollmentDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  schedule: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createInitialInvoice: z.boolean().default(true),
});

export const createBatchSchema = z.object({
  name: z.string().min(2).max(120),
  programSlug: z.string().min(1),
  programTitle: z.string().min(1),
  programType: z.enum(["live_batch", "specialization", "course", "tutoring"]),
  mode: z.enum(["group", "one_on_one"]).default("group"),
  instructorId: z.string().uuid().optional().nullable(),
  instructorName: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  expectedEndDate: z.string().optional().nullable(),
  daysOfWeek: z.array(z.string()).default([]),
  startTime: z.string().optional().nullable(), // HH:mm
  endTime: z.string().optional().nullable(),   // HH:mm
  timezone: z.string().default("Asia/Karachi"),
  maxCapacity: z.number().int().min(1).default(20),
  meetingLink: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(BATCH_STATUSES).default("active"),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateBatchSchema = createBatchSchema.partial();

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invoice ID is required"),
  studentId: z.string().uuid("Student ID is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  paymentDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  paymentMethod: z.enum(PAYMENT_METHODS),
  referenceNumber: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createClassSessionSchema = z.object({
  batchId: z.string().uuid().optional().nullable(),
  enrollmentId: z.string().uuid().optional().nullable(),
  instructorId: z.string().uuid().optional().nullable(),
  instructorName: z.string().optional().nullable(),
  title: z.string().min(2).max(150),
  sessionDate: z.string(), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:mm"),
  timezone: z.string().default("Asia/Karachi"),
  meetingLink: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(CLASS_STATUSES).default("scheduled"),
  topicCovered: z.string().max(2000).optional().nullable(),
  homework: z.string().max(2000).optional().nullable(),
  instructorNotes: z.string().max(2000).optional().nullable(),
});

export const updateClassSessionSchema = createClassSessionSchema.partial();

export const recordAttendanceSchema = z.object({
  classSessionId: z.string().uuid(),
  attendees: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(ATTENDANCE_STATUSES),
      notes: z.string().optional().nullable(),
    }),
  ),
});

export const createCrmTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string(), // ISO string
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
  assignedTo: z.string().uuid().optional().nullable(),
  relatedType: z.enum(["lead", "student", "class", "payment", "other"]).optional().nullable(),
  relatedId: z.string().optional().nullable(),
});

export const updateCrmTaskSchema = createCrmTaskSchema.partial();

export const sendCommunicationSchema = z.object({
  channel: z.enum(["email", "whatsapp"]),
  recipients: z.array(
    z.object({
      id: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string(),
    }),
  ).min(1, "At least one recipient is required"),
  subject: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
  templateCategory: z.string().optional(),
});

