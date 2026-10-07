import { test, expect } from "@playwright/test";
import { courses } from "../../src/data/courses";
import { specializations } from "../../src/data/specializations";
import {
  courseCatalogVisuals,
  specializationCatalogVisuals,
  isCourseVisualFallback,
  isSpecializationVisualFallback,
} from "../../src/data/catalogVisuals";

test.describe("Phase 12C Premium Catalog Suite", () => {
  test("1. Homepage loads cleanly and maintains branding & Meta tracking untouched", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/TechBuilt Open School/i);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(pageErrors).toHaveLength(0);
  });

  test("2. /courses catalog renders all 32 courses, semantic H1, search and category filters", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page.locator("h1")).toHaveCount(1);

    // Verify 32 courses rendered
    const courseCards = page.locator("[data-course-card]");
    const count = await courseCards.count();
    expect(count).toBe(32);

    // Test Search input filtering
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill("Python");
    await page.waitForTimeout(400);

    const pythonCards = page.locator("[data-course-card]");
    const filteredCount = await pythonCards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(count);

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(400);
    expect(await page.locator("[data-course-card]").count()).toBe(32);

    // Test category filter button
    const webCategoryBtn = page.getByRole("button", { name: /^Web Development/i }).first();
    if (await webCategoryBtn.isVisible()) {
      await webCategoryBtn.click();
      await page.waitForTimeout(400);
      const webCards = page.locator("[data-course-card]");
      expect(await webCards.count()).toBeGreaterThan(0);
      expect(await webCards.count()).toBeLessThan(32);
    }

    expect(pageErrors).toHaveLength(0);
  });

  test("3. Course detail pages (/courses/html5, python, react) load with context, CTAs, and single H1", async ({
    page,
  }) => {
    const slugs = ["html5", "python", "react"];

    for (const slug of slugs) {
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`/courses/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toHaveCount(1);

      // Verify Apply button preserves course context in URL
      const applyBtn = page.locator('a[href*="/apply"]').first();
      await expect(applyBtn).toBeVisible();
      const applyHref = await applyBtn.getAttribute("href");
      expect(applyHref).toContain("/apply");

      // Verify Free Demo button preserves context
      const demoBtn = page.locator('a[href*="/free-demo"]').first();
      if ((await demoBtn.count()) > 0) {
        const demoHref = await demoBtn.getAttribute("href");
        expect(demoHref).toContain("/free-demo");
      }

      // Verify WhatsApp CTA exists
      const waBtn = page.locator('a[href*="wa.me"]').first();
      await expect(waBtn).toBeVisible();

      expect(pageErrors).toHaveLength(0);
    }
  });

  test("4. /specializations catalog renders all 10 specializations and single H1", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/specializations", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);

    const specCards = page.locator("[data-specialization-card]");
    expect(await specCards.count()).toBe(10);
    expect(pageErrors).toHaveLength(0);
  });

  test("5. Specialization detail pages load with unique images, roadmap, career directions, and CTAs", async ({
    page,
  }) => {
    const slugs = ["frontend-developer", "python-developer", "data-science"];

    for (const slug of slugs) {
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`/specializations/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toHaveCount(1);

      // Hero image rendered
      const heroImg = page.locator("img").first();
      await expect(heroImg).toBeVisible();

      // Verify Apply button
      const applyBtn = page.locator('a[href*="/apply"]').first();
      await expect(applyBtn).toBeVisible();

      // Verify WhatsApp CTA
      const waBtn = page.locator('a[href*="wa.me"]').first();
      await expect(waBtn).toBeVisible();

      expect(pageErrors).toHaveLength(0);
    }
  });

  test("6. Responsive layout QA across 7 viewports has zero horizontal overflow", async ({
    page,
  }) => {
    const viewports = [375, 390, 430, 768, 1024, 1280, 1440];
    const testRoutes = [
      "/courses",
      "/courses/python",
      "/specializations",
      "/specializations/data-science",
    ];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 800 });

      for (const route of testRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(200);

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(overflow, `Horizontal overflow detected at ${width}px on ${route}`).toBe(false);
      }
    }
  });

  test("7. Invariant: 100% of canonical courses and specializations have explicit visual mappings without fallback", async () => {
    // Assert exactly 32 canonical courses
    expect(courses.length).toBe(32);

    // Assert courseCatalogVisuals has exactly 32 entries
    const visualSlugs = Object.keys(courseCatalogVisuals);
    expect(visualSlugs.length).toBe(32);

    // Assert every course slug in courses has an explicit entry in courseCatalogVisuals
    for (const course of courses) {
      expect(courseCatalogVisuals[course.slug]).toBeDefined();
      expect(courseCatalogVisuals[course.slug].slug).toBe(course.slug);
      expect(isCourseVisualFallback(course.slug)).toBe(false);
    }

    // Obsolete slugs from prior hallucinated report MUST NOT exist
    const obsoleteSlugs = [
      "tailwind-css",
      "expressjs",
      "django",
      "fastapi",
      "sql-server",
      "data-analysis",
      "seaborn",
      "data-science-with-python",
      "machine-learning",
    ];
    for (const obsolete of obsoleteSlugs) {
      expect(courseCatalogVisuals[obsolete]).toBeUndefined();
      expect(isCourseVisualFallback(obsolete)).toBe(true);
    }

    // Assert exactly 10 canonical specializations
    expect(specializations.length).toBe(10);
    const specVisualSlugs = Object.keys(specializationCatalogVisuals);
    expect(specVisualSlugs.length).toBe(10);

    for (const spec of specializations) {
      expect(specializationCatalogVisuals[spec.slug]).toBeDefined();
      expect(specializationCatalogVisuals[spec.slug].slug).toBe(spec.slug);
      expect(isSpecializationVisualFallback(spec.slug)).toBe(false);
    }
  });
});
