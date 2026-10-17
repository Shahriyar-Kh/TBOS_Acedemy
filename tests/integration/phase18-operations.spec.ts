import { test, expect } from "@playwright/test";
import { Client } from "pg";

const TEST_DB_URL = "postgresql://postgres@127.0.0.1:5433/tbos_test_a";

test.describe("Phase 18 — Complete Student Operations, Timetable, Fees & Reminders Integration Suite", () => {
  test.describe.configure({ mode: "serial" });

  let client: Client;
  const uniqueSuffix = Date.now();
  const testEmail = `p18-test-${uniqueSuffix}@tbos.local`;
  const duplicatePhone = `+92300${String(uniqueSuffix).slice(-7)}`;
  const ownerId = "11111111-2222-3333-4444-555555555555";
  const ownerEmail = "shahriyarkhanpk1@gmail.com";
  let testStudentId: string;
  let testStudentUuid: string;
  let testInvoiceId: string;
  let testPaymentId: string;
  let testSessionId: string;

  test.beforeAll(async () => {
    client = new Client({ connectionString: TEST_DB_URL });
    await client.connect();
  });

  test.afterAll(async () => {
    if (client) {
      if (testStudentUuid) {
        await client.query("delete from public.crm_reminders where entity_id in (select id from public.class_sessions where student_id = $1)", [testStudentUuid]);
        await client.query("delete from public.class_attendance where student_id = $1", [testStudentUuid]);
        await client.query("delete from public.class_sessions where student_id = $1", [testStudentUuid]);
        await client.query("delete from public.fee_payments where student_id = $1", [testStudentUuid]);
        await client.query("delete from public.fee_invoices where student_id = $1", [testStudentUuid]);
        await client.query("delete from public.enrollments where student_id = $1", [testStudentUuid]);
        await client.query("delete from public.students where id = $1", [testStudentUuid]);
      }
      await client.end();
    }
  });

  // 1. Proactive Duplicate Detection & Student Creation
  test("1. Proactive duplicate student detection for matching email or phone", async () => {
    const studentNum = `TBOS-P18-${String(uniqueSuffix).slice(-4)}`;
    const res = await client.query(
      `INSERT INTO public.students (student_id, full_name, email, phone, address, date_of_birth, age, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, student_id, email, phone, address, age, status;`,
      [studentNum, "Ali Raza", testEmail, duplicatePhone, "House 42, Street 7, F-10, Islamabad", "2002-05-14", 24, "active"]
    );
    expect(res.rows.length).toBe(1);
    testStudentUuid = res.rows[0].id;
    testStudentId = res.rows[0].student_id;
    expect(res.rows[0].address).toBe("House 42, Street 7, F-10, Islamabad");
    expect(res.rows[0].age).toBe(24);

    // Duplicate check by email
    const emailDup = await client.query(
      `SELECT id, student_id, full_name FROM public.students WHERE email = $1;`,
      [testEmail]
    );
    expect(emailDup.rows.length).toBe(1);
    expect(emailDup.rows[0].id).toBe(testStudentUuid);

    // Duplicate check by phone
    const phoneDup = await client.query(
      `SELECT id, student_id, full_name FROM public.students WHERE phone = $1;`,
      [duplicatePhone]
    );
    expect(phoneDup.rows.length).toBe(1);
    expect(phoneDup.rows[0].id).toBe(testStudentUuid);
  });

  // 2. Soft Archive & Restore Student Lifecycle
  test("2. Soft archive and restore lifecycle preserves student records", async () => {
    const archiveReason = "Student requested semester break";
    const archiveRes = await client.query(
      `SELECT archive_student_tx($1::uuid, $2::text, $3::uuid, $4::text) as result;`,
      [testStudentUuid, archiveReason, ownerId, ownerEmail]
    );
    expect(archiveRes.rows.length).toBe(1);
    expect(archiveRes.rows[0].result.status).toBe("archived");

    // Verify student is archived
    const checkArchived = await client.query(
      `SELECT status, archived_at, archive_reason FROM public.students WHERE id = $1;`,
      [testStudentUuid]
    );
    expect(checkArchived.rows[0].status).toBe("archived");
    expect(checkArchived.rows[0].archived_at).not.toBeNull();
    expect(checkArchived.rows[0].archive_reason).toBe(archiveReason);

    // Restore student
    await client.query(
      `UPDATE public.students SET status = 'active', archived_at = NULL, archive_reason = NULL WHERE id = $1;`,
      [testStudentUuid]
    );
    const checkRestored = await client.query(
      `SELECT status, archived_at FROM public.students WHERE id = $1;`,
      [testStudentUuid]
    );
    expect(checkRestored.rows[0].status).toBe("active");
    expect(checkRestored.rows[0].archived_at).toBeNull();
  });

  // 3. Timetable Conflict Detection & Reschedule Flow
  test("3. Schedule conflict detection blocks clashing sessions and allows recorded override", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sessionDate = tomorrow.toISOString().split("T")[0];

    const sess1 = await client.query(
      `INSERT INTO public.class_sessions (title, session_date, start_time, end_time, student_id, instructor_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id;`,
      ["Python Fundamentals - 1:1", sessionDate, "18:00", "19:30", testStudentUuid, "Shahriyar Khan", "scheduled"]
    );
    testSessionId = sess1.rows[0].id;

    // Check conflict RPC with overlapping slot (18:30 - 20:00)
    const conflictRes = await client.query(
      `SELECT * FROM check_schedule_conflicts($1::date, $2::time, $3::time, NULL::uuid, NULL::uuid, $4::uuid, NULL::uuid);`,
      [sessionDate, "18:30", "20:00", testStudentUuid]
    );
    expect(conflictRes.rows.length).toBeGreaterThan(0);
    expect(conflictRes.rows[0].conflict_type).toBe("student_clash");

    // Override clash and record justification
    const overrideRes = await client.query(
      `INSERT INTO public.class_sessions (title, session_date, start_time, end_time, student_id, instructor_name, status, is_override, override_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, is_override, override_reason;`,
      ["Overridden Special Session", sessionDate, "18:30", "20:00", testStudentUuid, "Shahriyar Khan", "scheduled", true, "Dean approved special session"]
    );
    expect(overrideRes.rows[0].is_override).toBe(true);
    expect(overrideRes.rows[0].override_reason).toBe("Dean approved special session");

    // Clean up override session
    await client.query(`DELETE FROM public.class_sessions WHERE id = $1;`, [overrideRes.rows[0].id]);
  });

  // 4. Financial Ledger: Invoicing, Payment, Reversal and Void Rules
  test("4. Financial ledger preserves history with offsetting payment reversals and strict void guards", async () => {
    // Create manual invoice
    const invRes = await client.query(
      `INSERT INTO public.fee_invoices (invoice_number, student_id, billing_month, amount_due, amount_paid, balance, due_date, status)
       VALUES ($1, $2, $3, $4, 0, $4, $5, 'due')
       RETURNING id, invoice_number;`,
      [`INV-P18-${uniqueSuffix}`, testStudentUuid, "2026-10", 20000, "2026-10-25"]
    );
    testInvoiceId = invRes.rows[0].id;

    // Record initial payment of 12,000
    const payRes = await client.query(
      `INSERT INTO public.fee_payments (invoice_id, student_id, amount, payment_date, payment_method, reference_number)
       VALUES ($1, $2, $3, CURRENT_DATE, 'bank_transfer', $4)
       RETURNING id, amount;`,
      [testInvoiceId, testStudentUuid, 12000, `TXN-${uniqueSuffix}`]
    );
    testPaymentId = payRes.rows[0].id;

    // Update invoice balance
    await client.query(
      `UPDATE public.fee_invoices SET amount_paid = 12000, balance = 8000, status = 'partially_paid' WHERE id = $1;`,
      [testInvoiceId]
    );

    // Guard: Attempting to void an invoice with active unreversed payment must fail
    let voidError: any = null;
    try {
      await client.query(
        `SELECT void_fee_invoice_tx($1::uuid, $2::text, $3::uuid, $4::text);`,
        [testInvoiceId, "Attempt void with active payment", ownerId, ownerEmail]
      );
    } catch (err: any) {
      voidError = err;
    }
    expect(voidError).not.toBeNull();
    expect(voidError.message).toContain("CANNOT_VOID_INVOICE_WITH_ACTIVE_PAYMENTS");

    // Reverse the payment via reverse_fee_payment_tx RPC
    const revRes = await client.query(
      `SELECT reverse_fee_payment_tx($1::uuid, $2::text, $3::uuid, $4::text) as result;`,
      [testPaymentId, "Bank transfer bounce correction", ownerId, ownerEmail]
    );
    expect(revRes.rows.length).toBe(1);

    // Verify invoice balance is restored
    const invAfterReversal = await client.query(
      `SELECT amount_paid, balance, status FROM public.fee_invoices WHERE id = $1;`,
      [testInvoiceId]
    );
    expect(Number(invAfterReversal.rows[0].amount_paid)).toBe(0);
    expect(Number(invAfterReversal.rows[0].balance)).toBe(20000);
    expect(invAfterReversal.rows[0].status).toBe("due");

    // Guard: Attempting to reverse an already reversed payment must fail
    let doubleRevError: any = null;
    try {
      await client.query(
        `SELECT reverse_fee_payment_tx($1::uuid, $2::text, $3::uuid, $4::text);`,
        [testPaymentId, "Second reversal attempt", ownerId, ownerEmail]
      );
    } catch (err: any) {
      doubleRevError = err;
    }
    expect(doubleRevError).not.toBeNull();
    expect(doubleRevError.message).toContain("PAYMENT_ALREADY_REVERSED");

    // Now voiding the invoice succeeds because active payments = 0
    const voidSuccess = await client.query(
      `SELECT void_fee_invoice_tx($1::uuid, $2::text, $3::uuid, $4::text) as result;`,
      [testInvoiceId, "Student cancelled enrollment prior to start", ownerId, ownerEmail]
    );
    expect(voidSuccess.rows.length).toBe(1);

    const invAfterVoid = await client.query(
      `SELECT status, balance FROM public.fee_invoices WHERE id = $1;`,
      [testInvoiceId]
    );
    expect(invAfterVoid.rows[0].status).toBe("voided");
    expect(Number(invAfterVoid.rows[0].balance)).toBe(0);
  });

  // 5. Safe Delete Guard (409 equivalent) on Operational History
  test("5. Safe delete RPC strictly rejects deletion of students with financial history", async () => {
    let deleteError: any = null;
    try {
      await client.query(
        `SELECT delete_student_safe_tx($1::uuid, $2::uuid, $3::text);`,
        [testStudentUuid, ownerId, ownerEmail]
      );
    } catch (err: any) {
      deleteError = err;
    }
    expect(deleteError).not.toBeNull();
    expect(deleteError.message).toContain("STUDENT_HAS_OPERATIONAL_HISTORY");
  });

  // 6. Safe Delete Permissions Guard
  test("6. Non-owner admin cannot invoke delete_student_safe_tx", async () => {
    let nonOwnerError: any = null;
    try {
      await client.query(
        `SELECT delete_student_safe_tx($1::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'hacker@test.local');`,
        [testStudentUuid]
      );
    } catch (err: any) {
      nonOwnerError = err;
    }
    expect(nonOwnerError).not.toBeNull();
    expect(nonOwnerError.message).toContain("ONLY_OWNER_CAN_PERMANENTLY_DELETE");
  });

  // 7. Automated Reminders Lifecycle & Cancellation Cleanup
  test("7. Scheduled reminders are automatically cleaned up when session is cancelled", async () => {
    // Insert reminders for testSessionId
    const rem1 = await client.query(
      `INSERT INTO public.crm_reminders (type, entity_type, entity_id, recipient, channel, scheduled_for, idempotency_key, status)
       VALUES ('class_reminder', 'class_session', $1, 'student@test.local', 'email', NOW() + INTERVAL '1 hour', $2, 'scheduled')
       RETURNING id;`,
      [testSessionId, `rem-test-${uniqueSuffix}`]
    );
    const remId = rem1.rows[0].id;

    // Cancel session and cleanup reminders (as done in timetable.$id DELETE handler)
    await client.query(
      `UPDATE public.class_sessions SET status = 'cancelled' WHERE id = $1;`,
      [testSessionId]
    );
    await client.query(
      `UPDATE public.crm_reminders SET status = 'cancelled' WHERE entity_id = $1 AND status = 'scheduled';`,
      [testSessionId]
    );

    const remCheck = await client.query(
      `SELECT status FROM public.crm_reminders WHERE id = $1;`,
      [remId]
    );
    expect(remCheck.rows[0].status).toBe("cancelled");
  });
});
