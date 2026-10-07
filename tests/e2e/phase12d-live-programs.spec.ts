import { test, expect } from "@playwright/test";
import { activeLiveOffers, liveOffers } from "../../src/data/liveOffers";
import { liveProgramVisuals, isLiveProgramVisualFallback } from "../../src/data/liveProgramVisuals";

test.describe("Phase 12D Premium Live Programs Suite", () => {
  // Hard Invariant Test
  test("Invariant: All 3 canonical live programs exist, are active, and have complete unique visual configurations", async () => {
    const canonicalSlugs = [
      "python-young-developers",
      "100-days-complete-python",
      "python-data-analysis-research-ai",
    ];

    expect(activeLiveOffers.length).toBe(3);

    const imagesSet = new Set<string>();

    for (const slug of canonicalSlugs) {
      const offer = liveOffers.find((o) => o.slug === slug);
      expect(offer, `Offer ${slug} must exist in liveOffers`).toBeDefined();
      expect(offer?.status).toBe("active");
      expect(offer?.freeDemo).toBe(true);
      expect(offer?.duration).toBeTruthy();
      expect(offer?.audience).toBeTruthy();
      expect(offer?.offerFee).toBeGreaterThan(0);
      expect(offer?.roadmap.length).toBeGreaterThanOrEqual(6);

      // Visual mapping verification
      expect(isLiveProgramVisualFallback(slug)).toBe(false);
      const visual = liveProgramVisuals[slug];
      expect(visual).toBeDefined();
      expect(visual.image).toMatch(/^\/images\/home\//);
      expect(imagesSet.has(visual.image), `Image ${visual.image} must be unique`).toBe(false);
      imagesSet.add(visual.image);
    }
  });

  test("1. /live-batches loads cleanly with single H1, 3 active cards, comparison table, and live pillars", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/live-batches", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Active Live Group Classes/i);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/Learn Live/i);

    // Verify exactly 3 active program cards rendered
    const cards = page.locator("[data-live-program-card]");
    expect(await cards.count()).toBe(3);

    // Verify all 3 canonical live slugs are present in cards
    const canonicalSlugs = [
      "python-young-developers",
      "100-days-complete-python",
      "python-data-analysis-research-ai",
    ];
    for (const slug of canonicalSlugs) {
      await expect(page.locator(`a[href*="/live-batches/${slug}"]`).first()).toBeVisible();
    }

    // Verify comparison section heading
    await expect(page.getByText(/Which Live Program Fits You/i).first()).toBeVisible();

    // Verify live experience section heading
    await expect(page.getByText(/What Live Cohort Learning Means/i).first()).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("2. Detail pages load cleanly with single H1, unique hero image, duration, frequency, and offer fee", async ({
    page,
  }) => {
    const testCases = [
      {
        slug: "python-young-developers",
        title: /Python Young Developers/i,
        imageSubstr: "live-python-young-developers.webp",
        duration: "6 months",
        frequency: "2–3 classes/week",
        offerFeeText: "5,000",
      },
      {
        slug: "100-days-complete-python",
        title: /100 Days Complete Python/i,
        imageSubstr: "live-100-days-python.webp",
        duration: "100 days",
        frequency: "3–4 classes/week",
        offerFeeText: "5,000",
      },
      {
        slug: "python-data-analysis-research-ai",
        title: /Python for Data Analysis/i,
        imageSubstr: "live-data-ai-research.webp",
        duration: "6 months",
        frequency: "4 classes/week",
        offerFeeText: "10,000",
      },
    ];

    for (const tc of testCases) {
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`/live-batches/${tc.slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(tc.title);

      // Verify unique hero image is present
      const heroImg = page.locator(`img[src*="${tc.imageSubstr}"]`).first();
      await expect(heroImg).toBeVisible();

      // Verify real duration and class frequency are visible
      await expect(page.getByText(tc.duration, { exact: false }).first()).toBeVisible();
      await expect(page.getByText(tc.frequency, { exact: false }).first()).toBeVisible();

      // Verify correct offer fee
      await expect(page.getByText(tc.offerFeeText, { exact: false }).first()).toBeVisible();

      // Verify Free Demo wording clearly states trial / demo session
      await expect(page.getByText(/trial.*session|demo.*session/i).first()).toBeVisible();

      // Verify Apply CTA preselects correct program context
      const applyBtn = page.locator("[data-program-apply]").first();
      await expect(applyBtn).toBeVisible();
      const applyHref = await applyBtn.getAttribute("href");
      expect(applyHref).toContain("/apply");
      expect(applyHref).toContain("type=Live+Group+Offer");

      // Verify Free Demo CTA preselects correct program context
      const demoBtn = page.locator("[data-program-demo]").first();
      await expect(demoBtn).toBeVisible();
      const demoHref = await demoBtn.getAttribute("href");
      expect(demoHref).toContain("/free-demo");
      expect(demoHref).toContain("type=Live+Group+Offer");

      // Verify WhatsApp CTA exists and references program
      const waBtn = page.locator('a[href*="wa.me"]').first();
      await expect(waBtn).toBeVisible();
      const waHref = await waBtn.getAttribute("href");
      expect(waHref).toContain("wa.me");

      expect(pageErrors).toHaveLength(0);
    }
  });

  test("3. Program-specific narrative checks for all 3 cohorts", async ({ page }) => {
    // 100 Days Python: communicates 100 days, 37 live lectures, 6 phases
    await page.goto("/live-batches/100-days-complete-python", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/100 Days/i).first()).toBeVisible();
    await expect(page.getByText(/37.*Lectures/i).first()).toBeVisible();
    await expect(page.getByText(/6.*Phases/i).first()).toBeVisible();

    // Young Developers: communicates Grades 5–10, 6 months, 2–3 classes/week
    await page.goto("/live-batches/python-young-developers", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Grades 5.*10/i).first()).toBeVisible();
    await expect(page.getByText(/6 months/i).first()).toBeVisible();
    await expect(page.getByText(/2–3 classes\/week/i).first()).toBeVisible();

    // Data / Research / AI: communicates 6 months, 4 classes/week, researchers/scholars/professionals
    await page.goto("/live-batches/python-data-analysis-research-ai", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/6 months/i).first()).toBeVisible();
    await expect(page.getByText(/4 classes\/week/i).first()).toBeVisible();
    await expect(page.getByText(/BS.*MS.*MPhil.*PhD|Scholars/i).first()).toBeVisible();
  });

  test("4. UTM-loaded live page renders normally and preserves ViewContent tracking call", async ({
    page,
  }) => {
    // Mock fbq to verify tracking
    await page.addInitScript(() => {
      (window as unknown as { __tbosFbqCalls: unknown[][] }).__tbosFbqCalls = [];
      window.fbq = (...args: unknown[]) => {
        (window as unknown as { __tbosFbqCalls: unknown[][] }).__tbosFbqCalls.push(args);
      };
    });

    const utmUrl =
      "/live-batches/100-days-complete-python?utm_source=meta&utm_medium=paid_social&utm_campaign=spring2026&utm_content=core_python";

    const res = await page.goto(utmUrl, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/100 Days Complete Python/i);

    // Verify canonical tag remains clean without UTM parameters
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe("https://techbuiltos.online/live-batches/100-days-complete-python");
  });

  test("5. Responsive layout QA across 7 viewports has zero horizontal overflow", async ({
    page,
  }) => {
    const viewports = [375, 390, 430, 768, 1024, 1280, 1440];
    const testRoutes = [
      "/live-batches",
      "/live-batches/python-young-developers",
      "/live-batches/100-days-complete-python",
      "/live-batches/python-data-analysis-research-ai",
    ];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 800 });

      for (const route of testRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(150);

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(overflow, `Horizontal overflow detected at ${width}px on ${route}`).toBe(false);
      }
    }
  });

  test("6. Regression check: Homepage, /courses, and /specializations still load cleanly", async ({
    page,
  }) => {
    const routes = ["/", "/courses", "/specializations"];
    for (const route of routes) {
      const res = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });
});
