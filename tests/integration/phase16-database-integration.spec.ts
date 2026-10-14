import { test, expect } from "@playwright/test";
import { Client, Pool } from "pg";

const TEST_DB_URL = "postgresql://postgres@127.0.0.1:5433/tbos_test_a";

test.describe("Phase 16 — Real Database Integration Acceptance Suite", () => {
  test.describe.configure({ mode: "serial" });

  let client: Client;
  const idempKey1 = `E2E-IDEMP-PARTIAL-${Date.now()}`;
  const txnRef1 = `E2E-TXN-PARTIAL-${Date.now()}`;

  test.beforeAll(async () => {
    client = new Client({ connectionString: TEST_DB_URL });
    await client.connect();
  });

  test.afterAll(async () => {
    await client.end();
  });

  // ============================================================================
  // 1. Insert Test Lead & Real RPC Lead-to-Student Conversion
  // ============================================================================
  let testLeadId: string;
  let testStudentUuid: string;
  let testInvoiceUuid: string;

  test("1. Insert test lead and convert through real RPC (convert_lead_to_student_tx)", async () => {
    // A. Insert test lead
    const leadRes = await client.query(`
      insert into public.admissions_requests (
        submission_kind,
        application_type,
        selected_program_slug,
        selected_program_title,
        student_name,
        email,
        phone,
        country,
        education_level,
        status
      ) values (
        'application',
        'Specialization',
        'full-stack-developer',
        'Full-Stack Developer',
        'E2E-Lead-Alice',
        'e2e-alice@test.local',
        '+923001234567',
        'Pakistan',
        'Undergraduate',
        'new'
      ) returning id;
    `);

    expect(leadRes.rows.length).toBe(1);
    testLeadId = leadRes.rows[0].id;
    expect(testLeadId).toBeDefined();

    // B. Call real convert_lead_to_student_tx RPC
    const convertRes = await client.query(`
      select public.convert_lead_to_student_tx(
        $1::uuid,
        'full-stack-developer',
        'Full-Stack Developer',
        'specialization',
        20000,
        null,
        null,
        null,
        0,
        5,
        current_date,
        'Mon-Wed-Fri 18:00',
        'E2E test enrollment notes',
        true,
        null,
        'admin@techbuiltos.online'
      ) as result;
    `, [testLeadId]);

    const result = convertRes.rows[0].result;
    expect(result).toBeDefined();
    expect(result.student).toBeDefined();
    expect(result.enrollment).toBeDefined();
    expect(result.invoice).toBeDefined();

    testStudentUuid = result.student.id;
    testInvoiceUuid = result.invoice.id;

    // Student ID pattern TBOS-YYYY-XXXX
    expect(result.student.student_id).toMatch(/^TBOS-\d{4}-\d{4}$/);
    expect(result.student.full_name).toBe("E2E-Lead-Alice");
    expect(result.student.status).toBe("active");

    // Invoice pattern INV-YYYYMM-XXXX
    expect(result.invoice.invoice_number).toMatch(/^INV-\d{6}-\d{4}$/);
    expect(Number(result.invoice.amount_due)).toBe(20000);
    expect(Number(result.invoice.balance)).toBe(20000);
    expect(result.invoice.status).toBe("due");
  });

  // ============================================================================
  // 2. Verify Student, Enrollment, Invoice, Lead Status & Audit Rows
  // ============================================================================
  test("2. Verify student, enrollment, invoice, lead status and audit rows exist in PostgreSQL", async () => {
    // Lead status must be 'enrolled'
    const leadCheck = await client.query(
      "select status from public.admissions_requests where id = $1",
      [testLeadId]
    );
    expect(leadCheck.rows[0].status).toBe("enrolled");

    // Enrollment record
    const enrollCheck = await client.query(
      "select * from public.enrollments where student_id = $1",
      [testStudentUuid]
    );
    expect(enrollCheck.rows.length).toBe(1);
    expect(enrollCheck.rows[0].program_slug).toBe("full-stack-developer");
    expect(Number(enrollCheck.rows[0].agreed_fee)).toBe(20000);

    // Audit log record
    const auditCheck = await client.query(
      "select * from public.crm_audit_logs where action = 'convert_lead_to_student' and entity_id = $1",
      [testLeadId]
    );
    expect(auditCheck.rows.length).toBeGreaterThanOrEqual(1);
    expect(auditCheck.rows[0].details.program_title).toBe("Full-Stack Developer");
  });

  // ============================================================================
  // 3. Attempt Duplicate Conversion and Verify Rejection
  // ============================================================================
  test("3. Attempt duplicate conversion and verify rejection (LEAD_ALREADY_CONVERTED)", async () => {
    await expect(
      client.query(`
        select public.convert_lead_to_student_tx(
          $1::uuid,
          'full-stack-developer',
          'Full-Stack Developer',
          'specialization',
          20000
        );
      `, [testLeadId])
    ).rejects.toThrow(/LEAD_ALREADY_CONVERTED/);
  });

  // ============================================================================
  // 4. Generate Concurrent Student/Invoice Numbers and Prove Uniqueness
  // ============================================================================
  test("4. Generate concurrent student and invoice numbers and prove collision-free uniqueness", async () => {
    const pool = new Pool({ connectionString: TEST_DB_URL, max: 10 });
    const promises = Array.from({ length: 10 }, async () => {
      const pClient = await pool.connect();
      try {
        return await pClient.query("select public.get_next_student_id() as sid, public.get_next_invoice_number() as inv;");
      } finally {
        pClient.release();
      }
    });

    const results = await Promise.all(promises);
    await pool.end();

    const studentIds = results.map((r) => r.rows[0].sid);
    const invoiceNumbers = results.map((r) => r.rows[0].inv);

    const uniqueStudents = new Set(studentIds);
    const uniqueInvoices = new Set(invoiceNumbers);

    expect(uniqueStudents.size).toBe(10);
    expect(uniqueInvoices.size).toBe(10);

    // Ensure format
    for (const sid of studentIds) expect(sid).toMatch(/^TBOS-\d{4}-\d{4}$/);
    for (const inv of invoiceNumbers) expect(inv).toMatch(/^INV-\d{6}-\d{4}$/);
  });

  // ============================================================================
  // 5. Partial Payment through Real RPC (record_payment_tx)
  // ============================================================================
  test("5. Record partial payment through real RPC (record_payment_tx)", async () => {
    const payRes = await client.query(`
      select public.record_payment_tx(
        $1::uuid,
        $2::uuid,
        10000,
        'bank_transfer',
        current_date,
        $3,
        'Partial tuition installment',
        null,
        $4,
        'accountant@techbuiltos.online'
      ) as result;
    `, [testInvoiceUuid, testStudentUuid, txnRef1, idempKey1]);

    const result = payRes.rows[0].result;
    expect(result.is_duplicate).toBe(false);
    expect(result.payment.receipt_number).toMatch(/^REC-\d{6}-\d{4}$/);
    expect(Number(result.payment.amount)).toBe(10000);
    expect(Number(result.invoice.balance)).toBe(10000);
    expect(Number(result.invoice.amount_paid)).toBe(10000);
    expect(result.invoice.status).toBe("partially_paid");
  });

  // ============================================================================
  // 6. Retry Same Idempotency Key (Idempotency Contract)
  // ============================================================================
  test("6. Retry same idempotency key returns identical payment without second debit", async () => {
    const retryRes = await client.query(`
      select public.record_payment_tx(
        $1::uuid,
        $2::uuid,
        10000,
        'bank_transfer',
        current_date,
        $3,
        'Partial tuition installment',
        null,
        $4,
        'accountant@techbuiltos.online'
      ) as result;
    `, [testInvoiceUuid, testStudentUuid, txnRef1, idempKey1]);

    const result = retryRes.rows[0].result;
    expect(result.is_duplicate).toBe(true);
    expect(Number(result.invoice.balance)).toBe(10000);

    // Verify only ONE payment row exists for this key
    const payCount = await client.query(
      "select count(*) from public.fee_payments where idempotency_key = $1",
      [idempKey1]
    );
    expect(Number(payCount.rows[0].count)).toBe(1);
  });

  // ============================================================================
  // 7. Retry Idempotency Key with Mismatched Payload Rejection
  // ============================================================================
  test("7. Retry idempotency key with mismatched payload is rejected (IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD)", async () => {
    await expect(
      client.query(`
        select public.record_payment_tx(
          $1::uuid,
          $2::uuid,
          5000, -- Mismatched amount
          'bank_transfer',
          current_date,
          $3,
          'Partial tuition installment',
          null,
          $4,
          'accountant@techbuiltos.online'
        );
      `, [testInvoiceUuid, testStudentUuid, txnRef1, idempKey1])
    ).rejects.toThrow(/IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD/);
  });

  // ============================================================================
  // 8. Reject Student/Invoice Mismatch
  // ============================================================================
  test("8. Reject student/invoice relationship mismatch", async () => {
    // Create unrelated second student
    const rand = Math.floor(1000 + Math.random() * 9000);
    const secondStudentRes = await client.query(`
      insert into public.students (student_id, full_name, email, phone)
      values ($1, 'E2E-Bob', $2, '+923000000000')
      returning id;
    `, [`TBOS-${Date.now().toString().slice(-4)}-${rand}`, `e2e-bob-${Date.now()}-${rand}@test.local`]);
    const secondStudentId = secondStudentRes.rows[0].id;

    await expect(
      client.query(`
        select public.record_payment_tx(
          $1::uuid,
          $2::uuid, -- Wrong student
          5000,
          'cash'
        );
      `, [testInvoiceUuid, secondStudentId])
    ).rejects.toThrow(/STUDENT_INVOICE_MISMATCH/);
  });

  // ============================================================================
  // 9. Reject Overpayment (amount > balance)
  // ============================================================================
  test("9. Reject overpayment exceeding current balance", async () => {
    // Current balance is 10,000; attempt 15,000
    await expect(
      client.query(`
        select public.record_payment_tx(
          $1::uuid,
          $2::uuid,
          15000,
          'bank_transfer'
        );
      `, [testInvoiceUuid, testStudentUuid])
    ).rejects.toThrow(/OVERPAYMENT_EXCEEDS_BALANCE/);
  });

  // ============================================================================
  // 10. Record Final Payment and Verify Ledger Settlement
  // ============================================================================
  test("10. Record final payment, clear invoice balance and set status to paid", async () => {
    const finalIdemp = `E2E-IDEMP-FINAL-${Date.now()}`;
    const finalTxn = `E2E-TXN-FINAL-${Date.now()}`;
    const finalPayRes = await client.query(`
      select public.record_payment_tx(
        $1::uuid,
        $2::uuid,
        10000,
        'jazzcash',
        current_date,
        $3,
        'Final settlement',
        null,
        $4,
        'accountant@techbuiltos.online'
      ) as result;
    `, [testInvoiceUuid, testStudentUuid, finalTxn, finalIdemp]);

    const result = finalPayRes.rows[0].result;
    expect(Number(result.invoice.balance)).toBe(0);
    expect(Number(result.invoice.amount_paid)).toBe(20000);
    expect(result.invoice.status).toBe("paid");

    // Verify fee_invoices row in DB
    const invCheck = await client.query(
      "select amount_paid, balance, status from public.fee_invoices where id = $1",
      [testInvoiceUuid]
    );
    expect(Number(invCheck.rows[0].amount_paid)).toBe(20000);
    expect(Number(invCheck.rows[0].balance)).toBe(0);
    expect(invCheck.rows[0].status).toBe("paid");
  });

  // ============================================================================
  // 11. Reject Payment on Already Paid / Settled Invoice
  // ============================================================================
  test("11. Reject payment on already paid or settled invoice", async () => {
    await expect(
      client.query(`
        select public.record_payment_tx(
          $1::uuid,
          $2::uuid,
          1000,
          'cash'
        );
      `, [testInvoiceUuid, testStudentUuid])
    ).rejects.toThrow(/INVOICE_NOT_PAYABLE/);
  });

  // ============================================================================
  // 12. Reject Payment on Waived / Cancelled / Refunded Invoice
  // ============================================================================
  test("12. Reject payment on waived or cancelled invoice", async () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const waivedInvRes = await client.query(`
      insert into public.fee_invoices (
        invoice_number,
        student_id,
        billing_month,
        due_date,
        amount_due,
        amount_paid,
        balance,
        status
      ) values (
        $1,
        $2,
        $3,
        current_date + interval '7 days',
        15000,
        0,
        15000,
        'waived'
      ) returning id;
    `, [`INV-WAIVED-${rand}-${Date.now().toString().slice(-4)}`, testStudentUuid, `2029-${(rand % 12 + 1).toString().padStart(2, '0')}`]);

    const waivedInvId = waivedInvRes.rows[0].id;

    await expect(
      client.query(`
        select public.record_payment_tx(
          $1::uuid,
          $2::uuid,
          5000,
          'cash'
        );
      `, [waivedInvId, testStudentUuid])
    ).rejects.toThrow(/INVOICE_NOT_PAYABLE/);
  });

  // ============================================================================
  // 13. SQL Permission Checks: Anon & Authenticated Execution Rejection
  // ============================================================================
  test("13. SQL permissions: anon and authenticated roles are denied execution of privileged RPCs", async () => {
    // Check permission catalogue
    const permRes = await client.query(`
      select
        has_function_privilege('anon', 'public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text)', 'execute') as anon_convert,
        has_function_privilege('authenticated', 'public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text)', 'execute') as auth_convert,
        has_function_privilege('service_role', 'public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text)', 'execute') as service_convert,
        has_function_privilege('anon', 'public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text)', 'execute') as anon_pay,
        has_function_privilege('authenticated', 'public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text)', 'execute') as auth_pay,
        has_function_privilege('service_role', 'public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text)', 'execute') as service_pay;
    `);

    const p = permRes.rows[0];
    expect(p.anon_convert).toBe(false);
    expect(p.auth_convert).toBe(false);
    expect(p.service_convert).toBe(true);

    expect(p.anon_pay).toBe(false);
    expect(p.auth_pay).toBe(false);
    expect(p.service_pay).toBe(true);
  });

  // ============================================================================
  // 14. Reminder Idempotency Constraint in Real Database
  // ============================================================================
  test("14. Reminder queue enforces database uniqueness on idempotency_key", async () => {
    const key = `E2E-REM-IDEMP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // First insert succeeds
    await client.query(`
      insert into public.crm_reminders (
        type,
        entity_type,
        entity_id,
        channel,
        recipient,
        recipient_name,
        scheduled_for,
        idempotency_key,
        status
      ) values (
        'class_reminder',
        'class_session',
        'a0a0a0a0-0000-0000-0000-000000000001',
        'email',
        'student@test.local',
        'Alice',
        now() + interval '1 hour',
        $1,
        'scheduled'
      );
    `, [key]);

    // Second insert with same key must throw unique constraint violation (23505)
    await expect(
      client.query(`
        insert into public.crm_reminders (
          type,
          entity_type,
          entity_id,
          channel,
          recipient,
          recipient_name,
          scheduled_for,
          idempotency_key,
          status
        ) values (
          'class_reminder',
          'class_session',
          'a0a0a0a0-0000-0000-0000-000000000001',
          'email',
          'student@test.local',
          'Alice',
          now() + interval '1 hour',
          $1,
          'scheduled'
        );
      `, [key])
    ).rejects.toThrow(/duplicate key value violates unique constraint/);
  });

  // ============================================================================
  // 15. Expired and Used Password Reset Tokens
  // ============================================================================
  test("15. Password reset tokens reject expired and already-used records", async () => {
    const expToken = `hash-exp-${Date.now()}`;
    const usedToken = `hash-used-${Date.now()}`;
    // Expired token
    await client.query(`
      insert into public.password_reset_tokens (
        email,
        token_hash,
        expires_at,
        used
      ) values (
        'expired.user@test.local',
        $1,
        now() - interval '1 hour',
        false
      );
    `, [expToken]);

    // Used token
    await client.query(`
      insert into public.password_reset_tokens (
        email,
        token_hash,
        expires_at,
        used
      ) values (
        'used.user@test.local',
        $1,
        now() + interval '1 hour',
        true
      );
    `, [usedToken]);

    // Query active tokens: neither should be eligible
    const eligibleTokens = await client.query(`
      select * from public.password_reset_tokens
      where used = false and expires_at > now()
      and token_hash in ($1, $2);
    `, [expToken, usedToken]);

    expect(eligibleTokens.rows.length).toBe(0);
  });
});
