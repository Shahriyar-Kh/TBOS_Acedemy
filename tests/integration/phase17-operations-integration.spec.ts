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
  // 4. Batch Monthly Dues Generation with Individual Billing Days & Deduplication
  // ============================================================================
  test("4. generate_monthly_dues_batch creates invoices using each plan's own billing_day without duplicates", async () => {
    // A. Create Student A with billing_day = 5
    const studentARes = await client.query(
      "select public.create_student_full_tx($1::jsonb) as result",
      [
        JSON.stringify({
          fullName: `E2E-BillingDay5-${uniqueSuffix}`,
          email: `e2e-bday5-${uniqueSuffix}@test.local`,
          phone: "+923001115555",
          programSlug: "python-young-developers",
          programTitle: "Python Young Developers",
          planType: "monthly",
          agreedFee: 5000,
          discount: 0,
          billingDay: 5,
          createInitialInvoice: false,
          schedules: [],
        }),
      ]
    );
    const studentAUuid = studentARes.rows[0].result.student.id;
    const studentAEnrollmentId = studentARes.rows[0].result.enrollment_id;

    // B. Create Student B with billing_day = 20
    const studentBRes = await client.query(
      "select public.create_student_full_tx($1::jsonb) as result",
      [
        JSON.stringify({
          fullName: `E2E-BillingDay20-${uniqueSuffix}`,
          email: `e2e-bday20-${uniqueSuffix}@test.local`,
          phone: "+923002220000",
          programSlug: "100-days-complete-python",
          programTitle: "Complete Python Developer",
          planType: "monthly",
          agreedFee: 7000,
          discount: 1000,
          billingDay: 20,
          createInitialInvoice: false,
          schedules: [],
        }),
      ]
    );
    const studentBUuid = studentBRes.rows[0].result.student.id;
    const studentBEnrollmentId = studentBRes.rows[0].result.enrollment_id;

    // Run batch generator for November 2026
    const targetMonth = "2026-11";
    const duesRes1 = await client.query(
      "select public.generate_monthly_dues_batch($1, 10) as count",
      [targetMonth]
    );
    expect(duesRes1.rows.length).toBe(1);
    expect(Number(duesRes1.rows[0].count)).toBeGreaterThanOrEqual(2);

    // Verify Student A's invoice has due_date = 2026-11-05 (billing_day 5)
    const invACheck = await client.query(
      `select *, to_char(due_date, 'YYYY-MM-DD') as due_date_str from public.fee_invoices 
       where student_id = $1 and billing_month = $2`,
      [studentAUuid, targetMonth]
    );
    expect(invACheck.rows.length).toBe(1);
    expect(invACheck.rows[0].due_date_str).toBe("2026-11-05");
    expect(Number(invACheck.rows[0].amount_due)).toBe(5000);

    // Verify Student B's invoice has due_date = 2026-11-20 (billing_day 20)
    const invBCheck = await client.query(
      `select *, to_char(due_date, 'YYYY-MM-DD') as due_date_str from public.fee_invoices 
       where student_id = $1 and billing_month = $2`,
      [studentBUuid, targetMonth]
    );
    expect(invBCheck.rows.length).toBe(1);
    expect(invBCheck.rows[0].due_date_str).toBe("2026-11-20");
    expect(Number(invBCheck.rows[0].amount_due)).toBe(6000);

    // Safe handling for February clamping (e.g. billing_day 28 or clamped)
    const febMonth = "2026-02";
    await client.query(
      "select public.generate_monthly_dues_batch($1, 10) as count",
      [febMonth]
    );
    const invAFeb = await client.query(
      `select *, to_char(due_date, 'YYYY-MM-DD') as due_date_str from public.fee_invoices 
       where student_id = $1 and billing_month = $2`,
      [studentAUuid, febMonth]
    );
    expect(invAFeb.rows.length).toBe(1);
    expect(invAFeb.rows[0].due_date_str).toBe("2026-02-05");

    // Idempotency check: Rerunning generator for 2026-11 must produce 0 new duplicates
    const duesRes2 = await client.query(
      "select public.generate_monthly_dues_batch($1, 10) as count",
      [targetMonth]
    );
    expect(Number(duesRes2.rows[0].count)).toBe(0);

    // Cleanup extra student records safely
    for (const uid of [studentAUuid, studentBUuid]) {
      await client.query("delete from public.fee_invoices where student_id = $1", [uid]);
      await client.query("delete from public.billing_plans where student_id = $1", [uid]);
      await client.query("delete from public.enrollments where student_id = $1", [uid]);
      await client.query("delete from public.students where id = $1", [uid]);
    }
  });

  // ============================================================================
  // 5. Transactional Class Session Scheduling, Rollback & Override Auditing
  // ============================================================================
  test("5. Transactional timetable session creation, clash detection, rollback and override resolution", async () => {
    const sessionDate = "2026-11-22";
    const startTime = "17:00";
    const endTime = "18:30";

    // Look up an admin user
    const adminUser = await client.query("select id, email from public.admin_users limit 1");
    const adminId = adminUser.rows[0]?.id || null;
    const adminEmail = adminUser.rows[0]?.email || "admin@tbos.local";

    // 1. Create base session via create_class_sessions_tx
    const baseTx = await client.query(
      "select public.create_class_sessions_tx($1::jsonb) as result",
      [
        JSON.stringify({
          studentId: createdStudentUuid,
          title: "Base Mathematics Session",
          sessionDate,
          startTime,
          endTime,
          repeatWeeks: 1,
          override: false,
          adminUserId: adminId,
          adminEmail,
        }),
      ]
    );
    expect(baseTx.rows[0].result.ok).toBe(true);
    expect(baseTx.rows[0].result.created_count).toBe(1);
    const baseSessionId = baseTx.rows[0].result.session_ids[0];

    // 2. Attempt overlapping session without override: MUST FAIL and roll back
    await expect(
      client.query("select public.create_class_sessions_tx($1::jsonb)", [
        JSON.stringify({
          studentId: createdStudentUuid,
          title: "Conflicting Physics Session",
          sessionDate,
          startTime: "17:30",
          endTime: "19:00",
          repeatWeeks: 1,
          override: false,
          adminUserId: adminId,
          adminEmail,
        }),
      ])
    ).rejects.toThrow(/SCHEDULE_CLASH_DETECTED/);

    // Verify conflicting session was NOT inserted
    const clashCheck = await client.query(
      "select * from public.class_sessions where title = 'Conflicting Physics Session'"
    );
    expect(clashCheck.rows.length).toBe(0);

    // 3. Attempt override without mandatory reason: MUST FAIL
    await expect(
      client.query("select public.create_class_sessions_tx($1::jsonb)", [
        JSON.stringify({
          studentId: createdStudentUuid,
          title: "Unjustified Override Session",
          sessionDate,
          startTime: "17:30",
          endTime: "19:00",
          repeatWeeks: 1,
          override: true,
          overrideReason: "   ", // empty / whitespace only
          adminUserId: adminId,
          adminEmail,
        }),
      ])
    ).rejects.toThrow(/MANDATORY_OVERRIDE_REASON_REQUIRED/);

    // 4. Approved override with valid reason: MUST SUCCEED and record audit trail
    const approvedTx = await client.query(
      "select public.create_class_sessions_tx($1::jsonb) as result",
      [
        JSON.stringify({
          studentId: createdStudentUuid,
          title: "Approved Dual-Topic Lab",
          sessionDate,
          startTime: "17:30",
          endTime: "19:00",
          repeatWeeks: 1,
          override: true,
          overrideReason: "Emergency makeup class authorized by academic director",
          adminUserId: adminId,
          adminEmail,
        }),
      ]
    );
    expect(approvedTx.rows[0].result.ok).toBe(true);
    expect(approvedTx.rows[0].result.is_override).toBe(true);
    const approvedSessionId = approvedTx.rows[0].result.session_ids[0];

    // Verify row in database has is_override and override_reason
    const sessDbCheck = await client.query(
      "select * from public.class_sessions where id = $1",
      [approvedSessionId]
    );
    expect(sessDbCheck.rows.length).toBe(1);
    expect(sessDbCheck.rows[0].is_override).toBe(true);
    expect(sessDbCheck.rows[0].override_reason).toBe(
      "Emergency makeup class authorized by academic director"
    );

    // Verify audit log row was written
    const auditCheck = await client.query(
      `select * from public.crm_audit_logs 
       where entity = 'class_sessions' and action = 'class_sessions_override_scheduled'
       order by created_at desc limit 1`
    );
    expect(auditCheck.rows.length).toBe(1);

    // 5. Multi-week series atomic rollback: if week 2 clashes without override, NO sessions remain
    const futureDate = "2026-11-29"; // 1 week after base session (which is on 2026-11-22)
    // Starting on 2026-11-15, week 2 will hit 2026-11-22 (conflict with base session)
    await expect(
      client.query("select public.create_class_sessions_tx($1::jsonb)", [
        JSON.stringify({
          studentId: createdStudentUuid,
          title: "Failed Series",
          sessionDate: "2026-11-15",
          startTime: "17:00",
          endTime: "18:30",
          repeatWeeks: 3, // Week 0: Nov 15, Week 1: Nov 22 (clash!), Week 2: Nov 29
          override: false,
          adminUserId: adminId,
          adminEmail,
        }),
      ])
    ).rejects.toThrow(/SCHEDULE_CLASH_DETECTED/);

    // Verify 0 occurrences from Failed Series were inserted
    const seriesCheck = await client.query(
      "select * from public.class_sessions where title like 'Failed Series%'"
    );
    expect(seriesCheck.rows.length).toBe(0);

    // Cleanup created test sessions
    await client.query("delete from public.class_sessions where id in ($1, $2)", [
      baseSessionId,
      approvedSessionId,
    ]);
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
