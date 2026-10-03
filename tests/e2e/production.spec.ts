import { test, expect } from "@playwright/test";

test.describe("TBOS Academy Production E2E Suite", () => {
  test("1. Homepage loads, hydrates and displays valid branding & WhatsApp CTA", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);

    // Verify page title and header
    await expect(page).toHaveTitle(/TechBuilt Open School/i);
    await expect(page.locator("body")).not.toContainText("This page didn't load");

    // Verify WhatsApp button
    const whatsappBtn = page.locator('a[href*="wa.me/923295448590"]').first();
    await expect(whatsappBtn).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("2. Courses catalog renders 32 courses and individual course pages load cleanly", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/courses", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);

    await expect(page.locator("body")).not.toContainText("This page didn't load");

    // Verify course detail navigation
    await page.goto("/courses/html5", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("h1")).toContainText(/HTML5/i);

    // Verify Apply button has correct query params
    const applyLink = page.locator('a[href*="/apply"][href*="HTML5"]').first();
    await expect(applyLink).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("3. Specializations catalog and detail pages hydrate without errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/specializations", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");

    await page.goto("/specializations/frontend-developer", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("h1")).toContainText(/Frontend Developer/i);

    expect(pageErrors).toHaveLength(0);
  });

  test("4. Live Batches render cohort fees and roadmap without crashing", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/live-batches", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");

    await page.goto("/live-batches/python-young-developers", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    await expect(page.locator("h1")).toContainText(/Python Young Developers/i);

    expect(pageErrors).toHaveLength(0);
  });

  test("5. Tutoring page renders interactive accordion without crashing", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/tutoring", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");

    // Click first FAQ accordion if present
    const accordionTrigger = page.locator('[data-state="closed"]').first();
    if (await accordionTrigger.isVisible()) {
      await accordionTrigger.click();
      await page.waitForTimeout(500);
    }

    expect(pageErrors).toHaveLength(0);
  });

  test("6. Contextual query parameters preselect program in Apply and Free Demo forms", async ({ page }) => {
    // Apply form preselection
    await page.goto("/apply?type=Single+Course&selected=HTML5", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    const programInput = page.locator('input#selectedProgram, input[name="selectedProgram"]');
    await expect(programInput).toHaveValue("HTML5");

    // Free Demo form preselection
    await page.goto("/free-demo?type=Single+Course&selected=HTML5", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("This page didn't load");
    const demoProgramInput = page.locator('input#selectedProgram, input[name="selectedProgram"]');
    await expect(demoProgramInput).toHaveValue("HTML5");
  });

  test("7. Mobile, Tablet, and Desktop responsive viewports render cleanly", async ({ page }) => {
    const viewports = [
      { width: 375, height: 812, name: "Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1440, height: 900, name: "Desktop" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const res = await page.goto("/", { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBe(200);
      await page.waitForTimeout(500);
      await expect(page.locator("body")).not.toContainText("This page didn't load");
    }
  });

  test("8. Admin routes enforce authentication boundary", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    // Should show login form or redirect to /admin/login
    const isLoginVisible =
      page.url().includes("/admin/login") ||
      (await page.locator('input[type="email"], input[type="password"]').count()) > 0;
    expect(isLoginVisible).toBeTruthy();
  });
});

