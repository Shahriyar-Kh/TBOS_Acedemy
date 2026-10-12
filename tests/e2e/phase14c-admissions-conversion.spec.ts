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
  await page.waitForTimeout(600);
}

test.describe("Phase 14C: Admissions Conversion Refinement & End-to-End Reliability", () => {
  // 1. Course CTA carries type and selected program into Apply
  test("1. Course CTA carries type and selected program into Apply", async ({ page }) => {
    await navigateAndWait(page, "/courses/python");
    const applyLink = page.locator('main a[href*="/apply"]').first();
    await expect(applyLink).toBeVisible();

    const href = await applyLink.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!, "https://techbuiltos.online");
    expect(url.pathname).toBe("/apply");
    expect(url.searchParams.get("type")).toBe("Single Course");
    expect(url.searchParams.get("selected")).toBe("Python");
  });

  // 2. Course CTA carries context into Free Demo
  test("2. Course CTA carries context into Free Demo", async ({ page }) => {
    await navigateAndWait(page, "/courses/python");
    const demoLink = page.locator('main a[href*="/free-demo"]').first();
    await expect(demoLink).toBeVisible();

    const href = await demoLink.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!, "https://techbuiltos.online");
    expect(url.pathname).toBe("/free-demo");
    expect(url.searchParams.get("type")).toBe("Single Course");
    expect(url.searchParams.get("selected")).toBe("Python");
  });

  // 3. Specialization CTA preserves selected specialization
  test("3. Specialization CTA preserves selected specialization", async ({ page }) => {
    await navigateAndWait(page, "/specializations/full-stack-developer");
    const applyLink = page.locator('main a[href*="/apply"]').first();
    await expect(applyLink).toBeVisible();

    const href = await applyLink.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!, "https://techbuiltos.online");
    expect(url.pathname).toBe("/apply");
    expect(url.searchParams.get("type")).toBe("Specialization");
    expect(url.searchParams.get("selected")).toBe("Full-Stack Developer");
  });

  // 4. Live-batch CTA preserves selected live program
  test("4. Live-batch CTA preserves selected live program", async ({ page }) => {
    await navigateAndWait(page, "/live-batches/python-young-developers");
    const applyLink = page.locator("[data-program-apply]").first();
    await expect(applyLink).toBeVisible();

    const href = await applyLink.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!, "https://techbuiltos.online");
    expect(url.pathname).toBe("/apply");
    expect(url.searchParams.get("type")).toBe("Live Group Offer");
    expect(url.searchParams.get("selected")).toContain("Python");
  });

  // 5. Tutoring CTA follows the correct demo/contact path
  test("5. Tutoring CTA follows the correct demo/contact path", async ({ page }) => {
    await navigateAndWait(page, "/tutoring/mathematics");

    // Primary CTA is Book a Free Demo
    const demoBtn = page.locator("[data-tutoring-demo]").first();
    await expect(demoBtn).toBeVisible();
    const demoHref = await demoBtn.getAttribute("href");
    expect(demoHref).toContain("/free-demo");
    const demoUrl = new URL(demoHref!, "https://techbuiltos.online");
    expect(demoUrl.searchParams.get("type")).toBe("Academic Tutoring");
    expect(demoUrl.searchParams.get("selected")).toBe("Mathematics");

    // Secondary CTA is Apply for Enrolment
    const applyBtn = page.locator("[data-tutoring-apply]").first();
    await expect(applyBtn).toBeVisible();
    const applyHref = await applyBtn.getAttribute("href");
    expect(applyHref).toContain("/apply");
    const applyUrl = new URL(applyHref!, "https://techbuiltos.online");
    expect(applyUrl.searchParams.get("type")).toBe("Academic Tutoring");
    expect(applyUrl.searchParams.get("selected")).toBe("Mathematics");

    // WhatsApp admissions inquiry link is visible
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
  });

  // 6. Student and parent guide CTAs reach valid conversion routes
  test("6. Student and parent guide CTAs reach valid conversion routes", async ({ page }) => {
    await navigateAndWait(page, "/for-students");
    const studentDemoLink = page.locator('a[href="/free-demo"]').first();
    await expect(studentDemoLink).toBeVisible();

    await navigateAndWait(page, "/for-parents");
    const parentDemoLink = page.locator('a[href="/free-demo"]').first();
    await expect(parentDemoLink).toBeVisible();

    await navigateAndWait(page, "/how-it-works");
    const howDemoLink = page.locator('a[href="/free-demo"]').first();
    await expect(howDemoLink).toBeVisible();
  });

  // 7. Apply form shows the selected program
  test("7. Apply form shows the selected program", async ({ page }) => {
    await navigateAndWait(page, "/apply?type=Single+Course&selected=Python+Programming");

    const banner = page.locator("[data-selected-program-banner]");
    await expect(banner).toBeVisible();
    await expect(banner.locator("[data-selected-program-name]")).toHaveText("Python Programming");
    await expect(page.locator("#selectedProgram")).toHaveValue("Python Programming");
  });

  // 8. Minor applicant reveals required guardian fields
  test("8. Minor applicant reveals required guardian fields", async ({ page }) => {
    await navigateAndWait(page, "/apply");

    await page.locator("#age").fill("15");
    // Form detects minor age <= 17 and reveals guardian fields
    await expect(page.locator("#guardianName")).toBeVisible();
    await expect(page.locator("#guardianPhone")).toBeVisible();

    // Fill valid learner info but leave guardian empty
    await page.locator("#studentName").fill("Young Student");
    await page.locator("#email").fill("young@example.com");
    await page.locator("#phone").fill("+92 300 1234567");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#educationLevel").selectOption("Grade 9-10 / Matric / O-Level");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    // Guardian validation message must appear
    await expect(page.getByText(/parent\/guardian name is required/i)).toBeVisible();
  });

  // 9. Adult applicant does not receive incorrect guardian requirements
  test("9. Adult applicant does not receive incorrect guardian requirements", async ({ page }) => {
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-ADULT-PASS" }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Adult Student");
    await page.locator("#email").fill("adult@example.com");
    await page.locator("#phone").fill("+92 300 7654321");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("25");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Full Stack Development");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    // Success panel must appear without blocking for guardian fields
    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText("TBOS-ADULT-PASS");
  });

  // 10. Invalid submissions show accessible validation errors
  test("10. Invalid submissions show accessible validation errors", async ({ page }) => {
    await navigateAndWait(page, "/apply");

    await page.locator("#country").clear();
    await page.getByRole("button", { name: /submit application/i }).click();

    // Error messages appear for missing required fields
    await expect(page.getByText(/please enter your full name/i)).toBeVisible();
    await expect(page.getByText(/enter a valid email address/i)).toBeVisible();
  });

  // 11. Loading state prevents duplicate submission
  test("11. Loading state prevents duplicate submission", async ({ page }) => {
    let callCount = 0;
    await page.route("**/api/admissions", async (route) => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-LOCK-OK" }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Lock Test");
    await page.locator("#email").fill("lock@example.com");
    await page.locator("#phone").fill("+92 300 1112233");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("22");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should be disabled during submit
    await expect(submitBtn).toBeDisabled();
    // Attempt clicking again while submitting
    await submitBtn.click({ force: true }).catch(() => {});

    await expect(page.locator('[role="status"]')).toBeVisible();
    expect(callCount).toBe(1);
  });

  // 12. Successful Apply response shows its reference ID
  test("12. Successful Apply response shows its reference ID", async ({ page }) => {
    const mockRef = "TBOS-APPLY-SUCCESS-14C";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: mockRef }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Bilal Khan");
    await page.locator("#email").fill("bilal@example.com");
    await page.locator("#phone").fill("+92 300 9988776");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("21");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Full Stack Development");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText(mockRef);
    await expect(statusPanel).toContainText("Bilal Khan");
  });

  // 13. Successful Demo response shows its reference ID
  test("13. Successful Demo response shows its reference ID", async ({ page }) => {
    const mockRef = "TBOS-DEMO-SUCCESS-14C";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: mockRef }),
      });
    });

    await navigateAndWait(page, "/free-demo");

    await page.locator("#demo-studentName").fill("Sara Ahmed");
    await page.locator("#demo-email").fill("sara@example.com");
    await page.locator("#demo-phone").fill("+92 300 5544332");
    await page.locator("#demo-country").fill("Pakistan");
    await page.locator("#demo-age").fill("20");
    await page.locator("#demo-educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#demo-selectedProgram").fill("Data Analysis with Python");
    await page.locator('input[type="checkbox"]').check();

    await page.getByRole("button", { name: /request free demo/i }).click();

    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText(mockRef);
    await expect(statusPanel).toContainText("Sara Ahmed");
  });

  // 14. Successful Contact response shows its reference ID
  test("14. Successful Contact response shows its reference ID", async ({ page }) => {
    const mockRef = "TBOS-CONTACT-SUCCESS-14C";
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: mockRef }),
      });
    });

    await navigateAndWait(page, "/contact");

    await page.locator("#c-name").fill("Hamza Tariq");
    await page.locator("#c-email").fill("hamza@example.com");
    await page.locator("#c-wa").fill("+92 300 4433221");
    await page.locator("#c-cat").selectOption("Course enquiry");
    await page.locator("#c-msg").fill("Interested in cohort schedule and weekend timings.");

    await page.getByRole("button", { name: /send message/i }).click();

    const statusPanel = page.locator('[role="status"]');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText(mockRef);
    await expect(statusPanel).toContainText("Hamza Tariq");
  });

  // 15. Failed responses preserve entered values and show retry/WhatsApp recovery
  test("15. Failed responses preserve entered values and show retry/WhatsApp recovery", async ({
    page,
  }) => {
    await page.route("**/api/admissions", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Network connection lost" }),
      });
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Preserve Student");
    await page.locator("#email").fill("preserve@example.com");
    await page.locator("#phone").fill("+92 300 9991111");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("23");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    const alertBox = page.locator('[role="alert"]');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText("Network connection lost");
    await expect(alertBox.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(alertBox.locator("text=WhatsApp Admissions")).toBeVisible();

    // Input values remain preserved
    await expect(page.locator("#studentName")).toHaveValue("Preserve Student");
    await expect(page.locator("#email")).toHaveValue("preserve@example.com");
    await expect(page.locator("#selectedProgram")).toHaveValue("Python Programming");
  });

  // 16. Meta Lead fires only after verified success
  test("16. Meta Lead fires only after verified success", async ({ page }) => {
    await installFbqSpy(page);

    let succeed = false;
    await page.route("**/api/admissions", async (route) => {
      if (!succeed) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: "Simulated failure" }),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, referenceId: "TBOS-LEAD-OK" }),
        });
      }
    });

    await navigateAndWait(page, "/apply");

    await page.locator("#studentName").fill("Pixel Test");
    await page.locator("#email").fill("pixel@example.com");
    await page.locator("#phone").fill("+92 300 8887777");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("22");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    // 1st submit fails
    await page.getByRole("button", { name: /submit application/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();

    // Check no Lead tracked yet
    const callsAfterFail = await page.evaluate(() => window.__tbosFbqCalls || []);
    const leadCallsFail = callsAfterFail.filter((c) => c[0] === "track" && c[1] === "Lead");
    expect(leadCallsFail.length).toBe(0);

    // 2nd submit succeeds
    succeed = true;
    await page.locator('[role="alert"]').getByRole("button", { name: /try again/i }).click();

    await expect(page.locator('[role="status"]')).toBeVisible();
  });

  // 17. UTM attribution remains preserved
  test("17. UTM attribution remains preserved", async ({ page }) => {
    let capturedSourcePage = "";
    await page.route("**/api/admissions", async (route) => {
      const postData = route.request().postDataJSON();
      capturedSourcePage = postData?.sourcePage || "";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-UTM-REF" }),
      });
    });

    await navigateAndWait(
      page,
      "/apply?utm_source=meta_ads&utm_medium=paid_social&utm_campaign=winter2026",
    );

    await page.locator("#studentName").fill("Campaign Learner");
    await page.locator("#email").fill("campaign@example.com");
    await page.locator("#phone").fill("+92 300 7776655");
    await page.locator("#country").fill("Pakistan");
    await page.locator("#age").fill("20");
    await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
    await page.locator("#selectedProgram").fill("Python Programming");
    await page.locator("#consent").check();

    await page.getByRole("button", { name: /submit application/i }).click();

    await expect(page.locator('[role="status"]')).toBeVisible();
    expect(capturedSourcePage).toContain("s=meta_ads");
    expect(capturedSourcePage).toContain("m=paid_social");
  });

  // 18. CTA buttons have accessible names
  test("18. CTA buttons have accessible names", async ({ page }) => {
    const routesToCheck = [
      "/apply",
      "/free-demo",
      "/contact",
      "/courses/python",
      "/tutoring/mathematics",
    ];

    for (const route of routesToCheck) {
      await navigateAndWait(page, route);
      const buttons = page.locator("button, a[role='button']");
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        const btn = buttons.nth(i);
        if (await btn.isVisible()) {
          const accessibleName = await btn.evaluate((el) => {
            return (
              el.getAttribute("aria-label") ||
              el.getAttribute("title") ||
              el.textContent?.trim() ||
              ""
            );
          });
          expect(accessibleName.length).toBeGreaterThan(0);
        }
      }
    }
  });

  // 19. Affected routes have no horizontal overflow on mobile
  test("19. Affected routes have no horizontal overflow on mobile", async ({ page }) => {
    test.setTimeout(60000);

    const viewports = [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
    ];

    const testRoutes = [
      "/apply",
      "/free-demo",
      "/contact",
      "/courses/python",
      "/specializations/full-stack-developer",
      "/live-batches/python-young-developers",
      "/tutoring/mathematics",
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      for (const r of testRoutes) {
        await page.goto(r, { waitUntil: "domcontentloaded" });
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasOverflow, `Overflow detected on ${r} at ${vp.width}px`).toBe(false);
      }
    }
  });

  // 20. Reduced-motion mode leaves all content visible
  test("20. Reduced-motion mode leaves all content visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await navigateAndWait(page, "/apply");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#studentName")).toBeVisible();
    await expect(page.getByRole("button", { name: /submit application/i })).toBeVisible();

    await navigateAndWait(page, "/courses/python");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('main a[href*="/apply"]').first()).toBeVisible();
  });

  // 21. No duplicate CTA block appears on live-batch fee cards
  test("21. No duplicate CTA block appears on live-batch fee cards", async ({ page }) => {
    await navigateAndWait(page, "/live-batches/python-young-developers");

    // Fee transparency card should display details without duplicate CTA buttons
    const pricingCard = page.locator("[data-program-pricing-card]");
    if (await pricingCard.count()) {
      const duplicateCtas = pricingCard.locator('a[href*="/apply"], a[href*="/free-demo"]');
      await expect(duplicateCtas).toHaveCount(0);
    }
  });

  // 22. Existing roadmaps, pricing and curriculum content remain unchanged
  test("22. Existing roadmaps, pricing and curriculum content remain unchanged", async ({
    page,
  }) => {
    await navigateAndWait(page, "/specializations/full-stack-developer");

    // Fixed tuition verification: PKR 20,000/month
    await expect(page.getByText(/PKR 20,000\/month/i).first()).toBeVisible();
    // 4 live online classes/week
    await expect(page.getByText(/4 live online classes\/week/i).first()).toBeVisible();
    // Recorded sessions
    await expect(page.getByText(/recorded sessions for review/i).first()).toBeVisible();
  });
});
