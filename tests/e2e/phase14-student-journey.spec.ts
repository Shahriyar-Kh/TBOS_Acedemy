import { expect, test } from "@playwright/test";
import { enrollmentStages, learningFormats } from "../../src/data/studentJourney";
import { site } from "../../src/data/site";

test.describe("Phase 14A Student Decision & Enrollment Journey", () => {
  test("1. How It Works exposes the complete honest nine-stage journey", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/how-it-works", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(/How learning with TechBuilt works/i);
    await expect(page.locator("[data-phase14-journey]")).toBeVisible();
    await expect(page.locator("[data-enrollment-stage]")).toHaveCount(enrollmentStages.length);
    await expect(page.getByText(/not automatic enrolment/i).first()).toBeVisible();
    await expect(page.getByText(/applicable fee and included support/i)).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("2. Student guide compares all real learning formats and expectations", async ({ page }) => {
    const response = await page.goto("/for-students", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(/Choose a learning format you can sustain/i);
    await expect(page.locator("[data-phase14-student-guide]")).toBeVisible();
    await expect(page.locator("[data-learning-format]")).toHaveCount(learningFormats.length);
    await expect(page.getByText(/30–60 day roadmaps/i)).toBeVisible();
    await expect(page.getByText(/four live online classes per week/i)).toBeVisible();
    await expect(page.getByText(/applicable fee are confirmed separately/i)).toBeVisible();
  });

  test("3. New routes publish canonical and matching Open Graph URLs", async ({ page }) => {
    for (const route of ["/how-it-works", "/for-students"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const expected = `${site.url}${route}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", expected);
      await expect(page.locator('meta[property="og:url"]').last()).toHaveAttribute(
        "content",
        expected,
      );
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    }
  });

  test("4. Homepage, footer and sitemap make the journey discoverable", async ({
    page,
    request,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("link", { name: /complete admissions-to-learning journey/i }),
    ).toHaveAttribute("href", "/how-it-works");
    await expect(page.getByRole("link", { name: "How It Works", exact: true })).toHaveAttribute(
      "href",
      "/how-it-works",
    );
    await expect(page.getByRole("link", { name: "For Students", exact: true })).toHaveAttribute(
      "href",
      "/for-students",
    );

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain(`<loc>${site.url}/how-it-works</loc>`);
    expect(xml).toContain(`<loc>${site.url}/for-students</loc>`);
  });

  test("5. Phase 14 pages remain accessible and overflow-free on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const route of ["/how-it-works", "/for-students"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasHorizontalOverflow, `Horizontal overflow on ${route}`).toBe(false);

      const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
        buttons.filter((button) => {
          const text = button.textContent?.trim();
          const label = button.getAttribute("aria-label");
          const title = button.getAttribute("title");
          return !text && !label && !title;
        }),
      );
      expect(unnamedButtons).toEqual([]);
    }
  });

  test("6. Journey copy avoids unsupported guarantees and automatic-enrolment claims", async ({
    page,
  }) => {
    const prohibited =
      /guaranteed results|guaranteed job|automatic(?:ally)? enrolled|instant admission|certified instructors|qualified tutors|100% success/i;

    for (const route of ["/how-it-works", "/for-students"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.locator("body").innerText()).not.toMatch(prohibited);
    }
  });
});
