import { test, expect } from "@playwright/test";
import { tutoringSubjects } from "../../src/data/tutoring";

test.describe("Phase 12F Tutoring & Trust Pages Suite", () => {
  test("1. Tutoring catalog renders all 12 canonical options with detail links", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const res = await page.goto("/tutoring", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);

    expect(tutoringSubjects.length).toBe(12);
    await expect(page.locator("[data-tutoring-card]")).toHaveCount(12);

    for (const subject of tutoringSubjects) {
      await expect(
        page.locator(`a[href*="/tutoring/${subject.slug}"]`).first(),
      ).toBeVisible();
    }

    expect(pageErrors).toHaveLength(0);
  });

  test("2. All 12 tutoring detail routes load with single H1 and subject context", async ({
    page,
  }) => {
    test.setTimeout(90000);

    for (const subject of tutoringSubjects) {
      const pageErrors: string[] = [];
      const listener = (err: Error) => pageErrors.push(err.message);
      page.on("pageerror", listener);

      const res = await page.goto(`/tutoring/${subject.slug}`, {
        waitUntil: "domcontentloaded",
      });
      expect(res?.status(), `Expected 200 for ${subject.slug}`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(subject.title);

      const applyHref = await page.locator('a[href*="/apply"]').first().getAttribute("href");
      expect(applyHref).toContain("/apply");
      expect(new URL(applyHref || "", "https://techbuiltos.online").searchParams.get("selected")).toBe(
        subject.title,
      );

      const demoHref = await page.locator('a[href*="/free-demo"]').first().getAttribute("href");
      expect(demoHref).toContain("/free-demo");
      expect(new URL(demoHref || "", "https://techbuiltos.online").searchParams.get("selected")).toBe(
        subject.title,
      );

      await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
      await expect(page.getByText(/one trial session/i).first()).toBeVisible();

      expect(pageErrors).toHaveLength(0);
      page.off("pageerror", listener);
    }
  });

  test("3. Academic and Quran tutoring preserve the correct admissions type", async ({ page }) => {
    await page.goto("/tutoring/mathematics", { waitUntil: "domcontentloaded" });
    const academicApply = await page.locator('a[href*="/apply"]').first().getAttribute("href");
    const academicDemo = await page.locator('a[href*="/free-demo"]').first().getAttribute("href");
    expect(
      new URL(academicApply || "", "https://techbuiltos.online").searchParams.get("type"),
    ).toBe("Academic Tutoring");
    expect(
      new URL(academicDemo || "", "https://techbuiltos.online").searchParams.get("type"),
    ).toBe("Academic Tutoring");

    await page.goto("/tutoring/tajweed-tarteel", { waitUntil: "domcontentloaded" });
    const quranApply = await page.locator('a[href*="/apply"]').first().getAttribute("href");
    const quranDemo = await page.locator('a[href*="/free-demo"]').first().getAttribute("href");
    expect(
      new URL(quranApply || "", "https://techbuiltos.online").searchParams.get("type"),
    ).toBe("Quran & Islamic Studies");
    expect(
      new URL(quranDemo || "", "https://techbuiltos.online").searchParams.get("type"),
    ).toBe("Quran & Islamic Studies");
  });

  test("4. Trust pages use clear non-guarantee and Free Demo language", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/thousands of students/i)).toHaveCount(0);

    await page.goto("/testimonials", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/do not guarantee grades, jobs, earnings/i)).toBeVisible();
    await expect(page.getByText(/one trial session/i).first()).toBeVisible();

    await page.goto("/faq", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/Do you guarantee grades, jobs/i)).toBeVisible();

    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Free Demo trial session/i)).toBeVisible();
    await expect(page.getByText(/do not guarantee grades/i)).toBeVisible();

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/Meta Pixel/i)).toBeVisible();
  });

  test("5. Tutoring detail canonical URLs are clean and absolute", async ({ page }) => {
    await page.goto(
      "/tutoring/mathematics?utm_source=meta&utm_medium=paid_social&utm_campaign=tutoring_test",
      { waitUntil: "domcontentloaded" },
    );

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe("https://techbuiltos.online/tutoring/mathematics");
  });

  test("6. Phase 12F pages have zero horizontal overflow across 7 viewports", async ({
    page,
  }) => {
    test.setTimeout(90000);

    const viewports = [375, 390, 430, 768, 1024, 1280, 1440];
    const routes = [
      "/tutoring",
      "/tutoring/mathematics",
      "/tutoring/tajweed-tarteel",
      "/about",
      "/testimonials",
      "/faq",
      "/privacy",
      "/terms",
    ];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(100);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(overflow, `Horizontal overflow at ${width}px on ${route}`).toBe(false);
      }
    }
  });

  test("7. Core completed-phase routes remain healthy", async ({ page }) => {
    for (const route of ["/", "/courses", "/specializations", "/live-batches", "/contact"]) {
      const res = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });
});
