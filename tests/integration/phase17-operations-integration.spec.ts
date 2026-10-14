import { test, expect } from "@playwright/test";
import { Client } from "pg";
import { generateIcsCalendar } from "../../src/lib/icalendar";

const TEST_DB_URL = "postgresql://postgres@127.0.0.1:5433/tbos_test_a";

test.describe("Phase 17 — Academy Operations & Scheduling Real Database Integration Suite", () => {
  test.describe.configure({ mode: "serial" });

  let client: Client;
  const uniqueSuffix = Date.now();
  const testEmail = `e2e-p17-student-${uniqueSuffix}@test.local`;
  let createdStudentId: string;
  let createdStudentUuid: string;
  let createdEnrollmentId: string;
  let createdInvoiceId: string;

  test.beforeAll(async () => {
    client = new Client({ connectionString: TEST_DB_URL });
    await client.connect();
  });

  test.afterAll(async () => {
    // Teardown test data safely
    if (client) {
      if (createdStudentUuid) {
        await client.query("delete from public.class_sessions where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.recurring_class_schedules where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.fee_payments where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.fee_invoices where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.billing_plans where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.enrollments where student_id = $1", [createdStudentUuid]);
        await client.query("delete from public.crm_tasks where related_type = 'student' and related_id = $1", [createdStudentUuid]);
        await client.query("delete from public.students where id = $1", [createdStudentUuid]);
      }
      await client.end();
    }
  });

  // ============================================================================
  // 1. Atomic Student Registration via create_student_full_tx RPC
  // ============================================================================
  test("1. Atomic full student creation with enrollment, billing plan, initial invoice and recurring schedule", async () => {
    const payload = {
      fullName: `E2E-P17 Bilal Khan ${uniqueSuffix}`,
      email: testEmail,
      phone: "+923009988776",
      whatsapp: "+923009988776",
      guardianName: "Tariq Khan",
      guardianPhone: "+923219988776",
      guardianRelationship: "Father",
      emergencyContact: "Uncle (+923331122334)",
      country: "Pakistan",
      city: "Lahore",
      timezone: "Asia/Karachi",
      status: "active",
      notes: "Phase 17 automated integration test record",

      programSlug: "100-days-complete-python",
      programTitle: "Complete Python Developer",
      programType: "live_batch",
      mode: "group",
      startDate: new Date().toISOString().split("T")[0],
      expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      agreedFee: 5000,
      discount: 1000,

      planType: "monthly",
      billingDay: 1,
      createInitialInvoice: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

      schedules: [
        {
          dayOfWeek: 1, // Monday
          startTime: "18:00",
          endTime: "19:30",
          meetingUrl: "https://meet.google.com/tbos-test-slot-1",
          timezone: "Asia/Karachi",
        },
        {
          dayOfWeek: 3, // Wednesday
          startTime: "18:00",
          endTime: "19:30",
          meetingUrl: "https://meet.google.com/tbos-test-slot-2",
          timezone: "Asia/Karachi",
        },
      ],
      generateWeeks: 4,
    };

    const res = await client.query(
      "select public.create_student_full_tx($1::jsonb) as result",
      [JSON.stringify(payload)]
    );

    expect(res.rows.length).toBe(1);
    const result = res.rows[0].result;
    expect(result.student).toBeDefined();
    expect(result.student_id).toMatch(/^TBOS-\d{4}-\d{4}$/);
    expect(result.enrollment_id).toBeDefined();
    expect(result.invoice).toBeDefined();
    expect(result.invoice.invoice_number).toMatch(/^INV-\d{6}-\d{4}$/);
    expect(Number(result.invoice.amount_due)).toBe(4000); // 5000 - 1000
    expect(result.sessions_count).toBe(8); // 2 slots * 4 weeks

    createdStudentUuid = result.student.id;
    createdStudentId = result.student_id;
    createdEnrollmentId = result.enrollment_id;
    createdInvoiceId = result.invoice.id;

    // Verify student record in DB
    const studentCheck = await client.query("select * from public.students where id = $1", [createdStudentUuid]);
    expect(studentCheck.rows.length).toBe(1);
    expect(studentCheck.rows[0].guardian_relationship).toBe("Father");
    expect(studentCheck.rows[0].emergency_contact).toBe("Uncle (+923331122334)");

    // Verify enrollment record in DB
    const enrCheck = await client.query("select * from public.enrollments where id = $1", [createdEnrollmentId]);
    expect(enrCheck.rows.length).toBe(1);
    expect(Number(enrCheck.rows[0].agreed_fee)).toBe(5000);
    expect(enrCheck.rows[0].status).toBe("active");

    // Verify billing plan record in DB
    const planCheck = await client.query("select * from public.billing_plans where student_id = $1", [createdStudentUuid]);
    expect(planCheck.rows.length).toBe(1);
    expect(planCheck.rows[0].plan_type).toBe("monthly");
    expect(Number(planCheck.rows[0].amount)).toBe(4000);

    // Verify recurring class schedules in DB
    const schedCheck = await client.query("select * from public.recurring_class_schedules where student_id = $1", [createdStudentUuid]);
    expect(schedCheck.rows.length).toBe(2);

    // Verify upfront generated class session occurrences
    const sessCheck = await client.query(
      "select * from public.class_sessions where student_id = $1 order by session_date asc",
      [createdStudentUuid]
    );
    expect(sessCheck.rows.length).toBe(8);
    expect(sessCheck.rows[0].meeting_link).toContain("https://meet.google.com/tbos-test-slot-");
  });

  // ============================================================================
  // 2. Duplicate Email Prevention & Atomic Rollback
  // ============================================================================
  test("2. Duplicate email rejection fails gracefully and rolls back completely", async () => {
    const duplicatePayload = {
      fullName: "Duplicate User Attempt",
      email: testEmail, // same email
      phone: "+923000000000",
      agreedFee: 5000,
    };

    let errorCaught = false;
    try {
      await client.query(
        "select public.create_student_full_tx($1::jsonb) as result",
        [JSON.stringify(duplicatePayload)]
      );
    } catch (err: any) {
      errorCaught = true;
      expect(err.message).toContain("STUDENT_EMAIL_EXISTS");
    }
    expect(errorCaught).toBe(true);
  });

  // ============================================================================
  // 3. Batch Recurring Session Generation (generate_recurring_sessions_batch)
  // ============================================================================
  test("3. generate_recurring_sessions_batch generates sessions and avoids duplicates", async () => {
    // Generate next 2 weeks (returns int count)
    const genRes = await client.query("select public.generate_recurring_sessions_batch(2) as count");
    expect(genRes.rows.length).toBe(1);
    const count1 = Number(genRes.rows[0].count);
    expect(count1).toBeGreaterThanOrEqual(0);

    // Immediate second run should generate 0 duplicates (idempotent)
    const genRes2 = await client.query("select public.generate_recurring_sessions_batch(2) as count");
    const count2 = Number(genRes2.rows[0].count);
    expect(count2).toBe(0);
  });

  // ============================================================================
  // 4. Batch Monthly Dues Generation (generate_monthly_dues_batch)
  // ============================================================================
  test("4. generate_monthly_dues_batch creates next month invoices without duplicates", async () => {
    const targetMonth = "2026-12";
    const duesRes1 = await client.query("select public.generate_monthly_dues_batch($1, 10) as count", [targetMonth]);
    expect(duesRes1.rows.length).toBe(1);
    const count1 = Number(duesRes1.rows[0].count);
    expect(count1).toBeGreaterThanOrEqual(1);

    // Re-run for same month should generate 0 duplicates (idempotency check)
    const duesRes2 = await client.query("select public.generate_monthly_dues_batch($1, 10) as count", [targetMonth]);
    const count2 = Number(duesRes2.rows[0].count);
    expect(count2).toBe(0);
  });

  // ============================================================================
  // 5. Timetable Clash Detection and Override Recording
  // ============================================================================
  test("5. Timetable session conflict detection and override resolution", async () => {
    const conflictDate = "2026-11-20";
    const startTime = "19:00";
    const endTime = "20:30";

    // Insert session A for student
    const sessA = await client.query(
      `insert into public.class_sessions (student_id, title, session_date, start_time, end_time, status)
       values ($1, 'Session A', $2, $3, $4, 'scheduled') returning id`,
      [createdStudentUuid, conflictDate, startTime, endTime]
    );
    expect(sessA.rows.length).toBe(1);

    // Query overlapping session for same student
    const overlapCheck = await client.query(
      `select id, title from public.class_sessions
       where student_id = $1
         and session_date = $2
         and not (end_time <= $3 or start_time >= $4)`,
      [createdStudentUuid, conflictDate, startTime, endTime]
    );
    expect(overlapCheck.rows.length).toBe(1);
    expect(overlapCheck.rows[0].title).toBe("Session A");

    // Look up an admin user if available
    const adminUser = await client.query("select id from public.admin_users limit 1");
    const adminId = adminUser.rows[0]?.id || null;

    // Insert session B with explicit override
    const sessB = await client.query(
      `insert into public.class_sessions (
         student_id, title, session_date, start_time, end_time, status,
         is_override, override_reason, override_by
       ) values (
         $1, 'Session B (Overridden)', $2, $3, $4, 'scheduled',
         true, 'Special dual-topic makeup session authorized by admin', $5
       ) returning id, is_override, override_reason, override_by`,
      [createdStudentUuid, conflictDate, startTime, endTime, adminId]
    );

    expect(sessB.rows.length).toBe(1);
    expect(sessB.rows[0].is_override).toBe(true);
    expect(sessB.rows[0].override_reason).toBe("Special dual-topic makeup session authorized by admin");

    // Cleanup conflict sessions
    await client.query("delete from public.class_sessions where id in ($1, $2)", [sessA.rows[0].id, sessB.rows[0].id]);
  });

  // ============================================================================
  // 6. iCalendar RFC 5545 Generation Verification
  // ============================================================================
  test("6. RFC 5545 compliant iCalendar string generation", () => {
    const calendarString = generateIcsCalendar([
      {
        id: "TEST-SESSION-001",
        title: "Live Python OOP Mastery",
        description: "Advanced OOP concepts with Python dataclasses",
        sessionDate: "2026-11-05",
        startTime: "18:00",
        endTime: "19:30",
        timezone: "Asia/Karachi",
        meetingLink: "https://meet.google.com/tbos-test-cal",
        instructorName: "Shahriyar Khan",
        batchOrStudentName: "Python Dev Cohort 4",
      },
      {
        id: "TEST-SESSION-002",
        title: "Data Analysis with Pandas",
        sessionDate: "2026-11-07",
        startTime: "18:00",
        endTime: "19:30",
        timezone: "Asia/Karachi",
        meetingLink: "https://meet.google.com/tbos-test-cal-2",
      },
    ]);

    expect(calendarString).toContain("BEGIN:VCALENDAR");
    expect(calendarString).toContain("VERSION:2.0");
    expect(calendarString).toContain("PRODID:-//TechBuilt Open School//TBOS Academy Timetable//EN");
    expect(calendarString).toContain("BEGIN:VEVENT");
    expect(calendarString).toContain("SUMMARY:Live Python OOP Mastery");
    expect(calendarString).toContain("LOCATION:https://meet.google.com/tbos-test-cal");
    expect(calendarString).toContain("SUMMARY:Data Analysis with Pandas");
    expect(calendarString).toContain("END:VEVENT");
    expect(calendarString).toContain("END:VCALENDAR");
  });
});
