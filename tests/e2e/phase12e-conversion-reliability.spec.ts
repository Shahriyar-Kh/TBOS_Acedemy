import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __tbosFbqCalls?: unknown[][];
    fbq?: (...args: unknown[]) => void;
  }
}

async function installFbqSpy(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__tbosFbqCalls = [];
    window.fbq = (...args: unknown[]) => {
      window.__tbosFbqCalls?.push(args);
    };
  });
}

async function navigateAndWait(page: import("@playwright/test").Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  // Wait for client React hydration to bind event listeners
  await page.waitForTimeout(1200);
}

test.describe("Phase 12E: Forms, Conversion UX & Lead Delivery Reliability", () => {
  // Test 1: Apply loads with single H1
  test("1. Apply loads with single H1", async ({ page }) => {
    await navigateAndWait(page, "/apply");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
    await expect(page.locator("h1")).toContainText(/Admissions Application/i);
  });

  // Test 2: Program context preselects correctly
  test("2. Program context preselects correctly", async ({ page }) => {
    await navigateAndWait(page, "/apply?type=Technical+Courses&selected=Python");

    // Verify context banner
    const banner = page.locator("text=You're Applying For");
    await expect(banner).toBeVisible();
    await expect(page.locator("text=Python").first()).toBeVisible();

    // Verify input value preselected
    const programInput = page.locator("#selectedProgram");
    await expect(programInput).toHaveValue("Python");
  });

  // Test 3: Apply form validation works
  test("3. Apply form validation works", async ({ page }) => {
    await navigateAndWait(page, "/apply");

    // Clear pre-filled country so all required fields are empty
    await page.locator("#country").clear();

    // Submit empty form
    const submitBtn = page.getByRole("button", { name: /submit application/i });
    await submitBtn.click();

    // Check validation error texts
    await expect(page.locator("text=Please enter your full name")).toBeVisible();
    await expect(page.locator("text=Enter a valid email address")).toBeVisible();
    await expect(page.locator("text=Enter a valid WhatsApp / phone number")).toBeVisible();
    await expect(page.locator("text=Country is required")).toBeVisible();
    await expect(page.locator("text=Select your education level / grade")).toBeVisible();
    await expect(page.locator("text=Please accept to continue")).toBeVisible();
  });

  // Test 4: Minor learner triggers guardian requirement
  test("4. Minor learner triggers guardian requirement", async ({ page }) => {
    await navigateAndWait(page, "/apply");

    // Enter minor age
    await page.locator("#age").fill("14");

    // Guardian requirement section should be highlighted
    await expect(page.locator("text=Required for Minors Under 18")).toBeVisible();

    // Fill valid student info without guardian
    await page.locator("#studentName").fill("Minor Student");
    await page.locator("#email").fill("minor@example.com");
    await page.locator("#phone").fill("+92 300 1234567");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    // Attempt submit without guardian
    await page.getByRole("button", { name: /submit application/i }).click();

    // Verification check for guardian requirement
    await expect(
      page.locator("text=Parent/guardian name is required for minors under 18"),
    ).toBeVisible();
  });

  // Test 5: Failed request preserves entered values & shows inline error banner
  test("5. Failed request preserves entered values and displays actionable error banner", async ({
    page,
  }) => {
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Simulated server failure for preservation test",
        }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Persistent Learner");
    await page.locator("#email").fill("persistent@example.com");
    await page.locator("#phone").fill("+92 300 7654321");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("22");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Full Stack Development");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    // Error alert banner must appear
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Simulated server failure for preservation test");
    await expect(errorAlert.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(errorAlert.locator("text=WhatsApp Admissions")).toBeVisible();

    // Preserved input values
    await expect(page.locator("#studentName")).toHaveValue("Persistent Learner");
    await expect(page.locator("#email")).toHaveValue("persistent@example.com");
    await expect(page.locator("#phone")).toHaveValue("+92 300 7654321");
    await expect(page.locator("#country")).toHaveValue("Pakistan");
    await expect(page.locator("#selectedProgram")).toHaveValue("Full Stack Development");
  });

  // Test 6: Successful mocked request shows reference ID
  test("6. Successful mocked request shows reference ID", async ({ page }) => {
    const mockRef = "TBOS-APPLY-99";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          referenceId: mockRef,
        }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Ayesha Test");
    await page.locator("#email").fill("ayesha@example.com");
    await page.locator("#phone").fill("+92 300 1234567");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("20");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("React.js & Next.js");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    // Success panel verification
    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText("Application Received!");
    await expect(statusPanel).toContainText(mockRef);
    await expect(statusPanel).toContainText("Ayesha Test");
    await expect(statusPanel).toContainText("React.js & Next.js");
    await expect(statusPanel.locator("text=What Happens Next")).toBeVisible();
  });

  // Test 7: Meta Lead fires only after successful response
  test("7. Meta Lead fires only after successful response", async ({ page }) => {
    await installFbqSpy(page);

    let allowSuccess = false;
    await page.route("**/api/admissions", async (route) => {
      if (!allowSuccess) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: "Initial failure" }),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, referenceId: "TBOS-FBQ-LEAD" }),
        });
      }
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Meta Lead Test");
    await page.locator("#email").fill("metalead@example.com");
    await page.locator("#phone").fill("+92 300 5555555");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("24");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    // Submit failure
    await page.getByRole("button", { name: /submit application/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();

    const configuredPixelId = (process.env.VITE_META_PIXEL_ID || "").trim();

    // Verify NO Lead event fired on failure
    if (configuredPixelId) {
      const calls = await page.evaluate(() => window.__tbosFbqCalls || []);
      const leadCalls = calls.filter((c) => c[0] === "track" && c[1] === "Lead");
      expect(leadCalls.length).toBe(0);
    }

    // Now enable success and retry
    allowSuccess = true;
    await page
      .locator('[role="alert"]')
      .getByRole("button", { name: /try again/i })
      .click();

    await expect(page.locator('[role="status"]')).toBeVisible();

    // Verify Lead event fired after successful response when Pixel is configured
    if (configuredPixelId) {
      const calls = await page.evaluate(() => window.__tbosFbqCalls || []);
      const leadCalls = calls.filter((c) => c[0] === "track" && c[1] === "Lead");
      expect(leadCalls.length).toBe(1);
      expect(leadCalls[0][2]).toEqual(expect.objectContaining({ lead_type: "application" }));
    }
  });

  // Test 8: Free Demo preselects live-program context
  test("8. Free Demo preselects live-program context", async ({ page }) => {
    await navigateAndWait(
      page,
      "/free-demo?type=Live+Cohort+Programs&selected=Python+Young+Developers",
    );

    // Context banner
    await expect(page.locator("text=Trial For")).toBeVisible();
    await expect(page.locator("text=Python Young Developers").first()).toBeVisible();
    await expect(page.locator("#demo-selectedProgram")).toHaveValue("Python Young Developers");
  });

  // Test 9: Demo clearly says one trial session
  test("9. Demo clearly says one trial session", async ({ page }) => {
    await navigateAndWait(page, "/free-demo");
    await expect(page.locator("text=Free 1-Class Live Trial Session").first()).toBeVisible();
    await expect(
      page.locator("text=The introductory 1-class demo session is completely free").first(),
    ).toBeVisible();
  });

  // Test 10: Demo successful mocked request shows reference ID
  test("10. Demo successful mocked request shows reference ID", async ({ page }) => {
    const demoRef = "TBOS-DEMO-REF-42";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: demoRef }),
      });
    });

    await navigateAndWait(page, "/free-demo");

    await page.locator("#demo-studentName").fill("Bilal Demo");
    await page.locator("#demo-email").fill("bilal@example.com");
    await page.locator("#demo-phone").fill("+92 300 8888888");
    await page.locator("#demo-country").fill("Pakistan");
    await page.locator("#demo-age").fill("21");
    await page.locator("#demo-educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#demo-selectedProgram").fill("Python Programming");
    await page.locator('input[type="checkbox"]').check();

    await page.getByRole("button", { name: /request free demo session/i }).click();

    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText("Free Demo Request Received!");
    await expect(statusPanel).toContainText(demoRef);
  });

  // Test 11: Contact successful mocked request shows reference ID
  test("11. Contact successful mocked request shows reference ID", async ({ page }) => {
    const contactRef = "TBOS-CONTACT-77";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: contactRef }),
      });
    });

    await navigateAndWait(page, "/contact");

    await page.locator("#c-name").fill("Contact User");
    await page.locator("#c-email").fill("contact@example.com");
    await page.locator("#c-wa").fill("+92 300 9999999");
    await page.locator("#c-cat").selectOption("Fees & payment");
    await page.locator("#c-msg").fill("Inquiry regarding payment schedule options.");

    await page.getByRole("button", { name: /send message/i }).click();

    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText("Message Received!");
    await expect(statusPanel).toContainText(contactRef);
  });

  // Test 12: Contact category preserved
  test("12. Contact category preserved in submission payload", async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route("**/api/admissions", async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-CAT-CHECK" }),
      });
    });

    await navigateAndWait(page, "/contact");

    await page.locator("#c-name").fill("Category Preserved User");
    await page.locator("#c-email").fill("catuser@example.com");
    await page.locator("#c-wa").fill("+92 300 1111111");
    await page.locator("#c-cat").selectOption("Specialization enquiry");
    await page.locator("#c-msg").fill("Inquiry regarding specialization duration.");

    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.locator('[role="status"]')).toBeVisible();
    expect(capturedBody).not.toBeNull();
    expect(capturedBody?.selectedProgram).toBe("Specialization enquiry");
  });

  // Test 13: UTM attribution remains in outbound API body
  test("13. UTM attribution remains in outbound API body", async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route("**/api/admissions", async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-UTM-CHECK" }),
      });
    });

    await navigateAndWait(
      page,
      "/contact?utm_source=meta_ads&utm_medium=paid_social&utm_campaign=winter2026&utm_content=creative_x",
    );

    await page.locator("#c-name").fill("UTM Applicant");
    await page.locator("#c-email").fill("utm@example.com");
    await page.locator("#c-wa").fill("+92 300 2222222");
    await page.locator("#c-cat").selectOption("Course enquiry");
    await page.locator("#c-msg").fill("Checking course details and timetable.");

    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.locator('[role="status"]')).toBeVisible();

    const sourcePage = String(capturedBody?.sourcePage || "");
    expect(sourcePage).toContain("s=meta_ads");
    expect(sourcePage).toContain("m=paid_social");
    expect(sourcePage).toContain("c=winter2026");
    expect(sourcePage).toContain("v=creative_x");
  });

  // Test 14: No duplicate form POST from rapid double-submit
  test("14. No duplicate form POST from rapid double-submit", async ({ page }) => {
    let requestCount = 0;
    await page.route("**/api/admissions", async (route) => {
      requestCount++;
      // Add slight delay to simulate server latency
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-DOUBLE-GUARD" }),
      });
    });

    await navigateAndWait(page, "/contact");

    await page.locator("#c-name").fill("Double Submit Guard");
    await page.locator("#c-email").fill("guard@example.com");
    await page.locator("#c-wa").fill("+92 300 3333333");
    await page.locator("#c-cat").selectOption("Course enquiry");
    await page.locator("#c-msg").fill("Testing double-submit lock.");

    const submitBtn = page.getByRole("button", { name: /send message/i });

    // Perform two rapid clicks
    await Promise.all([
      submitBtn.click({ force: true }),
      submitBtn.click({ force: true }).catch(() => {}),
    ]);

    await expect(page.locator('[role="status"]')).toBeVisible();

    // Verify only 1 request was dispatched
    expect(requestCount).toBe(1);
  });

  // Test 15: Responsive QA at all required widths
  const viewports = [375, 390, 430, 768, 1024, 1280, 1440];
  for (const width of viewports) {
    test(`15. Responsive QA at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      // Apply Page
      await page.goto("/apply", { waitUntil: "domcontentloaded" });
      const applyOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(applyOverflow).toBe(false);

      // Free Demo Page
      await page.goto("/free-demo", { waitUntil: "domcontentloaded" });
      const demoOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(demoOverflow).toBe(false);

      // Contact Page
      await page.goto("/contact", { waitUntil: "domcontentloaded" });
      const contactOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(contactOverflow).toBe(false);
    });
  }
});
