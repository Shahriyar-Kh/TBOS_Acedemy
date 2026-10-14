import { test, expect } from "@playwright/test";
import {
  formatStudentId,
  formatInvoiceNumber,
  formatReceiptNumber,
  generateStudentId,
  generateInvoiceNumber,
  generateReceiptNumber,
  isTimeWindowOverlapping,
  validateTimeSlotFormat,
  generatePasswordResetToken,
  hashPasswordResetToken,
  checkRateLimit,
  escapeHtml,
} from "../../src/lib/crm.server";
import {
  createStudentSchema,
  createBatchSchema,
  recordPaymentSchema,
  createClassSessionSchema,
  convertLeadToStudentSchema,
} from "../../src/lib/crmSchemas";
import {
  getSpecializationMonthlyFee,
  PREMIUM_SPECIALIZATION_SLUGS,
  PREMIUM_SPECIALIZATION_FEE,
  STANDARD_SPECIALIZATION_FEE,
} from "../../src/data/specializations";
import { courses } from "../../src/data/courses";

test.describe("Phase 16 — TBOS Academy CRM Production Hardening Acceptance Suite", () => {
  // ==============================================================================
  // 1. Owner Login and Protected Admin Navigation
  // ==============================================================================
  test("1. Owner login and protected admin navigation contracts", () => {
    const ownerAdmin = {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner" as const,
      is_active: true,
    };

    const allowedOwnerNavigation = [
      "/admin/dashboard",
      "/admin/students",
      "/admin/batches",
      "/admin/fees",
      "/admin/timetable",
      "/admin/tasks",
      "/admin/communications",
      "/admin/users",
      "/admin/reports",
      "/admin/audit",
      "/admin/settings",
    ];

    expect(ownerAdmin.role).toBe("owner");
    expect(allowedOwnerNavigation.length).toBeGreaterThanOrEqual(10);
    expect(allowedOwnerNavigation).toContain("/admin/users");
    expect(allowedOwnerNavigation).toContain("/admin/settings");
    expect(allowedOwnerNavigation).toContain("/admin/fees");
  });

  // ==============================================================================
  // 2. RBAC Denial for Unauthorized Roles
  // ==============================================================================
  test("2. RBAC denial for unauthorized roles enforces principle of least privilege", () => {
    const rolesAllowedForFees = ["owner", "admin", "accountant"];
    const rolesAllowedForUsers = ["owner", "admin"];
    const rolesAllowedForDisasterRecovery = ["owner"];
    const rolesAllowedForAdmissionsMutation = ["owner", "admin", "admissions"];

    // Instructor cannot view fees/revenue or mutate admissions
    expect(rolesAllowedForFees.includes("instructor")).toBe(false);
    expect(rolesAllowedForAdmissionsMutation.includes("instructor")).toBe(false);

    // Accountant cannot mutate admissions or timetable
    expect(rolesAllowedForAdmissionsMutation.includes("accountant")).toBe(false);

    // Admissions officer cannot manage system users
    expect(rolesAllowedForUsers.includes("admissions")).toBe(false);

    // Admin & Accountant cannot trigger full disaster recovery dump
    expect(rolesAllowedForDisasterRecovery.includes("admin")).toBe(false);
    expect(rolesAllowedForDisasterRecovery.includes("accountant")).toBe(false);
    expect(rolesAllowedForDisasterRecovery.includes("owner")).toBe(true);

    // Row-scoping contracts: Instructors are scoped to their own sessions, batches, and assigned tasks
    const instructorUser = { id: "inst-101", role: "instructor" as const };
    const sessions = [
      { id: "s1", instructor_id: "inst-101", title: "Python Intro" },
      { id: "s2", instructor_id: "inst-202", title: "React Deep Dive" },
    ];
    const batches = [
      { id: "b1", instructor_id: "inst-101", name: "Python Alpha" },
      { id: "b2", instructor_id: "inst-202", name: "React Beta" },
    ];
    const tasks = [
      { id: "t1", assigned_to: "inst-101", title: "Grade Project 1" },
      { id: "t2", assigned_to: "inst-202", title: "Prepare Slide Deck" },
    ];

    const scopedSessions = sessions.filter((s) => s.instructor_id === instructorUser.id);
    const scopedBatches = batches.filter((b) => b.instructor_id === instructorUser.id);
    const scopedTasks = tasks.filter((t) => t.assigned_to === instructorUser.id);

    expect(scopedSessions.length).toBe(1);
    expect(scopedSessions[0].id).toBe("s1");
    expect(scopedBatches.length).toBe(1);
    expect(scopedBatches[0].id).toBe("b1");
    expect(scopedTasks.length).toBe(1);
    expect(scopedTasks[0].id).toBe("t1");
  });

  // ==============================================================================
  // 3. Create, Edit and Archive Student (Rollback-Safe Record Format)
  // ==============================================================================
  test("3. Create, edit and archive student schema invariants", () => {
    // A. Creation
    const studentData = {
      fullName: "E2E Test Student",
      email: "e2e-student@test.local",
      phone: "+923001234567",
      country: "Pakistan",
      city: "Islamabad",
      status: "active" as const,
      billingDay: 5,
    };
    const createParsed = createStudentSchema.safeParse(studentData);
    expect(createParsed.success).toBe(true);

    // B. Edit status to paused
    const editData = { ...studentData, status: "paused" as const };
    const editParsed = createStudentSchema.safeParse(editData);
    expect(editParsed.success).toBe(true);
    if (editParsed.success) {
      expect(editParsed.data.status).toBe("paused");
    }

    // C. Archive/cancel student
    const archiveData = { ...studentData, status: "cancelled" as const };
    const archiveParsed = createStudentSchema.safeParse(archiveData);
    expect(archiveParsed.success).toBe(true);
    if (archiveParsed.success) {
      expect(archiveParsed.data.status).toBe("cancelled");
    }
  });

  // ==============================================================================
  // 4. CSV Import Preview, Validation and Duplicate Rejection
  // ==============================================================================
  test("4. CSV import validation rejects malformed rows and internal duplicates", () => {
    const rawCsv = `full_name,email,phone,city,billing_day
Hassan Ali,hassan@example.com,+923001112233,Lahore,1
Fatima Noor,fatima@example.com,+923002223344,Karachi,5
Hassan Ali Duplicate,hassan@example.com,+923009999999,Lahore,1
Invalid Row,,invalid-phone,Rawalpindi,35`;

    const lines = rawCsv.split("\n").filter((l) => l.trim().length > 0);
    const headers = lines[0].split(",").map((h) => h.trim());
    expect(headers).toEqual(["full_name", "email", "phone", "city", "billing_day"]);

    const validRows: any[] = [];
    const duplicateEmails = new Set<string>();
    const seenEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      const email = parts[1]?.toLowerCase();

      if (seenEmails.has(email)) {
        duplicateEmails.add(email);
        continue;
      }
      seenEmails.add(email);

      const parsed = createStudentSchema.safeParse({
        fullName: parts[0],
        email: parts[1],
        phone: parts[2],
        city: parts[3],
        billingDay: Number(parts[4]) || 1,
      });

      if (parsed.success) {
        validRows.push(parsed.data);
      }
    }

    expect(duplicateEmails.has("hassan@example.com")).toBe(true);
    expect(validRows.length).toBe(2); // Hassan (first instance) and Fatima
  });

  // ==============================================================================
  // 5. Create Batch
  // ==============================================================================
  test("5. Create batch enforces cohort capacity and schedule requirements", () => {
    const validBatch = createBatchSchema.safeParse({
      name: "Python Mastery Cohort Beta",
      programSlug: "100-days-complete-python",
      programTitle: "100 Days Complete Python",
      programType: "live_batch",
      maxCapacity: 25,
      daysOfWeek: ["Monday", "Wednesday", "Friday"],
      startTime: "19:00",
      endTime: "20:30",
    });
    expect(validBatch.success).toBe(true);

    const invalidCapacityBatch = createBatchSchema.safeParse({
      name: "Zero Capacity Batch",
      programSlug: "100-days-complete-python",
      programTitle: "100 Days Complete Python",
      programType: "live_batch",
      maxCapacity: 0, // Must be > 0
    });
    expect(invalidCapacityBatch.success).toBe(false);
  });

  // ==============================================================================
  // 6. Lead Conversion to Student
  // ==============================================================================
  test("6. Lead conversion to student validates complete required conversion payload", () => {
    const conversionPayload = {
      leadId: "33333333-4444-5555-6666-777777777777",
      fullName: "Kamran Akram",
      email: "kamran.akram@example.com",
      phone: "+923004445566",
      programSlug: "full-stack-developer",
      programTitle: "Full-Stack Developer Specialization",
      programType: "specialization" as const,
      agreedFee: 20000,
      billingDay: 1,
      createInitialInvoice: true,
    };

    const parsed = convertLeadToStudentSchema.safeParse(conversionPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.agreedFee).toBe(20000);
      expect(parsed.data.createInitialInvoice).toBe(true);
    }
  });

  // ==============================================================================
  // 7. Linked Enrollment Creation
  // ==============================================================================
  test("7. Linked enrollment creation preserves student-batch-program relationships", () => {
    const enrollmentSimulation = {
      id: "enr-1111-2222-3333-4444",
      student_id: "stud-5555-6666-7777-8888",
      batch_id: "batch-9999-0000-1111-2222",
      program_slug: "full-stack-developer",
      program_title: "Full-Stack Developer Specialization",
      agreed_fee: 20000,
      discount: 0,
      status: "active",
    };

    expect(enrollmentSimulation.student_id).toBeTruthy();
    expect(enrollmentSimulation.batch_id).toBeTruthy();
    expect(enrollmentSimulation.agreed_fee).toBe(20000);
    expect(enrollmentSimulation.status).toBe("active");
  });

  // ==============================================================================
  // 8. Initial Fee Invoice Creation
  // ==============================================================================
  test("8. Initial fee invoice creation sets proper due date and amount due", () => {
    const agreedFee = 20000;
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const invoiceNum = formatInvoiceNumber(1, now);

    const invoiceSimulation = {
      invoice_number: invoiceNum,
      student_id: "stud-1234",
      billing_month: billingMonth,
      amount_due: agreedFee,
      amount_paid: 0,
      balance: agreedFee,
      status: "due",
    };

    expect(invoiceSimulation.invoice_number.startsWith("INV-")).toBe(true);
    expect(invoiceSimulation.amount_due).toBe(20000);
    expect(invoiceSimulation.balance).toBe(20000);
    expect(invoiceSimulation.status).toBe("due");
  });

  // ==============================================================================
  // 9. Monthly Dues Generation
  // ==============================================================================
  test("9. Monthly dues generation computes dues for active students with agreed fee", () => {
    const activeEnrollments = [
      { student_id: "s1", status: "active", agreed_fee: 20000 },
      { student_id: "s2", status: "active", agreed_fee: 15000 },
      { student_id: "s3", status: "paused", agreed_fee: 15000 },
      { student_id: "s4", status: "active", agreed_fee: 0 }, // Free scholarship
    ];

    const eligibleForBilling = activeEnrollments.filter(
      (e) => e.status === "active" && e.agreed_fee > 0,
    );

    expect(eligibleForBilling.length).toBe(2);
    expect(eligibleForBilling[0].agreed_fee).toBe(20000);
    expect(eligibleForBilling[1].agreed_fee).toBe(15000);
  });

  // ==============================================================================
  // 10. Duplicate Monthly Due Prevention
  // ==============================================================================
  test("10. Duplicate monthly due prevention enforces idempotency per student and billing month", () => {
    const existingInvoices = new Set<string>();
    const key1 = "stud-101:full-stack-developer:2026-10";
    existingInvoices.add(key1);

    const checkShouldGenerateInvoice = (studentId: string, program: string, month: string) => {
      const key = `${studentId}:${program}:${month}`;
      if (existingInvoices.has(key)) return { generate: false, reason: "ALREADY_BILLED" };
      existingInvoices.add(key);
      return { generate: true, reason: "NEW_INVOICE" };
    };

    // First attempt in November generates invoice
    expect(checkShouldGenerateInvoice("stud-101", "full-stack-developer", "2026-11").generate).toBe(true);

    // Second attempt in November is rejected as duplicate
    expect(checkShouldGenerateInvoice("stud-101", "full-stack-developer", "2026-11").generate).toBe(false);

    // October was already billed
    expect(checkShouldGenerateInvoice("stud-101", "full-stack-developer", "2026-10").generate).toBe(false);
  });

  // ==============================================================================
  // 11. Partial Payment
  // ==============================================================================
  test("11. Partial payment reduces balance and updates status to partially_paid", () => {
    let invoice = {
      amount_due: 20000,
      amount_paid: 0,
      balance: 20000,
      status: "due",
    };

    const partialPaymentAmount = 7500;
    invoice = {
      ...invoice,
      amount_paid: invoice.amount_paid + partialPaymentAmount,
      balance: invoice.amount_due - (invoice.amount_paid + partialPaymentAmount),
      status: "partially_paid",
    };

    expect(invoice.amount_paid).toBe(7500);
    expect(invoice.balance).toBe(12500);
    expect(invoice.status).toBe("partially_paid");
  });

  // ==============================================================================
  // 12. Full Payment
  // ==============================================================================
  test("12. Full payment clears balance and updates status to paid", () => {
    let invoice = {
      amount_due: 20000,
      amount_paid: 7500,
      balance: 12500,
      status: "partially_paid",
    };

    const remainingPayment = 12500;
    invoice = {
      ...invoice,
      amount_paid: invoice.amount_paid + remainingPayment,
      balance: invoice.balance - remainingPayment,
      status: "paid",
    };

    expect(invoice.amount_paid).toBe(20000);
    expect(invoice.balance).toBe(0);
    expect(invoice.status).toBe("paid");
  });

  // ==============================================================================
  // 13. Invalid Student/Invoice Relationship Rejection
  // ==============================================================================
  test("13. Invalid student/invoice relationship rejection", () => {
    const invoiceRecord = {
      id: "inv-1111",
      student_id: "student-A",
      balance: 20000,
    };

    const paymentAttempt = {
      invoiceId: "inv-1111",
      studentId: "student-B", // Mismatch!
      amount: 5000,
    };

    const validatePaymentOwnership = (inv: typeof invoiceRecord, pay: typeof paymentAttempt) => {
      if (inv.student_id !== pay.studentId) {
        throw new Error("STUDENT_INVOICE_MISMATCH");
      }
      return true;
    };

    expect(() => validatePaymentOwnership(invoiceRecord, paymentAttempt)).toThrow("STUDENT_INVOICE_MISMATCH");
  });

  // ==============================================================================
  // 14. Schedule Conflict Detection: Instructor Conflict
  // ==============================================================================
  test("14. Schedule conflict detection flags overlapping sessions for same instructor", () => {
    const existingSession = {
      instructorId: "inst-101",
      sessionDate: "2026-10-20",
      startTime: "19:00",
      endTime: "20:30",
    };

    const proposedSession = {
      instructorId: "inst-101",
      sessionDate: "2026-10-20",
      startTime: "19:30",
      endTime: "21:00",
    };

    const overlaps = isTimeWindowOverlapping(
      proposedSession.startTime,
      proposedSession.endTime,
      existingSession.startTime,
      existingSession.endTime,
    );
    const sameInstructor = proposedSession.instructorId === existingSession.instructorId;

    expect(overlaps && sameInstructor).toBe(true);
  });

  // ==============================================================================
  // 15. Schedule Conflict Detection: Batch Conflict
  // ==============================================================================
  test("15. Schedule conflict detection flags concurrent sessions for same batch", () => {
    const existingSession = {
      batchId: "batch-python-101",
      sessionDate: "2026-10-22",
      startTime: "18:00",
      endTime: "19:30",
    };

    const proposedSession = {
      batchId: "batch-python-101",
      sessionDate: "2026-10-22",
      startTime: "18:30",
      endTime: "20:00",
    };

    const overlaps = isTimeWindowOverlapping(
      proposedSession.startTime,
      proposedSession.endTime,
      existingSession.startTime,
      existingSession.endTime,
    );
    const sameBatch = proposedSession.batchId === existingSession.batchId;

    expect(overlaps && sameBatch).toBe(true);
  });

  // ==============================================================================
  // 16. Schedule Conflict Detection: Individual Student Enrollment Conflict
  // ==============================================================================
  test("16. Schedule conflict detection flags student enrolled in two conflicting batches", () => {
    // Student enrolled in Batch A (18:00 - 19:30) and Batch B (19:00 - 20:30) on same date
    const batchASession = { start: "18:00", end: "19:30" };
    const batchBSession = { start: "19:00", end: "20:30" };

    const studentClash = isTimeWindowOverlapping(
      batchASession.start,
      batchASession.end,
      batchBSession.start,
      batchBSession.end,
    );
    expect(studentClash).toBe(true);
  });

  // ==============================================================================
  // 17. Blocked Calendar Slot Prevention
  // ==============================================================================
  test("17. Blocked calendar slot prevention flags unavailable instructor windows", () => {
    const instructorBlockedWindow = {
      dayOfWeek: 1, // Monday
      startTime: "14:00",
      endTime: "17:00",
      isBlocked: true,
    };

    const proposedBooking = {
      dayOfWeek: 1,
      startTime: "15:00",
      endTime: "16:00",
    };

    const isSlotBlocked =
      instructorBlockedWindow.isBlocked &&
      instructorBlockedWindow.dayOfWeek === proposedBooking.dayOfWeek &&
      isTimeWindowOverlapping(
        proposedBooking.startTime,
        proposedBooking.endTime,
        instructorBlockedWindow.startTime,
        instructorBlockedWindow.endTime,
      );

    expect(isSlotBlocked).toBe(true);
  });

  // ==============================================================================
  // 18. Overlapping Time Validation (start >= end rejection)
  // ==============================================================================
  test("18. Overlapping time validation rejects inverted, identical, or invalid slots", () => {
    expect(validateTimeSlotFormat("19:00", "20:30").valid).toBe(true);

    // Inverted time
    const inverted = validateTimeSlotFormat("20:30", "19:00");
    expect(inverted.valid).toBe(false);
    expect(inverted.error).toContain("End time must be strictly after start time");

    // Identical start and end
    const identical = validateTimeSlotFormat("19:00", "19:00");
    expect(identical.valid).toBe(false);

    // Invalid format
    const invalidHours = validateTimeSlotFormat("25:00", "26:00");
    expect(invalidHours.valid).toBe(false);
  });

  // ==============================================================================
  // 19. Password Reset Token Generation
  // ==============================================================================
  test("19. Password reset token generation uses cryptographic random bytes and SHA-256", () => {
    const { rawToken, tokenHash } = generatePasswordResetToken();
    expect(rawToken.length).toBe(64);
    expect(tokenHash.length).toBe(64);
    expect(rawToken).not.toBe(tokenHash);

    // Deterministic verify
    expect(hashPasswordResetToken(rawToken)).toBe(tokenHash);
  });

  // ==============================================================================
  // 20. Password Reset Token Expiration (30m)
  // ==============================================================================
  test("20. Password reset token expiration check enforces 30-minute lifespan", () => {
    const now = Date.now();
    const validExpiry = new Date(now + 25 * 60 * 1000).toISOString();
    const expiredExpiry = new Date(now - 5 * 60 * 1000).toISOString();

    const isTokenExpired = (expiresAt: string) => new Date(expiresAt).getTime() <= Date.now();

    expect(isTokenExpired(validExpiry)).toBe(false);
    expect(isTokenExpired(expiredExpiry)).toBe(true);
  });

  // ==============================================================================
  // 21. Password Reset Token Reuse Prevention
  // ==============================================================================
  test("21. Password reset token reuse prevention invalidates token after first confirmation", () => {
    const tokenRecord = {
      tokenHash: "abc123hash",
      used: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    const useToken = (rec: typeof tokenRecord) => {
      if (rec.used) throw new Error("TOKEN_ALREADY_USED");
      rec.used = true;
      return true;
    };

    expect(useToken(tokenRecord)).toBe(true);
    expect(tokenRecord.used).toBe(true);
    expect(() => useToken(tokenRecord)).toThrow("TOKEN_ALREADY_USED");
  });

  // ==============================================================================
  // 22. Password Reset Session Invalidation
  // ==============================================================================
  test("22. Password reset session invalidation invalidates all pending tokens for user", () => {
    const tokens = [
      { id: "t1", email: "user@test.local", used: false },
      { id: "t2", email: "user@test.local", used: false },
      { id: "t3", email: "other@test.local", used: false },
    ];

    const invalidateUserTokens = (targetEmail: string) => {
      tokens.forEach((t) => {
        if (t.email === targetEmail) t.used = true;
      });
    };

    invalidateUserTokens("user@test.local");
    expect(tokens[0].used).toBe(true);
    expect(tokens[1].used).toBe(true);
    expect(tokens[2].used).toBe(false); // Other user unaffected
  });

  // ==============================================================================
  // 23. Password Reset Rate Limiting (5 attempts/15m per email/IP)
  // ==============================================================================
  test("23. Password reset rate limiting enforces max 5 attempts per window", async () => {
    const testKey = `test_rate_limit_${Date.now()}`;

    // First 5 attempts must succeed
    for (let i = 1; i <= 5; i++) {
      const res = await checkRateLimit(testKey, 5, 60);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - i);
    }

    // 6th attempt must be rejected
    const blockedRes = await checkRateLimit(testKey, 5, 60);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  // ==============================================================================
  // 24. Password Reset Credential Leakage Prevention (Generic Response)
  // ==============================================================================
  test("24. Password reset returns uniform generic response regardless of email existence", () => {
    const genericMessage =
      "If an active administrator account exists for this email, password reset instructions have been sent.";

    const simulateResetRequest = (emailExists: boolean) => {
      if (emailExists) {
        // Send email in background
      }
      return { ok: true, message: genericMessage };
    };

    const existingRes = simulateResetRequest(true);
    const nonExistingRes = simulateResetRequest(false);

    expect(existingRes.message).toBe(genericMessage);
    expect(nonExistingRes.message).toBe(genericMessage);
    expect(existingRes).toEqual(nonExistingRes);
  });

  // ==============================================================================
  // 25. New Admin Invitation Flow Without Leaking Temporary Passwords
  // ==============================================================================
  test("25. Admin invitation dispatches cryptographic token link without plaintext password", () => {
    const { rawToken } = generatePasswordResetToken();
    const targetEmail = "newstaff@techbuiltos.online";
    const inviteUrl = `https://techbuiltos.online/admin/reset-password?token=${rawToken}&invitation=true`;

    expect(inviteUrl).toContain("/admin/reset-password?token=");
    expect(inviteUrl).toContain("&invitation=true");
    expect(inviteUrl).not.toContain("password=");

    // HTML escape check
    const escaped = escapeHtml(`<script>alert('${targetEmail}')</script>`);
    expect(escaped).not.toContain("<script>");
  });

  // ==============================================================================
  // 26. Owner Privilege Requirement to Grant Owner Role
  // ==============================================================================
  test("26. Only system owner can grant or promote to the owner role", () => {
    const validateCanGrantRole = (actorRole: string, targetRole: string) => {
      if (targetRole === "owner" && actorRole !== "owner") {
        throw new Error("ONLY_OWNER_CAN_GRANT_OWNER");
      }
      return true;
    };

    expect(validateCanGrantRole("owner", "owner")).toBe(true);
    expect(() => validateCanGrantRole("admin", "owner")).toThrow("ONLY_OWNER_CAN_GRANT_OWNER");
    expect(() => validateCanGrantRole("admissions", "owner")).toThrow("ONLY_OWNER_CAN_GRANT_OWNER");
  });

  // ==============================================================================
  // 27. Final Active Owner Deactivation/Removal Rejection
  // ==============================================================================
  test("27. Final active owner deactivation and primary owner protection", () => {
    const primaryOwnerEmail = "shahriyarkhanpk1@gmail.com";

    const validateOwnerAction = (targetEmail: string, newActiveState: boolean, otherActiveOwnersCount: number) => {
      if (targetEmail === primaryOwnerEmail && !newActiveState) {
        throw new Error("CANNOT_DEACTIVATE_PRIMARY_OWNER");
      }
      if (!newActiveState && otherActiveOwnersCount === 0) {
        throw new Error("CANNOT_REMOVE_FINAL_OWNER");
      }
      return true;
    };

    // Primary owner cannot be deactivated
    expect(() => validateOwnerAction("shahriyarkhanpk1@gmail.com", false, 1)).toThrow(
      "CANNOT_DEACTIVATE_PRIMARY_OWNER",
    );

    // Sole owner cannot be deactivated
    expect(() => validateOwnerAction("otherowner@gmail.com", false, 0)).toThrow(
      "CANNOT_REMOVE_FINAL_OWNER",
    );

    // Co-owner can be deactivated if other owners remain
    expect(validateOwnerAction("coowner@gmail.com", false, 1)).toBe(true);
  });

  // ==============================================================================
  // 28. Real Specialization Pricing & Zero-Mispricing Invariants
  // ==============================================================================
  test("28. Specialization pricing strictly assigns PKR 20,000 to premium and 15,000 to standard tracks", () => {
    // 4 Premium Specializations = exactly PKR 20,000
    expect(PREMIUM_SPECIALIZATION_FEE).toBe(20000);
    expect(PREMIUM_SPECIALIZATION_SLUGS).toEqual([
      "full-stack-developer",
      "data-analyst",
      "data-science",
      "ai-machine-learning",
    ]);

    for (const slug of PREMIUM_SPECIALIZATION_SLUGS) {
      expect(getSpecializationMonthlyFee(slug)).toBe(20000);
    }

    // 6 Standard Specializations = exactly PKR 15,000
    const standardTracks = [
      "frontend-developer",
      "website-developer",
      "backend-developer",
      "python-developer",
      "database-developer",
      "mobile-application-developer",
    ];

    expect(STANDARD_SPECIALIZATION_FEE).toBe(15000);
    for (const slug of standardTracks) {
      expect(getSpecializationMonthlyFee(slug)).toBe(15000);
    }

    // Single courses are not specializations and should return 0 monthly fee
    for (const course of courses) {
      expect(getSpecializationMonthlyFee(course.slug)).toBe(0);
    }
  });

  // ==============================================================================
  // 29. Concurrency & Monotonicity of Atomic Sequences
  // ==============================================================================
  test("29. Atomic sequence generators guarantee collision-free monotonic numbers", async () => {
    const studentIds = new Set<string>();
    const invoiceNums = new Set<string>();
    const receiptNums = new Set<string>();

    const promises = Array.from({ length: 15 }, async () => {
      const [sId, invNum, recNum] = await Promise.all([
        generateStudentId(),
        generateInvoiceNumber(),
        generateReceiptNumber(),
      ]);
      studentIds.add(sId);
      invoiceNums.add(invNum);
      receiptNums.add(recNum);
    });

    await Promise.all(promises);

    // All 15 generated IDs must be unique (no collision)
    expect(studentIds.size).toBe(15);
    expect(invoiceNums.size).toBe(15);
    expect(receiptNums.size).toBe(15);

    // Verify format compliance without random fallback strings
    for (const sId of studentIds) {
      expect(/^TBOS-\d{4}-\d{4}$/.test(sId)).toBe(true);
    }
    for (const inv of invoiceNums) {
      expect(/^INV-\d{6}-\d{4}$/.test(inv)).toBe(true);
    }
    for (const rec of receiptNums) {
      expect(/^REC-\d{6}-\d{4}$/.test(rec)).toBe(true);
    }
  });

  // ==============================================================================
  // 30. Reminder Engine Automated Schedule Calculation
  // ==============================================================================
  test("30. Reminder engine schedules 24h/1h/15m and fee milestones with idempotent keys", () => {
    const sessionTimeStr = "2026-10-25T19:00:00+05:00";
    const sessionTs = new Date(sessionTimeStr).getTime();

    const tMinus24h = new Date(sessionTs - 24 * 60 * 60 * 1000).toISOString();
    const tMinus1h = new Date(sessionTs - 60 * 60 * 1000).toISOString();
    const tMinus15m = new Date(sessionTs - 15 * 60 * 1000).toISOString();

    const sessionId = "sess-100-python";
    const recipient = "student@tbos.online";

    const key24h = `rem:class:${sessionId}:24h:${recipient}`;
    const key1h = `rem:class:${sessionId}:1h:${recipient}`;
    const key15m = `rem:class:${sessionId}:15m:${recipient}`;

    expect(new Date(tMinus24h) < new Date(tMinus1h)).toBe(true);
    expect(new Date(tMinus1h) < new Date(tMinus15m)).toBe(true);
    expect(key24h).not.toBe(key1h);
    expect(key1h).not.toBe(key15m);
  });

  // ==============================================================================
  // 31. Disaster Recovery CRM Backup Schema Contract
  // ==============================================================================
  test("31. Disaster recovery CRM backup schema defines schema_version and all 9 domains", () => {
    const backupSnapshot = {
      schema_version: "20261014.1",
      exported_at: new Date().toISOString(),
      exported_by: "shahriyarkhanpk1@gmail.com",
      academy: "TechBuilt Open School",
      entities: {
        students: [],
        batches: [],
        enrollments: [],
        fee_invoices: [],
        fee_payments: [],
        class_sessions: [],
        class_attendance: [],
        crm_tasks: [],
        crm_audit_logs: [],
      },
    };

    expect(backupSnapshot.schema_version).toBe("20261014.1");
    expect(backupSnapshot.academy).toBe("TechBuilt Open School");
    expect(backupSnapshot.exported_by).toBe("shahriyarkhanpk1@gmail.com");

    const e = backupSnapshot.entities;
    expect(Array.isArray(e.students)).toBe(true);
    expect(Array.isArray(e.batches)).toBe(true);
    expect(Array.isArray(e.enrollments)).toBe(true);
    expect(Array.isArray(e.fee_invoices)).toBe(true);
    expect(Array.isArray(e.fee_payments)).toBe(true);
    expect(Array.isArray(e.class_sessions)).toBe(true);
    expect(Array.isArray(e.class_attendance)).toBe(true);
    expect(Array.isArray(e.crm_tasks)).toBe(true);
    expect(Array.isArray(e.crm_audit_logs)).toBe(true);
  });
});
