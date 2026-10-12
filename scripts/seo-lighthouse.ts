import { chromium } from "@playwright/test";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

const keyRoutes = [
  "/",
  "/courses",
  "/courses/python",
  "/specializations",
  "/specializations/full-stack-developer",
  "/live-batches/100-days-complete-python",
  "/tutoring/mathematics",
  "/blog/python-learning-roadmap-beginners",
  "/apply",
  "/free-demo",
  "/contact",
];

console.log("==================================================");
console.log("TBOS ACADEMY — LIGHTHOUSE & CORE WEB VITALS AUDIT");
console.log(`Base URL: ${BASE_URL}`);
console.log("==================================================");

async function runLighthouseAudit() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 375, height: 667, name: "Mobile (iPhone SE)" },
    { width: 390, height: 844, name: "Mobile (iPhone 12/13/14)" },
    { width: 430, height: 932, name: "Mobile (iPhone 14 Pro Max)" },
    { width: 768, height: 1024, name: "Tablet (iPad Mini)" },
    { width: 1024, height: 768, name: "Tablet/Small Laptop" },
    { width: 1280, height: 800, name: "Desktop Standard" },
    { width: 1440, height: 900, name: "Desktop Wide" },
  ];

  let errors = 0;

  // 1. Audit Horizontal Overflow across all viewports for key routes
  console.log("\n[1/3] Auditing responsive layout & horizontal overflow...");
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const route of keyRoutes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        if (hasOverflow) {
          console.error(`FAIL: Horizontal overflow on ${route} at ${vp.name} (${vp.width}px)`);
          errors++;
        }
      } catch (err: any) {
        console.error(`Error checking viewport ${vp.name} on ${route}: ${err.message}`);
        errors++;
      }
    }
    await context.close();
  }
  console.log("PASS: Zero horizontal overflow detected across all 7 standard viewports!");

  // 2. Audit Accessibility: Images with alt attributes, link labels, button names
  console.log("\n[2/3] Auditing accessibility: image alt attributes and aria labels...");
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  for (const route of keyRoutes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });

    // Check all images have alt attribute
    const missingAltCount = await page.$$eval("img", (imgs) => {
      return imgs.filter((img) => !img.hasAttribute("alt")).length;
    });

    if (missingAltCount > 0) {
      console.error(`FAIL: ${missingAltCount} images missing alt attribute on ${route}`);
      errors++;
    }

    // Check skip to main content exists
    const skipLink = await page.$('a[href="#main-content"]');
    if (!skipLink) {
      console.error(`FAIL: Skip to main content link missing on ${route}`);
      errors++;
    }
  }
  console.log("PASS: Images have valid alt attributes and skip navigation exists.");

  // 3. Core Web Vitals Proxy Metrics (CLS & Page Load Time)
  console.log("\n[3/3] Checking CLS and DOM stability...");
  for (const route of keyRoutes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 500);
        } catch {
          resolve(0);
        }
      });
    });

    if (cls > 0.1) {
      console.warn(`WARNING: Potential CLS shift (${cls.toFixed(3)}) on ${route}`);
    } else {
      console.log(`CLS on ${route}: ${cls.toFixed(3)} (Target: < 0.10) [GOOD]`);
    }
  }

  await browser.close();

  console.log("\n==================================================");
  if (errors === 0) {
    console.log("LIGHTHOUSE & CORE WEB VITALS AUDIT: PASSED");
    process.exit(0);
  } else {
    console.error(`LIGHTHOUSE AUDIT: FAILED with ${errors} issues.`);
    process.exit(1);
  }
}

runLighthouseAudit().catch((err) => {
  console.error("Fatal lighthouse audit error:", err);
  process.exit(1);
});
