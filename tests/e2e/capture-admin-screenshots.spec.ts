import { test } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/Shary/.gemini/antigravity/brain/155067ad-e51d-473a-b1f6-78fc50714afc";

const viewports = [
  { name: "mobile_390", width: 390, height: 844 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1024", width: 1024, height: 768 },
  { name: "desktop_1440", width: 1440, height: 900 },
];

const pagesToCapture = [
  { slug: "admin_dashboard", route: "/admin/dashboard" },
  { slug: "admin_admissions", route: "/admin/admissions" },
  { slug: "admin_students", route: "/admin/students" },
  { slug: "admin_fees", route: "/admin/fees" },
  { slug: "admin_timetable", route: "/admin/timetable" },
  { slug: "admin_tasks", route: "/admin/tasks" },
  { slug: "admin_communications", route: "/admin/communications" },
  { slug: "admin_reports", route: "/admin/reports" },
  { slug: "admin_users", route: "/admin/users" },
  { slug: "admin_settings", route: "/admin/settings" },
];

test.describe("Capture Phase 16 Admin Screenshots", () => {
  test.use({ baseURL: "http://localhost:5173" });

  for (const pageInfo of pagesToCapture) {
    for (const vp of viewports) {
      test(`Screenshot ${pageInfo.slug} at ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // Seed authenticated session in localStorage
        await page.addInitScript(() => {
          window.localStorage.setItem(
            "sb-ygueodtgrxymtzebromp-auth-token",
            JSON.stringify({
              access_token: "mock-owner-access-token",
              token_type: "bearer",
              expires_in: 7200,
              refresh_token: "mock-refresh-token",
              user: {
                id: "owner-1111-2222-3333-444444444444",
                email: "shahriyarkhanpk1@gmail.com",
                role: "authenticated",
              },
            })
          );
        });

        // Intercept admin endpoints
        await page.route("**/api/admin/me", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              admin: {
                id: "owner-1111-2222-3333-444444444444",
                email: "shahriyarkhanpk1@gmail.com",
                role: "owner",
              },
            }),
          });
        });

        await page.route("**/api/admin/admissions*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              admissions: [
                {
                  id: "lead-1",
                  full_name: "Hamza Ali",
                  email: "hamza.ali@gmail.com",
                  phone: "+923001112233",
                  program_name: "Full-Stack Developer",
                  status: "new",
                  created_at: "2026-10-14T05:00:00Z",
                },
                {
                  id: "lead-2",
                  full_name: "Fatima Noor",
                  email: "fatima.noor@outlook.com",
                  phone: "+923219988776",
                  program_name: "Data Science & AI",
                  status: "demo_scheduled",
                  created_at: "2026-10-13T11:20:00Z",
                },
              ],
              stats: {
                total: 48,
                newRequests: 14,
                demoRequests: 9,
                scheduledDemos: 6,
                followUpsDue: 7,
              },
            }),
          });
        });

        await page.route("**/api/admin/students*", async (route) => {
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
                  monthly_fee: 20000,
                  created_at: "2026-10-01T10:00:00Z",
                  enrollments: [{ id: "e-1", batch_id: "b-1", status: "active", batch: { name: "Full-Stack Cohort Alpha" } }],
                  fee_invoices: [{ id: "inv-1", status: "paid", amount_due: 20000, amount_paid: 20000 }],
                },
                {
                  id: "s-2",
                  student_id: "TBOS-2026-0002",
                  full_name: "Ayesha Tariq",
                  email: "ayesha.t@gmail.com",
                  phone: "+923019876543",
                  status: "active",
                  program_name: "Data Science & AI",
                  monthly_fee: 20000,
                  created_at: "2026-10-05T14:30:00Z",
                  enrollments: [{ id: "e-2", batch_id: "b-2", status: "active", batch: { name: "Data Science & Machine Learning" } }],
                  fee_invoices: [{ id: "inv-2", status: "partially_paid", amount_due: 20000, amount_paid: 10000 }],
                },
                {
                  id: "s-3",
                  student_id: "TBOS-2026-0003",
                  full_name: "Bilal Ahmed",
                  email: "bilal.ahmed@gmail.com",
                  phone: "+923214567890",
                  status: "paused",
                  program_name: "Python for Beginners",
                  monthly_fee: 15000,
                  created_at: "2026-09-20T08:15:00Z",
                  enrollments: [{ id: "e-3", batch_id: "b-3", status: "paused", batch: { name: "Python Foundation Batch" } }],
                  fee_invoices: [{ id: "inv-3", status: "paid", amount_due: 15000, amount_paid: 15000 }],
                },
              ],
              count: 3,
              stats: {
                total: 28,
                active: 24,
                paused: 3,
                completed: 1,
                archived: 0,
              },
            }),
          });
        });

        await page.route("**/api/admin/batches*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              batches: [
                {
                  id: "b-1",
                  batch_code: "FS-2026-B1",
                  name: "Full-Stack Cohort Alpha",
                  program_slug: "full-stack-developer",
                  program_name: "Full-Stack Developer",
                  start_date: "2026-10-01",
                  end_date: "2027-04-01",
                  capacity: 25,
                  enrolled_count: 18,
                  status: "active",
                  schedule_days: ["Mon", "Wed", "Fri"],
                  schedule_time: "18:00 - 20:00",
                },
                {
                  id: "b-2",
                  batch_code: "DS-2026-B1",
                  name: "Data Science & Machine Learning",
                  program_slug: "data-science",
                  program_name: "Data Science",
                  start_date: "2026-10-15",
                  end_date: "2027-04-15",
                  capacity: 20,
                  enrolled_count: 14,
                  status: "enrolling",
                  schedule_days: ["Tue", "Thu", "Sat"],
                  schedule_time: "19:00 - 21:00",
                },
              ],
              stats: { total: 4, active: 3, upcoming: 1, completed: 0 },
            }),
          });
        });

        await page.route("**/api/admin/fees*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              invoices: [
                {
                  id: "inv-1",
                  invoice_number: "INV-202610-0001",
                  student_id: "s-1",
                  student_name: "Muhammad Hamza",
                  student_code: "TBOS-2026-0001",
                  amount_due: 20000,
                  amount_paid: 20000,
                  status: "paid",
                  due_date: "2026-10-10",
                  billing_month: "2026-10",
                  created_at: "2026-10-01T10:00:00Z",
                },
                {
                  id: "inv-2",
                  invoice_number: "INV-202610-0002",
                  student_id: "s-2",
                  student_name: "Ayesha Tariq",
                  student_code: "TBOS-2026-0002",
                  amount_due: 20000,
                  amount_paid: 10000,
                  status: "partially_paid",
                  due_date: "2026-10-15",
                  billing_month: "2026-10",
                  created_at: "2026-10-05T14:30:00Z",
                },
              ],
              payments: [
                {
                  id: "p-1",
                  receipt_number: "REC-202610-0001",
                  invoice_id: "inv-1",
                  student_id: "s-1",
                  student_name: "Muhammad Hamza",
                  amount: 20000,
                  payment_method: "bank_transfer",
                  transaction_reference: "TXN-982341",
                  paid_at: "2026-10-08T12:00:00Z",
                },
                {
                  id: "p-2",
                  receipt_number: "REC-202610-0002",
                  invoice_id: "inv-2",
                  student_id: "s-2",
                  student_name: "Ayesha Tariq",
                  amount: 10000,
                  payment_method: "jazzcash",
                  transaction_reference: "JC-554129",
                  paid_at: "2026-10-10T16:20:00Z",
                },
              ],
              stats: {
                totalCollected: 480000,
                pendingAmount: 35000,
                expectedRevenue: 515000,
                overdueCount: 2,
              },
            }),
          });
        });

        await page.route("**/api/admin/timetable*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              sessions: [
                {
                  id: "sess-1",
                  batch_id: "b-1",
                  batch_name: "Full-Stack Cohort Alpha",
                  title: "React Server Components & SSR Architecture",
                  instructor_id: "inst-1",
                  instructor_name: "Engr. Shahriyar Khan",
                  session_date: "2026-10-14",
                  start_time: "18:00",
                  end_time: "20:00",
                  meeting_link: "https://meet.google.com/tbos-live-alpha",
                  status: "scheduled",
                },
                {
                  id: "sess-2",
                  batch_id: "b-2",
                  batch_name: "Data Science & Machine Learning",
                  title: "Pandas Data Wrangling & Feature Engineering",
                  instructor_id: "inst-1",
                  instructor_name: "Engr. Shahriyar Khan",
                  session_date: "2026-10-15",
                  start_time: "19:00",
                  end_time: "21:00",
                  meeting_link: "https://meet.google.com/tbos-live-ds",
                  status: "scheduled",
                },
              ],
              todaySessions: [
                {
                  id: "sess-1",
                  batch_name: "Full-Stack Cohort Alpha",
                  title: "React Server Components & SSR Architecture",
                  time: "18:00 - 20:00",
                  instructor: "Engr. Shahriyar Khan",
                },
              ],
            }),
          });
        });

        await page.route("**/api/admin/tasks*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              tasks: [
                {
                  id: "task-1",
                  title: "Follow up with Hamza Ali on Demo feedback",
                  priority: "high",
                  status: "pending",
                  due_date: "2026-10-14",
                },
                {
                  id: "task-2",
                  title: "Verify fee receipt for Ayesha Tariq",
                  priority: "medium",
                  status: "pending",
                  due_date: "2026-10-15",
                },
              ],
            }),
          });
        });

        await page.route("**/api/admin/users*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              users: [
                {
                  id: "user-owner-1",
                  email: "shahriyarkhanpk1@gmail.com",
                  role: "owner",
                  is_active: true,
                  created_at: "2026-09-01T00:00:00Z",
                  last_sign_in_at: "2026-10-14T07:30:00Z",
                },
                {
                  id: "user-admin-2",
                  email: "admissions.officer@tbos.academy",
                  role: "admissions",
                  is_active: true,
                  created_at: "2026-09-15T10:00:00Z",
                  last_sign_in_at: "2026-10-13T15:20:00Z",
                },
                {
                  id: "user-inst-3",
                  email: "instructor.lead@tbos.academy",
                  role: "instructor",
                  is_active: true,
                  created_at: "2026-09-20T12:00:00Z",
                  last_sign_in_at: "2026-10-14T06:45:00Z",
                },
              ],
            }),
          });
        });

        await page.route("**/api/admin/communications*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              logs: [
                {
                  id: "comm-1",
                  recipient_email: "hamza.dev@gmail.com",
                  channel: "email",
                  template_name: "Fee Reminder - Monthly Due",
                  status: "sent",
                  subject: "Monthly Tuition Fee Reminder - TBOS Academy",
                  created_at: "2026-10-14T09:00:00Z",
                  metadata: { student_id: "s-1", invoice_id: "inv-1" },
                },
                {
                  id: "comm-2",
                  recipient_email: "ayesha.t@gmail.com",
                  channel: "whatsapp",
                  template_name: "Class Schedule Link",
                  status: "delivered",
                  subject: "Live Python Class Meeting Link",
                  created_at: "2026-10-14T10:15:00Z",
                  metadata: { session_id: "sess-1" },
                },
              ],
              templates: [
                {
                  id: "tmpl-1",
                  name: "Fee Reminder",
                  subject: "Reminder: Academy Fee Due",
                  body: "Dear Student, your monthly fee is due.",
                },
                {
                  id: "tmpl-2",
                  name: "Welcome Onboarding",
                  subject: "Welcome to TBOS Academy!",
                  body: "Welcome to your new cohort!",
                },
              ],
            }),
          });
        });

        await page.route("**/api/admin/reports*", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              metrics: {
                totalStudents: 32,
                activeStudents: 28,
                totalLeads: 86,
                conversionRate: 37.2,
                totalInvoiced: 640000,
                totalCollected: 580000,
                collectionRate: 90.6,
                totalSessions: 142,
                attendanceRate: 94.5,
              },
            }),
          });
        });

        await page.goto(pageInfo.route, { waitUntil: "networkidle" });
        await page.waitForTimeout(1000);

        const screenshotPath = path.join(ARTIFACT_DIR, `${pageInfo.slug}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
      });
    }
  }
});

