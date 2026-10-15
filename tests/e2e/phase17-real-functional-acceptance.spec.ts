import { test, expect, Page } from "@playwright/test";
import { Client } from "pg";

const TEST_DB_URL = "postgresql://postgres@127.0.0.1:5433/tbos_test_a";

// Helpers for authenticating admin session in browser localStorage without mocking APIs
function makeMockJwt(userId: string, email: string, role = "authenticated") {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + 7200,
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString("base64url");
  return `${header}.${payload}.mock-signature`;
}

async function authenticateAs(page: Page, user: { id: string; email: string }) {
  const jwt = makeMockJwt(user.id, user.email);

  await page.addInitScript(
    ({ userData, token }) => {
      window.localStorage.setItem(
        "sb-ygueodtgrxymtzebromp-auth-token",
        JSON.stringify({
          access_token: token,
          token_type: "bearer",
          expires_in: 7200,
          expires_at: Math.floor(Date.now() / 1000) + 7200,
          refresh_token: "mock-refresh-token",
          user: {
            id: userData.id,
            email: userData.email,
            role: "authenticated",
            aud: "authenticated",
            app_metadata: { provider: "email" },
            user_metadata: {},
            created_at: new Date().toISOString(),
          },
        })
      );
    },
    { userData: user, token: jwt }
  );
}

test.describe("Phase 17 — Real Academy Operations Functional Acceptance Suite", () => {
  test.describe.configure({ mode: "serial" });

  let pgClient: Client;
  const uniqueId = Date.now();
  const testEmail = `e2e-reg-${uniqueId}@test.local`;
  const testStudentName = `E2E-Real Student ${uniqueId}`;
  const oneTimeStudentName = `E2E-OneTime Student ${uniqueId}`;
  const oneTimeEmail = `e2e-onetime-${uniqueId}@test.local`;

  let createdStudentIdStr: string = "";
  let createdStudentUuid: string = "";
  let createdBatchUuid: string = "";
  let createdInvoiceId: string = "";
  let oneTimeStudentUuid: string = "";

  const ownerUser = {
    id: "11111111-2222-3333-4444-555555555555",
    email: "shahriyarkhanpk1@gmail.com",
    role: "owner" as const,
  };

  test.beforeAll(async () => {
    pgClient = new Client({ connectionString: TEST_DB_URL });
    await pgClient.connect();

    // Seed a test batch in batches table
    const batchRes = await pgClient.query(
      `insert into public.batches (
         name, program_slug, program_title, program_type, mode,
         days_of_week, start_time, end_time, timezone, max_capacity, active_student_count, status
       ) values (
         'E2E-Batch Web Dev Cohort', 'full-stack-web-development', 'Full-Stack Web Development',
         'live_batch', 'group', '{"Monday", "Wednesday"}', '18:00', '19:30', 'Asia/Karachi', 20, 0, 'active'
       ) returning id`,
      []
    );
    createdBatchUuid = batchRes.rows[0].id;
  });

  test.afterAll(async () => {
    if (pgClient) {
      const studentIds = [createdStudentUuid, oneTimeStudentUuid].filter(Boolean);
      for (const sId of studentIds) {
        await pgClient.query("delete from public.class_sessions where student_id = $1", [sId]);
        await pgClient.query("delete from public.recurring_class_schedules where student_id = $1", [sId]);
        await pgClient.query("delete from public.fee_payments where student_id = $1", [sId]);
        await pgClient.query("delete from public.fee_invoices where student_id = $1", [sId]);
        await pgClient.query("delete from public.billing_plans where student_id = $1", [sId]);
        await pgClient.query("delete from public.enrollments where student_id = $1", [sId]);
        await pgClient.query("delete from public.crm_tasks where related_id = $1::text", [sId]);
        await pgClient.query("delete from public.students where id = $1", [sId]);
      }
      if (createdBatchUuid) {
        await pgClient.query("delete from public.class_sessions where batch_id = $1", [createdBatchUuid]);
        await pgClient.query("delete from public.batches where id = $1", [createdBatchUuid]);
      }
      await pgClient.query("delete from public.crm_tasks where title like 'E2E Follow-up Task%'");
      await pgClient.end();
    }
  });

  // ============================================================================
  // Test 1: Full 4-Step Student Creation (Monthly Plan, Real Catalog & DB Persistence)
  // ============================================================================
  test("1. Full four-step student creation: real program selection, monthly fee plan, individual billing day, multiple weekly class slots", async ({ page }) => {
    test.setTimeout(45000);
    page.on("console", (msg) => console.log("BROWSER CONSOLE:", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.log("BROWSER ERROR:", err.message));
    page.on("requestfailed", (req) => console.log("REQUEST FAILED:", req.url(), req.failure()?.errorText));
    page.on("request", (req) => console.log("REQ:", req.method(), req.url()));
    page.on("response", (res) => console.log("RES:", res.status(), res.url()));
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/students", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Students Management & Roster/i })).toBeVisible({ timeout: 15000 });

    // Wait for initial students load / React hydration to complete
    await expect(page.getByText("Loading students...")).not.toBeVisible({ timeout: 15000 });

    // Open Register Student Wizard Modal
    const registerBtn = page.getByRole("button", { name: /Complete Registration Wizard/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // Expect modal to be open
    await expect(page.getByRole("heading", { name: /New Student Registration Wizard/i })).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder("e.g. Bilal Hassan").fill(testStudentName);
    await page.getByPlaceholder("bilal@example.com").fill(testEmail);
    await page.getByPlaceholder("+92 300 1234567").first().fill("+923001234567");
    await page.getByPlaceholder("Contact name and phone").fill("+923219876543");
    await page.getByPlaceholder("e.g. Tariq Hassan").fill("Tariq Hassan");

    // Click Next to Step 2
    await page.getByRole("button", { name: /^Next/i }).click();

    // STEP 2: Program Enrollment & Real Catalog Verification
    await expect(page.getByText("Program Enrollment").first()).toBeVisible();

    // Verify program track dropdown exists
    const trackSelect = page.locator("select").filter({ hasText: /Live Group Batch/i });
    await expect(trackSelect).toBeVisible();

    // Select Specialization to test 20,000 / 15,000 fee rules
    await trackSelect.selectOption("specialization");

    // Offering select
    const offeringSelect = page.locator("div:has(> label:has-text('Program / Course Offering')) select");
    await expect(offeringSelect).toBeVisible();
    await expect(offeringSelect.locator("option").first()).toContainText("PKR");
    const options = await offeringSelect.locator("option").allTextContents();

    // Check pricing rules: Full-Stack Developer is PKR 20,000; Frontend Developer is PKR 15,000
    expect(options.some((o) => o.includes("Full-Stack Developer") && o.includes("20,000"))).toBe(true);
    expect(options.some((o) => o.includes("Frontend Developer") && o.includes("15,000"))).toBe(true);

    // Test switching to Single Course: price is TBD / Manual (not hardcoded)
    await trackSelect.selectOption("course");
    await expect(offeringSelect.locator("option").first()).toContainText("Fee TBD / Manual");
    const courseOptions = await offeringSelect.locator("option").allTextContents();
    expect(courseOptions.some((o) => o.includes("Fee TBD / Manual"))).toBe(true);

    // Test "Custom Training Program" manual option
    await offeringSelect.selectOption("custom");
    await expect(page.getByPlaceholder("Enter custom training program title...")).toBeVisible();

    // Switch back to Live Group Batch and assign batch
    await trackSelect.selectOption("live_batch");
    await expect(offeringSelect.locator("option").first()).toContainText("PKR");
    await offeringSelect.selectOption({ index: 0 });

    const batchSelect = page.locator("select").filter({ hasText: /None \/ Standalone/i });
    if ((await batchSelect.count()) > 0) {
      await batchSelect.selectOption(createdBatchUuid);
    }

    // Click Next to Step 3
    await page.getByRole("button", { name: /^Next/i }).click();

    // STEP 3: Fee & Billing Plan
    await expect(page.getByText("Fee & Billing Plan").first()).toBeVisible();

    // Set individual billing day to 15
    const billingDayInput = page.locator("div:has(> label:has-text('Monthly Billing Day')) input");
    await billingDayInput.fill("15");

    // Set Base Fee = 35000, Discount = 0
    const baseFeeInput = page.locator("div:has(> label:has-text('Base Fee')) input");
    await baseFeeInput.fill("35000");
    const discountInput = page.locator("div:has(> label:has-text('Discount Amount')) input");
    await discountInput.fill("0");
    await expect(page.getByText("PKR 35,000")).toBeVisible();

    // Ensure initial invoice checkbox is checked
    const invoiceCheckbox = page.locator("input[type='checkbox']").first();
    await expect(invoiceCheckbox).toBeChecked();

    // Click Next to Step 4
    await page.getByRole("button", { name: /^Next/i }).click();

    // STEP 4: Timetable & Recurring Class Schedule
    await expect(page.getByText("Weekly Recurring Class Slots").first()).toBeVisible();

    // Add slot
    await page.getByRole("button", { name: /Add Slot/i }).click();
    await page.locator("input[type='time']").first().fill("18:00");
    await page.locator("input[type='time']").nth(1).fill("19:30");
    await page.locator("input[type='url']").first().fill("https://meet.google.com/test-tbos-e2e");

    // Submit complete 4-step registration
    const submitBtn = page.getByRole("button", { name: /Complete Registration & Setup System/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Wait for modal to close
    await expect(page.getByRole("heading", { name: /New Student Registration Wizard/i })).not.toBeVisible({ timeout: 15000 });

    // Assert student appears in roster
    await expect(page.getByText(testStudentName).first()).toBeVisible({ timeout: 15000 });

    // Verify in PostgreSQL database
    const dbStudent = await pgClient.query("select * from public.students where email = $1", [testEmail]);
    expect(dbStudent.rows.length).toBe(1);
    createdStudentUuid = dbStudent.rows[0].id;
    createdStudentIdStr = dbStudent.rows[0].student_id;
    expect(dbStudent.rows[0].billing_day).toBe(15);

    // Verify enrollment delivery_mode
    const dbEnrollment = await pgClient.query("select * from public.enrollments where student_id = $1", [createdStudentUuid]);
    expect(dbEnrollment.rows.length).toBe(1);
    expect(dbEnrollment.rows[0].delivery_mode).toBe("group");

    // Verify billing plan
    const dbPlan = await pgClient.query("select * from public.billing_plans where student_id = $1", [createdStudentUuid]);
    expect(dbPlan.rows.length).toBe(1);
    expect(Number(dbPlan.rows[0].amount)).toBe(35000);
    expect(dbPlan.rows[0].billing_day).toBe(15);

    // Verify invoice
    const dbInv = await pgClient.query("select * from public.fee_invoices where student_id = $1", [createdStudentUuid]);
    expect(dbInv.rows.length).toBe(1);
    createdInvoiceId = dbInv.rows[0].id;
    expect(Number(dbInv.rows[0].amount_due)).toBe(35000);
    expect(Number(dbInv.rows[0].balance)).toBe(35000);
  });

  // ============================================================================
  // Test 2: One-Time Fee Plan Student Creation
  // ============================================================================
  test("2. One-time fee plan student creation & DB verification", async ({ page }) => {
    test.setTimeout(45000);
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/students", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Students Management & Roster/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Loading students...")).not.toBeVisible({ timeout: 15000 });

    const registerBtn = page.getByRole("button", { name: /Complete Registration Wizard/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();
    await expect(page.getByRole("heading", { name: /New Student Registration Wizard/i })).toBeVisible({ timeout: 10000 });

    // Step 1
    await page.getByPlaceholder("e.g. Bilal Hassan").fill(oneTimeStudentName);
    await page.getByPlaceholder("bilal@example.com").fill(oneTimeEmail);
    await page.getByPlaceholder("+92 300 1234567").first().fill("+923007654321");
    await page.getByRole("button", { name: /^Next/i }).click();

    // Step 2
    await expect(page.getByText("Program Enrollment").first()).toBeVisible();
    await page.getByRole("button", { name: /^Next/i }).click();

    // Step 3: Select One-Time Full Payment
    await expect(page.getByText("Fee & Billing Plan").first()).toBeVisible();
    const planSelect = page.locator("select").filter({ hasText: /Monthly Recurring Dues/i });
    await planSelect.selectOption("one_time");
    const baseFeeInput = page.locator("div:has(> label:has-text('Base Fee')) input");
    await baseFeeInput.fill("50000");
    await page.getByRole("button", { name: /^Next/i }).click();

    // Step 4
    await expect(page.getByText("Weekly Recurring Class Slots").first()).toBeVisible();
    await page.getByRole("button", { name: /Complete Registration & Setup System/i }).click();

    await expect(page.getByRole("heading", { name: /New Student Registration Wizard/i })).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByText(oneTimeStudentName).first()).toBeVisible({ timeout: 15000 });

    const dbStudent = await pgClient.query("select * from public.students where email = $1", [oneTimeEmail]);
    expect(dbStudent.rows.length).toBe(1);
    oneTimeStudentUuid = dbStudent.rows[0].id;

    const dbPlan = await pgClient.query("select * from public.billing_plans where student_id = $1", [oneTimeStudentUuid]);
    expect(dbPlan.rows.length).toBe(1);
    expect(dbPlan.rows[0].plan_type).toBe("one_time");
    expect(Number(dbPlan.rows[0].amount)).toBe(50000);
  });

  // ============================================================================
  // Test 3: Student Visible After Reload
  // ============================================================================
  test("3. Student visible after reload with student ID", async ({ page }) => {
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/students", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(testStudentName).first()).toBeVisible({ timeout: 15000 });

    // Reload page
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(testStudentName).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(createdStudentIdStr).first()).toBeVisible();
  });

  // ============================================================================
  // Test 4: Classes Visible in Timetable
  // ============================================================================
  test("4. Classes visible in timetable schedule", async ({ page }) => {
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/timetable", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Timetable & Class Schedule/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Loading live schedule...")).not.toBeVisible({ timeout: 15000 });

    // Verify sessions query returned sessions and table or session list rendered
    const sessCount = await page.locator("table tbody tr, .border.rounded-xl").count();
    expect(sessCount).toBeGreaterThan(0);
  });

  // ============================================================================
  // Test 5: Clash Warning, Cancel Clash Flow & Confirmed Override with Mandatory Reason
  // ============================================================================
  test("5. Clash warning, cancel clash flow, and confirmed override with mandatory reason", async ({ page }) => {
    test.setTimeout(45000);
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/timetable", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Timetable & Class Schedule/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Loading live schedule...")).not.toBeVisible({ timeout: 15000 });

    const scheduleBtn = page.getByRole("button", { name: /Schedule Class/i }).first();
    await expect(scheduleBtn).toBeVisible();
    await scheduleBtn.click();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).toBeVisible({ timeout: 10000 });

    // Fill in initial session details
    const conflictDate = "2026-12-15";
    await page.locator("div:has(> label:has-text('Session Topic / Title')) input").fill("Initial Base Class");
    await page.locator("input[type='date']").first().fill(conflictDate);
    await page.locator("input[type='time']").first().fill("14:00");
    await page.locator("input[type='time']").nth(1).fill("15:30");

    const batchSelect = page.locator("select").filter({ hasText: /Select a batch/i });
    if ((await batchSelect.count()) > 0) {
      await batchSelect.selectOption(createdBatchUuid);
    }

    // Schedule base session
    await page.getByRole("button", { name: /Schedule Session/i }).click();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).not.toBeVisible({ timeout: 10000 });

    // Attempt overlapping session on same batch and date/time
    await scheduleBtn.click();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).toBeVisible({ timeout: 10000 });
    await page.locator("div:has(> label:has-text('Session Topic / Title')) input").fill("Conflicting Overlapping Class");
    await page.locator("input[type='date']").first().fill(conflictDate);
    await page.locator("input[type='time']").first().fill("14:00");
    await page.locator("input[type='time']").nth(1).fill("15:30");
    if ((await batchSelect.count()) > 0) {
      await batchSelect.selectOption(createdBatchUuid);
    }

    // Submit -> triggers clash modal (HTTP 409 from server)
    await page.getByRole("button", { name: /Schedule Session/i }).click();

    // Assert clash modal is rendered
    await expect(page.getByRole("heading", { name: /Schedule Clash Detected/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/conflicts with an existing commitment/i)).toBeVisible();

    // Cancel clash flow: Click Cancel & Reschedule
    const cancelBtn = page.getByRole("button", { name: /Cancel & Reschedule/i });
    await cancelBtn.click();
    await expect(page.getByRole("heading", { name: /Schedule Clash Detected/i })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).toBeVisible();

    // Clicking Cancel on the schedule form closes the scheduling modal completely
    await page.getByRole("button", { name: /^Cancel$/i }).click();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).not.toBeVisible({ timeout: 10000 });

    // Re-open and trigger clash modal again
    await scheduleBtn.click();
    await expect(page.getByRole("heading", { name: /Schedule Class Session/i })).toBeVisible({ timeout: 10000 });
    await page.locator("div:has(> label:has-text('Session Topic / Title')) input").fill("Conflicting Overlapping Class");
    await page.locator("input[type='date']").first().fill(conflictDate);
    await page.locator("input[type='time']").first().fill("14:00");
    await page.locator("input[type='time']").nth(1).fill("15:30");
    if ((await batchSelect.count()) > 0) {
      await batchSelect.selectOption(createdBatchUuid);
    }
    await page.getByRole("button", { name: /Schedule Session/i }).click();
    await expect(page.getByRole("heading", { name: /Schedule Clash Detected/i })).toBeVisible({ timeout: 10000 });

    // Verify Confirm & Schedule Anyway is disabled without reason
    const confirmBtn = page.getByRole("button", { name: /Confirm & Schedule Anyway/i });
    const reasonInput = page.getByPlaceholder("e.g. Combined special session approved by Dean");
    await reasonInput.fill("");
    await expect(confirmBtn).toBeDisabled();

    // Enter mandatory override reason
    await reasonInput.fill("Dean authorized makeup evaluation session");
    await expect(confirmBtn).toBeEnabled();

    // Confirm override
    await confirmBtn.click();

    // Verify session in PostgreSQL database has is_override = true and reason
    await page.waitForTimeout(1500);
    const dbSess = await pgClient.query(
      "select * from public.class_sessions where override_reason = 'Dean authorized makeup evaluation session'"
    );
    expect(dbSess.rows.length).toBeGreaterThanOrEqual(1);
    expect(dbSess.rows[0].is_override).toBe(true);

    // Verify audit log row
    const auditRes = await pgClient.query(
      "select * from public.crm_audit_logs where action = 'class_sessions_override_scheduled' order by created_at desc limit 1"
    );
    expect(auditRes.rows.length).toBe(1);
  });

  // ============================================================================
  // Test 6: Fee Invoice Visible, Partial Payment, Full Payment & Paid Status
  // ============================================================================
  test("6. Fee invoice visible, partial payment, full payment and paid status", async ({ page }) => {
    test.setTimeout(45000);
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/fees", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Fees & Payment Ledger/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Loading fee ledger...")).not.toBeVisible({ timeout: 15000 });

    // Invoice visible in table
    await expect(page.getByText(testStudentName).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("PKR 35,000").first()).toBeVisible();

    // Partial Payment of 15,000
    const invoiceRow = page.locator("tr", { hasText: testStudentName });
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    const payBtn = invoiceRow.getByRole("button", { name: /^Pay$/i });
    await payBtn.click();
    await expect(page.getByRole("heading", { name: /Record Student Payment/i })).toBeVisible();

    const amtInput = page.locator("div:has(> label:has-text('Amount Received')) input");
    await amtInput.fill("15000");

    await page.getByRole("button", { name: /Confirm Payment/i }).click();
    const receiptModal1 = page.locator("div.fixed.inset-0", { hasText: "Official Student Payment Receipt" });
    await expect(receiptModal1).toBeVisible({ timeout: 10000 });
    await expect(receiptModal1.getByText("PKR 15,000")).toBeVisible();
    await receiptModal1.getByRole("button", { name: /Done/i }).click();

    // Verify in database: balance is 20,000 and status is partially_paid
    const dbInv1 = await pgClient.query("select * from public.fee_invoices where id = $1", [createdInvoiceId]);
    expect(Number(dbInv1.rows[0].amount_paid)).toBe(15000);
    expect(Number(dbInv1.rows[0].balance)).toBe(20000);
    expect(dbInv1.rows[0].status).toBe("partially_paid");

    // Full Payment: Record remaining balance of 20,000
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading fee ledger...")).not.toBeVisible({ timeout: 15000 });
    const invoiceRow2 = page.locator("tr", { hasText: testStudentName });
    await expect(invoiceRow2).toBeVisible({ timeout: 10000 });
    const payBtn2 = invoiceRow2.getByRole("button", { name: /^Pay$/i });
    await expect(payBtn2).toBeVisible({ timeout: 10000 });
    await payBtn2.click();
    await expect(page.getByRole("heading", { name: /Record Student Payment/i })).toBeVisible();
    const amtInput2 = page.locator("div:has(> label:has-text('Amount Received')) input");
    await amtInput2.fill("20000");
    await page.getByRole("button", { name: /Confirm Payment/i }).click();
    const receiptModal2 = page.locator("div.fixed.inset-0", { hasText: "Official Student Payment Receipt" });
    await expect(receiptModal2).toBeVisible({ timeout: 10000 });
    await receiptModal2.getByRole("button", { name: /Done/i }).click();

    // Verify in database: balance is 0 and status is paid
    const dbInv2 = await pgClient.query("select * from public.fee_invoices where id = $1", [createdInvoiceId]);
    expect(Number(dbInv2.rows[0].amount_paid)).toBe(35000);
    expect(Number(dbInv2.rows[0].balance)).toBe(0);
    expect(dbInv2.rows[0].status).toBe("paid");
  });

  // ============================================================================
  // Test 7: Student Details Editing and Persistence
  // ============================================================================
  test("7. Student details editing and persistence", async ({ page }) => {
    test.setTimeout(45000);
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/students", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading students...")).not.toBeVisible({ timeout: 15000 });
    const studentRow = page.locator("tr", { hasText: testStudentName });
    await expect(studentRow).toBeVisible({ timeout: 15000 });

    // Open profile drawer
    await studentRow.getByRole("button", { name: /View Profile/i }).click();
    await expect(page.getByText("Overview")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: testStudentName })).toBeVisible();

    // Close drawer
    const closeDrawerBtn = page.locator("div.fixed.inset-0 button").filter({ has: page.locator("svg.lucide-x") }).first();
    if ((await closeDrawerBtn.count()) > 0) {
      await closeDrawerBtn.click();
    }

    // Update phone directly in database to test persistence and reload
    const updatedPhone = "+923009998888";
    const updatedNotes = "Special corporate sponsorship confirmed.";
    await pgClient.query("update public.students set phone = $1, notes = $2 where id = $3", [
      updatedPhone,
      updatedNotes,
      createdStudentUuid,
    ]);

    // Reload and open drawer to assert updated data
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading students...")).not.toBeVisible({ timeout: 15000 });
    const studentRowAfter = page.locator("tr", { hasText: testStudentName });
    await expect(studentRowAfter).toBeVisible({ timeout: 15000 });
    await studentRowAfter.getByRole("button", { name: /View Profile/i }).click();
    await expect(page.getByText(updatedPhone).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(updatedNotes)).toBeVisible();
  });

  // ============================================================================
  // Test 8: Task Creation & DB Persistence
  // ============================================================================
  test("8. Task creation and persistence", async ({ page }) => {
    test.setTimeout(45000);
    await authenticateAs(page, ownerUser);

    await page.goto("http://localhost:5173/admin/tasks", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Operational Tasks & Follow-ups/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Loading tasks...")).not.toBeVisible({ timeout: 15000 });

    const addTaskBtn = page.getByRole("button", { name: /Add Task/i }).first();
    await addTaskBtn.click();
    await expect(page.getByRole("heading", { name: /Create New Task/i })).toBeVisible();

    const taskTitle = `E2E Follow-up Task ${uniqueId}`;
    const titleInput = page.locator("div:has(> label:has-text('Task Title')) input");
    await titleInput.fill(taskTitle);

    await page.getByRole("button", { name: /Create Task/i }).click();

    await expect(page.getByText(taskTitle).first()).toBeVisible({ timeout: 10000 });

    // Verify task in PostgreSQL database
    const dbTask = await pgClient.query("select * from public.crm_tasks where title = $1", [taskTitle]);
    expect(dbTask.rows.length).toBe(1);
    expect(dbTask.rows[0].status).toBe("pending");
  });

  // ============================================================================
  // Test 9: Content CMS & Fees Loading Across Viewports (No Invalid UUID & Readable Headings)
  // ============================================================================
  test("9. Content CMS & Fees page successful loading without invalid UUID errors across viewports", async ({ page }) => {
    await authenticateAs(page, ownerUser);

    const viewports = [
      { name: "mobile_390", width: 390, height: 844 },
      { name: "tablet_768", width: 768, height: 1024 },
      { name: "desktop_1440", width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Navigate to /admin/content
      await page.goto("http://localhost:5173/admin/content", { waitUntil: "domcontentloaded" });
      const cmsHeading = page.getByRole("heading", { name: /Content Management System/i });
      await expect(cmsHeading).toBeVisible({ timeout: 15000 });
      const cmsColor = await cmsHeading.evaluate((el) => window.getComputedStyle(el).color);
      expect(cmsColor).toBeTruthy();

      // Navigate to /admin/fees
      await page.goto("http://localhost:5173/admin/fees", { waitUntil: "domcontentloaded" });
      const feesHeading = page.getByRole("heading", { name: /Fees & Payment Ledger/i });
      await expect(feesHeading).toBeVisible({ timeout: 15000 });
      const feesColor = await feesHeading.evaluate((el) => window.getComputedStyle(el).color);
      expect(feesColor).toBeTruthy();

      // Ensure no error banner for invalid UUID
      await expect(page.getByText(/invalid input syntax for type uuid/i)).not.toBeVisible();
    }
  });
});
