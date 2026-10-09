import { test, expect } from "@playwright/test";
import { courses } from "../../src/data/courses";
import { specializations } from "../../src/data/specializations";
import { liveOffers } from "../../src/data/liveOffers";
import { tutoringSubjects } from "../../src/data/tutoring";
import { seoPages } from "../../src/data/seoPages";
import { site } from "../../src/data/site";

test.describe("Phase 13 Final SEO, Accessibility & Acceptance", () => {
  test("1. Key public routes expose absolute canonical and matching Open Graph URLs", async ({
    page,
  }) => {
    const routes = [
      "/",
      "/blog",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      `/courses/${courses[0].slug}`,
      `/specializations/${specializations[0].slug}`,
      `/live-batches/${liveOffers[0].slug}`,
      `/tutoring/${tutoringSubjects[0].slug}`,
      ...seoPages.map((item) => `/${item.slug}`),
    ];

    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `Expected 200 for ${route}`).toBe(200);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, `Missing canonical on ${route}`).toBeTruthy();
      expect(canonical).toMatch(/^https:\/\/techbuiltos\.online\//);

      const ogUrl = await page.locator('meta[property="og:url"]').last().getAttribute("content");
      expect(ogUrl, `Missing og:url on ${route}`).toBe(canonical);

      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    }
  });

  test("2. Admin login is explicitly excluded from search indexing", async ({ page }) => {
    const response = await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex.*nofollow/,
    );
    await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute(
      "content",
      /noindex.*nofollow/,
    );
  });

  test("3. Keyboard users can skip directly to main content", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText(/skip to main content/i);
    await page.keyboard.press("Enter");

    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("4. Reduced-motion preference keeps revealed content visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    const reveal = heading.locator("xpath=ancestor::*[contains(@class,'motion-reduce:opacity-100')][1]");
    await expect(reveal).toHaveCount(1);

    const opacity = await reveal.evaluate((node) => getComputedStyle(node).opacity);
    expect(opacity).toBe("1");
  });

  test("5. Robots and sitemap expose public discovery without admin or API URLs", async ({
    request,
  }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    expect(robotsText).toContain("User-agent: *");
    expect(robotsText).toContain("Allow: /");
    expect(robotsText).toContain(`Sitemap: ${site.url}/sitemap.xml`);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();

    expect(xml).toContain(`<loc>${site.url}/courses/${courses[0].slug}</loc>`);
    expect(xml).toContain(`<loc>${site.url}/tutoring/${tutoringSubjects[0].slug}</loc>`);
    expect(xml).toContain(`<loc>${site.url}/${seoPages[0].slug}</loc>`);
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/api/");
  });

  test("6. Homepage includes performance-safe font and hero-image hints", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const fontStylesheet = page.locator(
      'link[rel="stylesheet"][href^="https://fonts.googleapis.com/css2"]',
    );
    await expect(fontStylesheet).toHaveCount(1);
    await expect(fontStylesheet).toHaveAttribute("href", /[?&]display=swap(?:&|$)/);

    const heroImage = page.locator("main img").first();
    await expect(heroImage).toHaveAttribute("fetchpriority", "high");

    const width = Number(await heroImage.getAttribute("width"));
    const height = Number(await heroImage.getAttribute("height"));
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("7. EducationalOrganization structured data includes canonical identity fields", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks
      .map((block) => {
        try {
          return JSON.parse(block);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const org = parsed.find((item) => item?.["@type"] === "EducationalOrganization");
    expect(org).toBeTruthy();
    expect(org.url).toBe(site.url);
    expect(org.email).toBe(site.email);
    expect(org.telephone).toBe(site.phoneDisplay);
  });

  test("8. Legacy SEO landings avoid unsupported outcome and authority claims", async ({ page }) => {
    const prohibited =
      /world-class|qualified tutors|expert tutors|expert-led|top grades|consistently improve|all time zones|results that show|job-ready|portfolio-ready by the end/i;

    for (const item of seoPages) {
      await page.goto(`/${item.slug}`, { waitUntil: "domcontentloaded" });
      const body = await page.locator("body").innerText();
      expect(body, `Unsupported claim found on /${item.slug}`).not.toMatch(prohibited);
    }
  });

  test("9. Public navigation controls have accessible names on mobile and desktop", async ({
    page,
  }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
        buttons
          .filter((button) => {
            const text = button.textContent?.trim();
            const label = button.getAttribute("aria-label");
            const title = button.getAttribute("title");
            return !text && !label && !title;
          })
          .map((button) => button.outerHTML),
      );

      expect(unnamedButtons, `Unnamed buttons at ${width}px`).toEqual([]);
    }
  });
});
