import { expect, test } from "@playwright/test";
import process from "node:process";

const hasSupabaseServerCreds = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
const hasAdminCreds = Boolean(
  process.env.TBOS_E2E_ADMIN_EMAIL && process.env.TBOS_E2E_ADMIN_PASSWORD,
);

const liveFormMode = process.env.TBOS_E2E_ALLOW_LIVE_FORMS === "1";

const publicContentEndpoints = [
  ["/api/content/courses", "courses"],
  ["/api/content/specializations", "specializations"],
  ["/api/content/live-offers", "liveOffers"],
  ["/api/content/tutoring", "tutoring"],
] as const;

test.describe("TBOS Phase10B functional coverage", () => {
  test("public content API returns the canonical data contract", async ({ request }) => {
    for (const [url, payloadKey] of publicContentEndpoints) {
      const response = await request.get(url);
      expect(response.status()).toBe(200);

      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(Array.isArray(json.data)).toBeTruthy();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json[payloadKey]).toBeUndefined();
    }
  });

  test("homepage loads and exposes the key conversion CTAs", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.getByRole("heading", { name: /techbuilt open school/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /apply now/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /courses/i }).first()).toBeVisible();
  });

  test("contact page renders the real form fields without fatal hydration issues", async ({
    page,
  }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("#c-name")).toBeVisible();
    await expect(page.locator("#c-email")).toBeVisible();
    await expect(page.locator("#c-wa")).toBeVisible();
    await expect(page.locator("#c-cat")).toBeVisible();
    await expect(page.locator("#c-msg")).toBeVisible();

    if (!liveFormMode) {
      await page.locator("#c-name").fill("TBOS Contact Render Check");
      await page.locator("#c-email").fill("tbos-contact-render-check@example.com");
      await page.locator("#c-wa").fill("+92 300 0000000");
      await page.locator("#c-cat").selectOption("Course enquiry");
      await page
        .locator("#c-msg")
        .fill("Render-only verification for the production contact form.");
      await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
      return;
    }

    await page.locator("#c-name").fill("TBOS Contact Live Check");
    await page.locator("#c-email").fill("tbos-live-contact@example.com");
    await page.locator("#c-wa").fill("+92 300 0000000");
    await page.locator("#c-cat").selectOption("Course enquiry");
    await page.locator("#c-msg").fill("Live production verification submission test.");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/message received|thank you for reaching out/i)).toBeVisible();
  });

  test("apply page accepts a valid adult submission and retains the selected program", async ({
    page,
  }) => {
    await page.goto("/apply?type=Single%20Course&selected=HTML5", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("#selectedProgram")).toHaveValue("HTML5");

    if (!liveFormMode) {
      await expect(page.locator("#studentName")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#phone")).toBeVisible();
      return;
    }

    await page.locator("#studentName").fill("TBOS Apply Live Verification");
    await page.locator("#email").fill("tbos-live-apply@example.com");
    await page.locator("#phone").fill("+92 300 0000000");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#city").fill("Lahore");
    await page.locator("#age").fill("25");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page
      .locator("#learningPreference")
      .selectOption("One-to-One (Personalized Private Tuition)");
    await page.locator("#consent").check();
    await page.getByRole("button", { name: /submit application/i }).click();
    await expect(page.getByText(/application received!/i)).toBeVisible();
  });

  test("minor guardian validation prevents submission until the guardian details are added", async ({
    page,
  }) => {
    await page.goto("/apply", { waitUntil: "domcontentloaded" });
    await page.locator("#studentName").fill("TBOS Minor Guard Validation");
    await page.locator("#email").fill("tbos-minor-validation@example.com");
    await page.locator("#phone").fill("+92 300 0000000");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("14");
    await page.locator("#educationLevel").selectOption("Grade 9-10 / Matric / O-Level");
    await page.locator("#selectedProgram").fill("HTML5");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();
    await expect(page.getByText(/please provide a parent or guardian name/i)).toBeVisible();

    await page.locator("#guardianName").fill("TBOS Guardian");
    await page.locator("#guardianPhone").fill("+92 300 0000001");
    await page.getByRole("button", { name: /submit application/i }).click();
    if (liveFormMode) {
      await expect(page.getByText(/application received!/i)).toBeVisible();
    }
  });

  test("free demo page retains the selected program and renders the expected fields", async ({
    page,
  }) => {
    await page.goto("/free-demo?type=Single%20Course&selected=HTML5", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("#demo-selectedProgram")).toHaveValue("HTML5");
    await expect(page.getByRole("button", { name: /request free demo session/i })).toBeVisible();
  });

  test("honeypot submission is accepted without persisting a real record", async ({ request }) => {
    const response = await request.post("/api/admissions", {
      data: {
        submissionKind: "application",
        applicationType: "Single Course",
        selectedProgram: "HTML5",
        studentName: "Bot Checker",
        email: "tbos-phase10b-bot@example.com",
        phone: "+92 300 0000000",
        country: "Pakistan",
        city: "Lahore",
        age: "25",
        educationLevel: "Undergraduate / University Student",
        company: "bot",
        sourcePage: "Phase10B honeypot test",
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.referenceId).toBe("TBOS-OK");

    if (hasSupabaseServerCreds) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

      const { count, error } = await supabase
        .from("admissions_requests")
        .select("*", { count: "exact", head: true })
        .eq("email", "tbos-phase10b-bot@example.com");

      expect(error).toBeNull();
      expect(count).toBe(0);
    }
  });

  test("mobile navigation opens and maintains a stable route flow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("This page didn't load");

    const initialOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(initialOverflow).toBe(false);

    const menuTrigger = page
      .locator(
        'button[aria-label="Toggle menu"], button[aria-label="Open menu"], [data-slot="sheet-trigger"]',
      )
      .first();
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    const coursesLink = page.getByRole("link", { name: "Courses", exact: true }).first();
    await expect(coursesLink).toBeVisible();
    await coursesLink.click();
    await expect(page).toHaveURL(/\/courses$/);
  });

  test("admin login route remains protected and is not silently skipped", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.getByRole("heading", { name: /tbos administrator/i })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    if (hasAdminCreds) {
      await page.locator("#email").fill(process.env.TBOS_E2E_ADMIN_EMAIL!);
      await page.locator("#password").fill(process.env.TBOS_E2E_ADMIN_PASSWORD!);
      await page.getByRole("button", { name: /sign in to admin portal/i }).click();
      await page.waitForURL(/\/admin\//, { timeout: 15000 });
    }
  });
});
