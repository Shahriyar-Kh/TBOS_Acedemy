import { test, expect } from "@playwright/test";
import { courses } from "../../src/data/courses";
import { specializations } from "../../src/data/specializations";

test.describe("Phase 13C Premium UI/UX Refinement Suite", () => {
  test("1. Course Detail Pages render structured roadmaps, core topics, guided tasks, and official curriculum validation", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Test CSS3 course
    const cssRes = await page.goto("/courses/css3", { waitUntil: "domcontentloaded" });
    expect(cssRes?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/CSS3/i);

    // Verify structured chapters container
    const chaptersContainer = page.locator("[data-course-roadmap]");
    await expect(chaptersContainer).toBeVisible();

    // Verify chapter cards exist
    const chapterCards = page.locator("[data-course-chapter]");
    const chapterCount = await chapterCards.count();
    expect(chapterCount).toBeGreaterThanOrEqual(4);

    // Verify guided practical tasks callout is present
    await expect(page.getByText(/Guided chapter task/i).first()).toBeVisible();

    // Verify official validation basis card is visible
    const validationCard = page.locator("[data-curriculum-sources]");
    await expect(validationCard).toBeVisible();
    await expect(validationCard).toContainText(/MDN CSS Guide/i);

    // Test Python course
    const pythonRes = await page.goto("/courses/python", { waitUntil: "domcontentloaded" });
    expect(pythonRes?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/Python/i);
    await expect(page.locator("[data-course-roadmap]")).toBeVisible();
    await expect(page.locator("[data-curriculum-sources]")).toContainText(
      /Official Python Tutorial/i,
    );

    expect(pageErrors).toHaveLength(0);
  });

  test("2. Specialization Detail Pages enforce exact fixed pricing and structured learning journey", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // 1. Full-Stack Developer (Must be PKR 20,000/month)
    await page.goto("/specializations/full-stack-developer", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/Full-Stack Developer/i);

    // Check fixed pricing in hero badge and sticky card
    const heroPricingBadge = page.getByText(/Fixed Tuition: PKR 20,000\/month/i);
    await expect(heroPricingBadge).toBeVisible();

    const stickyPricing = page.getByText(/PKR 20,000\/month/i).first();
    await expect(stickyPricing).toBeVisible();

    // Check schedule and format wording
    await expect(page.getByText(/4 live online classes\/week/i).first()).toBeVisible();
    await expect(page.getByText(/Recorded sessions for review/i).first()).toBeVisible();

    // Verify specialization journey container & capstone
    await expect(page.locator("[data-program-roadmap]")).toBeVisible();
    await expect(page.locator("[data-program-course]").first()).toBeVisible();
    await expect(page.locator("[data-program-capstone]")).toBeVisible();

    // 2. Data Analyst (Must be PKR 20,000/month)
    await page.goto("/specializations/data-analyst", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Fixed Tuition: PKR 20,000\/month/i)).toBeVisible();

    // 3. Data Science (Must be PKR 20,000/month)
    await page.goto("/specializations/data-science", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Fixed Tuition: PKR 20,000\/month/i)).toBeVisible();

    // 4. Frontend Developer (Must be PKR 15,000/month)
    await page.goto("/specializations/frontend-developer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Fixed Tuition: PKR 15,000\/month/i)).toBeVisible();

    // 5. Backend Developer (Must be PKR 15,000/month)
    await page.goto("/specializations/backend-developer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Fixed Tuition: PKR 15,000\/month/i)).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("3. Specialization catalog cards display fixed tuition badges and delivery summary", async ({
    page,
  }) => {
    await page.goto("/specializations", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);

    const specCards = page.locator("[data-specialization-card]");
    expect(await specCards.count()).toBe(specializations.length);

    // Verify Full-Stack card shows PKR 20,000
    const fullStackCard = page.locator('[data-specialization-card="full-stack-developer"]');
    await expect(fullStackCard).toContainText(/PKR 20,000\/month/i);
    await expect(fullStackCard).toContainText(/4 live classes\/wk/i);

    // Verify Frontend Developer card shows PKR 15,000
    const frontendCard = page.locator('[data-specialization-card="frontend-developer"]');
    await expect(frontendCard).toContainText(/PKR 15,000\/month/i);
    await expect(frontendCard).toContainText(/4 live classes\/wk/i);
  });

  test("4. Course catalog cards render uniform presentation, badges, and CTAs", async ({
    page,
  }) => {
    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);

    const courseCards = page.locator("[data-course-card]");
    expect(await courseCards.count()).toBe(courses.length);

    const firstCard = courseCards.first();
    await expect(firstCard.getByText(/View course/i)).toBeVisible();
  });

  test("5. Multi-viewport responsive audit ensures 0 horizontal overflow across mobile, tablet, and desktop", async ({
    page,
  }) => {
    const viewports = [
      { width: 375, height: 667, name: "iPhone SE" },
      { width: 390, height: 844, name: "iPhone 12/13/14" },
      { width: 430, height: 932, name: "iPhone Pro Max" },
      { width: 768, height: 1024, name: "iPad Portrait" },
      { width: 1024, height: 768, name: "iPad Landscape" },
      { width: 1440, height: 900, name: "Desktop Wide" },
    ];

    const testRoutes = [
      "/courses/css3",
      "/courses/python",
      "/specializations/full-stack-developer",
      "/specializations/data-analyst",
    ];

    for (const route of testRoutes) {
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(
          hasHorizontalScroll,
          `Horizontal scroll detected on ${route} at ${vp.name} (${vp.width}px)`,
        ).toBe(false);
      }
    }
  });

  test("6. Reduced-motion accessibility mode renders content fully visible and accessible", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/courses/css3", { waitUntil: "domcontentloaded" });

    // Verify heading, roadmap, and buttons are visible under reduced-motion
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-course-roadmap]")).toBeVisible();
    await expect(page.locator("[data-curriculum-sources]")).toBeVisible();

    await page.goto("/specializations/full-stack-developer", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-program-roadmap]")).toBeVisible();
    await expect(page.locator("[data-program-capstone]")).toBeVisible();
  });
});
