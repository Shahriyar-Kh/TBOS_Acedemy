import { chromium } from "@playwright/test";
import { site } from "../src/data/site";

const BASE_URL = (process.env.TEST_URL || site.url).trim();

const keyRoutes = [
  "/",
  "/courses",
  "/courses/python",
  "/specializations/full-stack-developer",
  "/live-batches/100-days-complete-python",
  "/tutoring/mathematics",
  "/blog",
  "/blog/python-learning-roadmap-beginners",
  "/apply",
  "/free-demo",
  "/contact",
];

const viewports = [
  { width: 375, height: 667, name: "Mobile compact" },
  { width: 390, height: 844, name: "Mobile standard" },
  { width: 430, height: 932, name: "Mobile large" },
  { width: 768, height: 1024, name: "Tablet portrait" },
  { width: 1024, height: 768, name: "Tablet landscape" },
  { width: 1280, height: 800, name: "Desktop" },
  { width: 1440, height: 900, name: "Desktop wide" },
];

console.log("==================================================");
console.log("TBOS ACADEMY — BROWSER PERFORMANCE & RESPONSIVE SMOKE AUDIT");
console.log(`Base URL: ${BASE_URL}`);
console.log("Note: this script does not generate Lighthouse category scores.");
console.log("==================================================");

async function runPerformanceAudit() {
  const browser = await chromium.launch({ headless: true });
  let errors = 0;

  console.log("\n[1/3] Auditing horizontal overflow at seven viewports...");
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const route of keyRoutes) {
      try {
        const response = await page.goto(`${BASE_URL}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        if (!response || response.status() !== 200) {
          console.error(`FAIL: ${route} returned HTTP ${response?.status() ?? "no response"}`);
          errors++;
          continue;
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        if (overflow > 1) {
          console.error(
            `FAIL: ${route} overflows by ${overflow}px at ${viewport.name} (${viewport.width}px)`,
          );
          errors++;
        }
      } catch (error) {
        console.error(`FAIL: ${route} at ${viewport.name}: ${(error as Error).message}`);
        errors++;
      }
    }

    await context.close();
  }

  console.log("\n[2/3] Auditing image, control, and skip-navigation basics...");
  const accessibilityContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const accessibilityPage = await accessibilityContext.newPage();
  for (const route of keyRoutes) {
    const response = await accessibilityPage.goto(`${BASE_URL}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    if (!response || response.status() !== 200) {
      console.error(`FAIL: ${route} returned HTTP ${response?.status() ?? "no response"}`);
      errors++;
      continue;
    }

    const issues = await accessibilityPage.evaluate(() => {
      const imagesMissingAlt = [...document.querySelectorAll("img")].filter(
        (image) => !image.hasAttribute("alt"),
      ).length;
      const zeroSizedImages = [...document.querySelectorAll("img")].filter(
        (image) =>
          image.getBoundingClientRect().width === 0 || image.getBoundingClientRect().height === 0,
      ).length;
      const unnamedControls = [...document.querySelectorAll("button, a[href]")].filter(
        (element) => {
          const label =
            element.getAttribute("aria-label") ||
            element.getAttribute("title") ||
            element.textContent;
          return !label?.trim();
        },
      ).length;
      const hasSkipLink = Boolean(document.querySelector('a[href="#main-content"]'));
      return { imagesMissingAlt, zeroSizedImages, unnamedControls, hasSkipLink };
    });

    if (issues.imagesMissingAlt > 0 || issues.zeroSizedImages > 0) {
      console.error(`FAIL: ${route} has invalid image semantics or rendered dimensions`, issues);
      errors++;
    }
    if (issues.unnamedControls > 0 || !issues.hasSkipLink) {
      console.error(`FAIL: ${route} has unnamed controls or no skip link`, issues);
      errors++;
    }
  }
  await accessibilityContext.close();

  console.log("\n[3/3] Collecting synthetic CLS and LCP observations...");
  const metricsContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await metricsContext.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0 };
    Object.defineProperty(window, "__tbosPerformanceMetrics", { value: metrics, writable: false });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value || 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries.at(-1);
      if (lastEntry) metrics.lcp = lastEntry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const metricsPage = await metricsContext.newPage();

  for (const route of keyRoutes) {
    const response = await metricsPage.goto(`${BASE_URL}${route}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    if (!response || response.status() !== 200) {
      console.error(`FAIL: ${route} returned HTTP ${response?.status() ?? "no response"}`);
      errors++;
      continue;
    }
    await metricsPage.waitForTimeout(750);
    const metrics = await metricsPage.evaluate(() => {
      return (window as Window & { __tbosPerformanceMetrics?: { cls: number; lcp: number } })
        .__tbosPerformanceMetrics;
    });
    if (!metrics) {
      console.error(`FAIL: Browser performance observers were unavailable on ${route}`);
      errors++;
      continue;
    }

    console.log(
      `${route}: CLS ${metrics.cls.toFixed(3)}, observed LCP ${Math.round(metrics.lcp)}ms`,
    );
    if (metrics.cls > 0.1) {
      console.error(`FAIL: ${route} synthetic CLS exceeds 0.10`);
      errors++;
    }
    if (metrics.lcp > 2500) {
      console.warn(`WARN: ${route} observed LCP exceeds 2.5s in this synthetic run`);
    }
  }

  await metricsContext.close();
  await browser.close();

  console.log("\n==================================================");
  if (errors === 0) {
    console.log("BROWSER PERFORMANCE & RESPONSIVE SMOKE AUDIT: PASSED");
    console.log(
      "Real Lighthouse category scoring is handled by the scheduled Lighthouse CI action.",
    );
    return;
  }

  console.error(`BROWSER PERFORMANCE & RESPONSIVE SMOKE AUDIT: FAILED with ${errors} issue(s).`);
  process.exitCode = 1;
}

runPerformanceAudit().catch((error) => {
  console.error("Fatal performance audit error:", error);
  process.exitCode = 1;
});
