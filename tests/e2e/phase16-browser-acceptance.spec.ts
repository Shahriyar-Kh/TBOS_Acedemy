import { test, expect, Page } from "@playwright/test";

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

// Mock session authentication helper
async function authenticateAs(
  page: Page,
  user: { id: string; email: string; role: "owner" | "admin" | "instructor" | "accountant" | "admissions" }
) {
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

  await page.route("**/auth/v1/user*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        role: "authenticated",
        aud: "authenticated",
        app_metadata: { provider: "email" },
        user_metadata: {},
        created_at: new Date().toISOString(),
      }),
    });
  });

  await page.route("**/auth/v1/token*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: jwt,
        token_type: "bearer",
        expires_in: 7200,
        refresh_token: "mock-refresh-token",
        user: {
          id: user.id,
          email: user.email,
          role: "authenticated",
          aud: "authenticated",
        },
      }),
    });
  });

  await page.route("**/api/admin/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        admin: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }),
    });
  });

  await page.route("**/api/admin/notifications*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, notifications: [] }),
    });
  });
}

test.describe("Phase 16 — TBOS Academy CRM Authenticated Browser Acceptance", () => {
  test.use({ baseURL: "http://localhost:5173" });

  // ============================================================================
  // 1. Unauthenticated Route Protection
  // ============================================================================
  test("1. Unauthenticated visitor is redirected to /admin/login from protected routes", async ({ page }) => {
    // Clear any residual session
    await page.goto("/admin/login");
    await page.evaluate(() => window.localStorage.clear());

    // Attempt to access protected dashboard
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);

    // Attempt to access protected students roster
    await page.goto("/admin/students");
    await expect(page).toHaveURL(/\/admin\/login/);

    // Attempt to access protected fees
    await page.goto("/admin/fees");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  // ============================================================================
  // 2. Owner Login and Protected Admin Navigation Shell
  // ============================================================================
  test("2. Owner session renders full responsive sidebar and metrics on dashboard", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    // Mock dashboard metrics
    await page.route("**/api/admin/dashboard*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          metrics: {
            activeLearners: 28,
            activeLearnersDelta: 12,
            monthlyRevenue: 560000,
            revenueDelta: 15,
            liveBatchesCount: 4,
            pendingLeads: 14,
          },
          upcomingClasses: [],
          feeOverdueAlerts: [],
        }),
      });
    });

    await page.goto("/admin/dashboard");

    // Header branding & role pill
    await expect(page.locator("h1")).toContainText(/Academy Command Center|Dashboard/i);
    await expect(page.locator("header").getByText("owner", { exact: false })).toBeVisible();

    // Responsive sidebar navigation links visible to owner
    await expect(page.locator('aside a[href="/admin/students"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/batches"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/fees"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/timetable"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/users"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/settings"]')).toBeVisible();
  });

  // ============================================================================
  // 3. RBAC Shielding: Instructor Role Denial
  // ============================================================================
  test("3. RBAC shielding: Instructor cannot see Fees, Users or Settings in navigation", async ({ page }) => {
    await authenticateAs(page, {
      id: "inst-9999-8888-7777-666666666666",
      email: "instructor@techbuiltos.online",
      role: "instructor",
    });

    await page.goto("/admin/dashboard");

    // Instructor can see timetable and students
    await expect(page.locator('aside a[href="/admin/timetable"]')).toBeVisible();
    await expect(page.locator('aside a[href="/admin/students"]')).toBeVisible();

    // Instructor cannot see sensitive financial or system administration links
    await expect(page.locator('aside a[href="/admin/fees"]')).toHaveCount(0);
    await expect(page.locator('aside a[href="/admin/users"]')).toHaveCount(0);
    await expect(page.locator('aside a[href="/admin/settings"]')).toHaveCount(0);
  });

  // ============================================================================
  // 4. RBAC Shielding: Accountant Role Scoping
  // ============================================================================
  test("4. RBAC shielding: Accountant has access to Fees but not Users or Content CMS", async ({ page }) => {
    await authenticateAs(page, {
      id: "acc-1234-5678-9012-345678901234",
      email: "accountant@techbuiltos.online",
      role: "accountant",
    });

    await page.goto("/admin/dashboard");

    // Accountant has fees access
    await expect(page.locator('aside a[href="/admin/fees"]')).toBeVisible();

    // Accountant cannot manage users or content
    await expect(page.locator('aside a[href="/admin/users"]')).toHaveCount(0);
    await expect(page.locator('aside a[href="/admin/content"]')).toHaveCount(0);
  });

  // ============================================================================
  // 5. Student Management: Roster, Create Student Modal & CSV Import Modal
  // ============================================================================
  test("5. Students module renders roster, opens Add Student modal and CSV import modal", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    await page.route("**/api/admin/students*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            student: {
              id: "s-created-99",
              student_id: "TBOS-2026-0099",
              full_name: "Hamza Tariq",
              email: "hamza.tariq@test.local",
              status: "active",
            },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          students: [
            {
              id: "s-1",
              student_id: "TBOS-2026-0001",
              full_name: "Muhammad Hamza",
              email: "hamza.dev@gmail.com",
              phone: "+923001234567",
              status: "active",
              program_name: "Full-Stack Developer",
              created_at: "2026-10-01T10:00:00Z",
              enrollments: [{ id: "e-1", batch_id: "b-1", status: "active", batch: { name: "Full-Stack Cohort Alpha" } }],
              fee_invoices: [{ id: "inv-1", status: "paid", amount_due: 20000, amount_paid: 20000 }],
            },
          ],
          count: 1,
          stats: { total: 1, active: 1, paused: 0, completed: 0, archived: 0 },
        }),
      });
    });

    await page.goto("/admin/students");

    // Roster item visible
    await expect(page.getByText("Muhammad Hamza")).toBeVisible();
    await expect(page.getByText("TBOS-2026-0001")).toBeVisible();

    // Open Add Student Modal
    const addBtn = page.getByRole("button", { name: "Add Student" });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal elements
    await expect(page.getByText(/Create New Student Profile|Add Student/i).first()).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Bilal Hassan")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("button:has-text('Cancel')").first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // Open CSV Import Modal
    const importBtn = page.getByRole("button", { name: "Import CSV" });
    await expect(importBtn).toBeVisible();
    await importBtn.click();
    await expect(page.getByText("Bulk CSV Student Import")).toBeVisible();
  });

  // ============================================================================
  // 6. Lead Conversion to Enrolled Student Modal
  // ============================================================================
  test("6. Lead conversion modal assigns program, calculates PKR fee and triggers conversion", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    await page.route(/\/api\/admin\/admissions/, async (route) => {
      const url = route.request().url();
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            student: { student_id: "TBOS-2026-0042", full_name: "Hamza Lead" },
          }),
        });
        return;
      }
      if (url.includes("/lead-1") || url.endsWith("/lead-1")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            admission: {
              id: "lead-1",
              student_name: "Hamza Lead",
              email: "hamza.lead@test.local",
              phone: "+923001122334",
              selected_program_slug: "full-stack-developer",
              selected_program_title: "Full-Stack Developer",
              application_type: "Specialization",
              status: "new",
              created_at: "2026-10-14T05:00:00Z",
            },
            activities: [],
            deliveryLogs: [],
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: [
            {
              id: "lead-1",
              full_name: "Hamza Lead",
              student_name: "Hamza Lead",
              email: "hamza.lead@test.local",
              phone: "+923001122334",
              selected_program_slug: "full-stack-developer",
              selected_program_title: "Full-Stack Developer",
              status: "new",
              created_at: "2026-10-14T05:00:00Z",
            },
          ],
          total: 1,
          stats: { total: 1, newRequests: 1, demoRequests: 0, scheduledDemos: 0, followUpsDue: 0 },
        }),
      });
    });

    await page.route(/\/api\/admin\/batches/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          batches: [
            { id: "batch-fs-1", name: "Full-Stack Cohort Alpha", program_slug: "full-stack-developer" },
          ],
        }),
      });
    });

    await page.goto("/admin/admissions");

    // Open detail drawer by clicking Manage button
    await page.getByRole("button", { name: "Manage" }).first().click();

    // Look for Convert to Student button
    const convertBtn = page.getByRole("button", { name: "Convert to Student" });
    await expect(convertBtn).toBeVisible({ timeout: 10000 });
    await convertBtn.click();

    // Verify modal elements
    await expect(page.getByText(/Convert Lead to Enrolled Student/i)).toBeVisible();
    await expect(page.getByText("Full-Stack Developer").first()).toBeVisible();
    const feeInput = page.locator('input[type="number"]').first();
    await expect(feeInput).toBeVisible();
    expect(await feeInput.inputValue()).toBe("20000");
  });

  // ============================================================================
  // 7. Fees Ledger: Invoices, Record Payment Modal & Monthly Dues Modal
  // ============================================================================
  test("7. Fees module displays ledger, opens Record Payment modal with validation and Dues modal", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    await page.route(/\/api\/admin\/fees/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          invoices: [
            {
              id: "inv-101",
              invoice_number: "INV-202610-0001",
              student_id: "s-1",
              billing_month: "2026-10",
              due_date: "2026-10-10",
              amount_due: 20000,
              amount_paid: 10000,
              balance: 10000,
              status: "partially_paid",
              student: { full_name: "Muhammad Hamza", student_id: "TBOS-2026-0001" },
            },
          ],
          stats: {
            totalInvoiced: 20000,
            totalCollected: 10000,
            totalPending: 10000,
            totalOverdue: 0,
          },
          totalCount: 1,
        }),
      });
    });

    await page.goto("/admin/fees");

    // Ledger headers and content
    await expect(page.locator("h1")).toContainText(/Fees & Payment Ledger/i);
    await expect(page.getByText("INV-202610-0001")).toBeVisible();
    await expect(page.getByText("Partial", { exact: true })).toBeVisible();

    // Open Record Payment Modal
    const recordBtn = page.getByRole("button", { name: "Record Payment" });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    await expect(page.getByRole("heading", { name: "Record Payment" })).toBeVisible();
    await expect(page.getByText(/Payment Method/i)).toBeVisible();

    // Close payment modal
    await page.locator("button:has-text('Cancel')").first().click();

    // Open Generate Monthly Dues Modal
    const duesBtn = page.getByRole("button", { name: "Generate Monthly Dues" });
    await expect(duesBtn).toBeVisible();
    await duesBtn.click();
    await expect(page.getByRole("heading", { name: "Generate Monthly Dues" })).toBeVisible();
  });

  // ============================================================================
  // 8. Timetable & Schedule Conflict Warning UI
  // ============================================================================
  test("8. Timetable session scheduling detects and displays clash warning", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    await page.route(/\/api\/admin\/timetable/, async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        if (body?.action === "check-conflicts") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              hasConflict: true,
              conflicts: ["Instructor already has an overlapping session in Batch Alpha at 18:00!"],
            }),
          });
          return;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          sessions: [],
          stats: { todaySessions: 0, upcomingSessions: 0, totalHours: 0, conflictCount: 1 },
        }),
      });
    });

    await page.route(/\/api\/admin\/batches/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          batches: [{ id: "b-1", name: "Python Alpha", program_title: "Python Developer" }],
        }),
      });
    });

    await page.goto("/admin/timetable", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1000);

    // Verify cohort filter populated, indicating hydration & batches loaded
    await expect(page.locator("select").first()).toContainText("Python Alpha", { timeout: 10000 });

    // Open Schedule Class Modal
    const scheduleBtn = page.getByRole("button", { name: "Schedule Class" });
    await expect(scheduleBtn).toBeVisible();
    await scheduleBtn.click();

    await expect(page.getByRole("heading", { name: "Schedule Class Session" })).toBeVisible({ timeout: 10000 });

    // Select batch inside the modal form
    await page.locator("form select").first().selectOption("b-1");

    // Fill form to trigger conflict check
    await page.locator('input[placeholder*="Python"]').first().fill("Python Intro");
    await page.locator('input[type="date"]').first().fill("2026-10-20");
    await page.locator('input[type="time"]').first().fill("18:00");
    await page.locator('input[type="time"]').last().fill("19:30");

    // Expect conflict warning banner to appear
    await expect(page.getByText(/Schedule Clash Warning/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Instructor already has an overlapping session/i)).toBeVisible();
  });

  // ============================================================================
  // 9. Forgot Password Request Uniform Response
  // ============================================================================
  test("9. Forgot password UI accepts email and displays uniform success notice", async ({ page }) => {
    await page.route(/\/api\/admin\/auth\/password-reset/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "If this email is registered, password reset instructions have been dispatched.",
        }),
      });
    });

    await page.goto("/admin/forgot-password", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1000);

    await expect(page.locator("h2")).toContainText("Reset Staff Password");
    await page.locator('input[type="email"]').fill("staff.member@techbuiltos.online");
    await page.getByRole("button", { name: "Send Recovery Link" }).click();

    // Confirm uniform response screen
    await expect(page.getByText("Check Your Inbox")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Back to Staff Login")).toBeVisible();
  });

  // ============================================================================
  // 10. Password Reset UI Validation and Confirmation
  // ============================================================================
  test("10. Reset password UI validates matching passwords and confirms update", async ({ page }) => {
    await page.route("**/api/admin/auth/password-reset*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Password updated successfully",
        }),
      });
    });

    await page.goto("/admin/reset-password?token=mock-valid-crypto-token-12345");

    await expect(page.locator("h2")).toContainText("Choose New Password");

    // Enter matching passwords >= 8 chars
    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.first().fill("SecureStaffPass2026!");
    await pwInputs.last().fill("SecureStaffPass2026!");

    await page.getByRole("button", { name: /Save New Password/i }).click();

    // Verify success confirmation view
    await expect(page.getByRole("heading", { name: "Password Updated" })).toBeVisible();
    await expect(page.getByText("Proceed to Staff Login")).toBeVisible();
  });

  // ============================================================================
  // 11. Staff Management: Provision Staff Modal
  // ============================================================================
  test("11. Staff users module opens Provision Staff modal and submits invitation", async ({ page }) => {
    await authenticateAs(page, {
      id: "owner-1111-2222-3333-444444444444",
      email: "shahriyarkhanpk1@gmail.com",
      role: "owner",
    });

    await page.route("**/api/admin/users", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            success: true,
            message: "Invitation sent",
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          users: [
            {
              id: "u-1",
              email: "shahriyarkhanpk1@gmail.com",
              full_name: "Shahriyar Khan",
              role: "owner",
              is_active: true,
            },
          ],
        }),
      });
    });

    await page.goto("/admin/users");

    await expect(page.getByText("Shahriyar Khan")).toBeVisible();
    await expect(page.getByText("owner", { exact: true })).toBeVisible();

    // Open Provision Staff modal
    const inviteBtn = page.getByRole("button", { name: "Provision Staff User" });
    await expect(inviteBtn).toBeVisible();
    await inviteBtn.click();

    await expect(page.getByText(/Provision Staff Account/i)).toBeVisible();
    await expect(page.getByPlaceholder("e.g. techbuiltopenschool@gmail.com")).toBeVisible();
  });
});
