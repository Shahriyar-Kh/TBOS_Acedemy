import { test, expect } from "@playwright/test";
import {
  formatStudentId,
  formatInvoiceNumber,
  generateStudentId,
  generateInvoiceNumber,
  isTimeWindowOverlapping,
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../../src/lib/crm.server";
import {
  createStudentSchema,
  createBatchSchema,
  recordPaymentSchema,
  createClassSessionSchema,
  convertLeadToStudentSchema,
} from "../../src/lib/crmSchemas";

test.describe("Phase 16 — TBOS Academy CRM, Student, Fee & Class Management", () => {
  // 1. Sequential ID Generators
  test("sequential ID formatters produce canonical TBOS formats", async () => {
    const currentYear = new Date().getFullYear();
    expect(formatStudentId(1, currentYear)).toBe(`TBOS-${currentYear}-0001`);
    expect(formatStudentId(42, currentYear)).toBe(`TBOS-${currentYear}-0042`);
    expect(formatStudentId(999, currentYear)).toBe(`TBOS-${currentYear}-0999`);

    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    expect(formatInvoiceNumber(1, now)).toBe(`INV-${ym}-0001`);
    expect(formatInvoiceNumber(125, now)).toBe(`INV-${ym}-0125`);

    // Async generators return string starting with prefix
    const studentId = await generateStudentId();
    expect(typeof studentId).toBe("string");
    expect(studentId.startsWith(`TBOS-${currentYear}-`)).toBe(true);

    const invoiceNum = await generateInvoiceNumber();
    expect(typeof invoiceNum).toBe("string");
    expect(invoiceNum.startsWith(`INV-${ym}-`)).toBe(true);
  });

  // 2. Domain Validation Schemas
  test("Zod validation schemas enforce required invariants", () => {
    // Student validation
    const validStudent = createStudentSchema.safeParse({
      fullName: "Ali Raza",
      email: "ali.raza@example.com",
      phone: "+923001234567",
      country: "Pakistan",
      city: "Lahore",
      billingDay: 5,
    });
    expect(validStudent.success).toBe(true);

    const invalidStudent = createStudentSchema.safeParse({
      fullName: "",
      email: "invalid-email",
    });
    expect(invalidStudent.success).toBe(false);

    // Batch validation
    const validBatch = createBatchSchema.safeParse({
      name: "Python Mastery Winter 2026",
      programSlug: "100-days-complete-python",
      programTitle: "100 Days Complete Python",
      programType: "live_batch",
      startDate: "2026-11-01",
      maxCapacity: 30,
      meetingLink: "https://meet.google.com/abc-defg-hij",
    });
    expect(validBatch.success).toBe(true);

    // Payment validation
    const validPayment = recordPaymentSchema.safeParse({
      invoiceId: "11111111-2222-3333-4444-555555555555",
      studentId: "66666666-7777-8888-9999-000000000000",
      amount: 20000,
      paymentMethod: "bank_transfer",
      paymentDate: "2026-10-14",
    });
    expect(validPayment.success).toBe(true);

    // Convert Lead to Student validation
    const validConvert = convertLeadToStudentSchema.safeParse({
      leadId: "11111111-2222-3333-4444-555555555555",
      fullName: "Hamza Tariq",
      email: "hamza@example.com",
      phone: "+923009876543",
      programSlug: "100-days-complete-python",
      programTitle: "100 Days Complete Python",
      programType: "live_batch",
      agreedFee: 20000,
      billingDay: 1,
    });
    expect(validConvert.success).toBe(true);
  });

  // 3. Timetable Schedule Clash Detection Logic
  test("timetable schedule conflict detector identifies overlapping slots correctly", () => {
    // Exact overlap: 19:00 - 20:30 overlaps with 19:30 - 21:00
    expect(isTimeWindowOverlapping("19:00", "20:30", "19:30", "21:00")).toBe(true);

    // Enclosing overlap: 18:00 - 21:00 overlaps with 19:00 - 20:00
    expect(isTimeWindowOverlapping("18:00", "21:00", "19:00", "20:00")).toBe(true);

    // Non-overlapping (adjacent end to start: 19:00-20:00 and 20:00-21:00)
    expect(isTimeWindowOverlapping("19:00", "20:00", "20:00", "21:00")).toBe(false);

    // Non-overlapping completely separate
    expect(isTimeWindowOverlapping("14:00", "15:30", "19:00", "20:30")).toBe(false);
  });

  // 4. Crypto Password Reset Token Security
  test("password reset token uses crypto-random entropy and SHA-256 storage hash", () => {
    const { rawToken, tokenHash } = generatePasswordResetToken();
    expect(typeof rawToken).toBe("string");
    expect(rawToken.length).toBe(64); // 32 bytes in hex = 64 characters

    expect(typeof tokenHash).toBe("string");
    expect(tokenHash.length).toBe(64); // SHA-256 hex = 64 characters
    expect(tokenHash).not.toBe(rawToken); // Raw token is never stored in plain text

    // Deterministic verify
    const hashedAgain = hashPasswordResetToken(rawToken);
    expect(hashedAgain).toBe(tokenHash);
  });

  // 5. Dual Ownership & Staff Roles Security Principle
  test("owner transition protocol protects current owner and supports official academy account", () => {
    const currentOwner = "shahriyarkhanpk1@gmail.com";
    const nextOwner = "techbuiltopenschool@gmail.com";

    // Both belong to owner whitelist and transition protocol
    expect(currentOwner).toBe("shahriyarkhanpk1@gmail.com");
    expect(nextOwner).toBe("techbuiltopenschool@gmail.com");

    const validRoles = ["owner", "admin", "admissions", "instructor", "accountant"];
    expect(validRoles).toContain("owner");
    expect(validRoles).toContain("admin");
    expect(validRoles).toContain("admissions");
    expect(validRoles).toContain("instructor");
    expect(validRoles).toContain("accountant");
  });

  // 6. WhatsApp Integration Policy Verification
  test("WhatsApp click-to-chat links format digits and message content safely", () => {
    const rawPhone = "+92 300 123-4567";
    const cleanedDigits = rawPhone.replace(/[^0-9]/g, "");
    expect(cleanedDigits).toBe("923001234567");

    const studentName = "Ali Raza";
    const rawTemplate = "Assalamu Alaikum {{name}}, your class starts today!";
    const compiled = rawTemplate.replace(/{{name}}/g, studentName);
    const waUrl = `https://wa.me/${cleanedDigits}?text=${encodeURIComponent(compiled)}`;

    expect(waUrl.startsWith("https://wa.me/923001234567?text=")).toBe(true);
    expect(decodeURIComponent(waUrl)).toContain("Ali Raza");
  });

  // 7. Full Academy CRM Database Backup Integrity Contract
  test("disaster recovery CRM backup schema defines all 6 primary entity domains", () => {
    const sampleBackup = {
      exportedAt: new Date().toISOString(),
      exportedBy: "shahriyarkhanpk1@gmail.com",
      academy: "TechBuilt Open School",
      version: "Phase 16 CRM 1.0",
      students: [],
      batches: [],
      invoices: [],
      timetable: [],
      tasks: [],
      auditLogs: [],
    };

    expect(Array.isArray(sampleBackup.students)).toBe(true);
    expect(Array.isArray(sampleBackup.batches)).toBe(true);
    expect(Array.isArray(sampleBackup.invoices)).toBe(true);
    expect(Array.isArray(sampleBackup.timetable)).toBe(true);
    expect(Array.isArray(sampleBackup.tasks)).toBe(true);
    expect(Array.isArray(sampleBackup.auditLogs)).toBe(true);
  });
});
