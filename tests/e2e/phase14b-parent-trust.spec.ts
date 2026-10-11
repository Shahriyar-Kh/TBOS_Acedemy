import { expect, test } from "@playwright/test";
import {
  familySupportSteps,
  parentDecisionPoints,
  parentQuestions,
} from "../../src/data/parentGuide";
import { site } from "../../src/data/site";

test.describe("Phase 14B Parent & Guardian Trust Hub", () => {
  test("1. Parent guide exposes six practical pre-enrolment decisions", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/for-parents", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(/See the learning plan before you commit/i);
    await expect(page.locator("[data-phase14-parent-guide]")).toBeVisible();
    await expect(page.locator("[data-parent-decision]")).toHaveCount(parentDecisionPoints.length);
    await expect(page.getByText(/fee, recording availability, included support/i)).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("2. Families receive concrete support, readiness and transparency guidance", async ({
    page,
  }) => {
    await page.goto("/for-parents", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-parent-support]")).toHaveCount(familySupportSteps.length);
    await expect(page.getByText(/learners under 18/i)).toBeVisible();
    await expect(page.getByText(/does not create automatic enrolment/i)).toBeVisible();
    await expect(page.getByText(/do not guarantee grades, jobs or other outcomes/i)).toBeVisible();
    await expect(page.locator("[data-parent-question]")).toHaveCount(parentQuestions.length);
  });

  test("3. Parent guide publishes indexable canonical and Open Graph metadata", async ({
    page,
  }) => {
    await page.goto("/for-parents", { waitUntil: "domcontentloaded" });
    const expected = `${site.url}/for-parents`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", expected);
    await expect(page.locator('meta[property="og:url"]').last()).toHaveAttribute(
      "content",
      expected,
    );
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test("4. Homepage, footer and sitemap make the parent guide discoverable", async ({
    page,
    request,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("link", { name: /Parent & guardian decision guide/i }),
    ).toHaveAttribute("href", "/for-parents");
    await expect(page.getByRole("link", { name: "For Parents", exact: true })).toHaveAttribute(
      "href",
      "/for-parents",
    );

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`<loc>${site.url}/for-parents</loc>`);
  });

  test("5. Parent guide remains accessible and overflow-free on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/for-parents", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);

    const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
      buttons.filter((button) => {
        const text = button.textContent?.trim();
        const label = button.getAttribute("aria-label");
        const title = button.getAttribute("title");
        return !text && !label && !title;
      }),
    );
    expect(unnamedButtons).toEqual([]);
  });

  test("6. Parent copy avoids unsupported authority and outcome claims", async ({ page }) => {
    await page.goto("/for-parents", { waitUntil: "domcontentloaded" });
    const prohibited =
      /guaranteed results|guaranteed job|automatic(?:ally)? enrolled|instant admission|certified instructors|qualified tutors|100% success/i;
    expect(await page.locator("body").innerText()).not.toMatch(prohibited);
  });
});
