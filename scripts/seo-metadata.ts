import { chromium } from "@playwright/test";
import { courses } from "../src/data/courses";
import { specializations } from "../src/data/specializations";
import { liveOffers } from "../src/data/liveOffers";
import { tutoringSubjects } from "../src/data/tutoring";
import { seoPages } from "../src/data/seoPages";
import { articles } from "../src/data/articles";
import { site } from "../src/data/site";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

const coreStaticRoutes = [
  "/",
  "/about",
  "/how-it-works",
  "/for-students",
  "/for-parents",
  "/courses",
  "/live-batches",
  "/specializations",
  "/tutoring",
  "/apply",
  "/free-demo",
  "/contact",
  "/testimonials",
  "/faq",
  "/blog",
  "/privacy",
  "/terms",
];

const allIndexableRoutes = [
  ...coreStaticRoutes,
  ...courses.map((c) => `/courses/${c.slug}`),
  ...specializations.map((s) => `/specializations/${s.slug}`),
  ...liveOffers.map((o) => `/live-batches/${o.slug}`),
  ...tutoringSubjects.map((t) => `/tutoring/${t.slug}`),
  ...seoPages.map((p) => `/${p.slug}`),
  ...articles.map((a) => `/blog/${a.slug}`),
];

console.log("==================================================");
console.log("TBOS ACADEMY — METADATA DUPLICATION & QUALITY AUDIT");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Routes to audit: ${allIndexableRoutes.length}`);
console.log("==================================================");

async function runMetadataAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  let errors = 0;

  for (const route of allIndexableRoutes) {
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = (await page.title()).trim();
      const desc = (
        (await page.locator('meta[name="description"]').getAttribute("content")) || ""
      ).trim();
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");

      // Verify non-empty
      if (!title) {
        console.error(`FAIL: ${route} has empty <title>`);
        errors++;
      } else {
        if (!titleMap.has(title)) titleMap.set(title, []);
        titleMap.get(title)!.push(route);
      }

      if (!desc) {
        console.error(`FAIL: ${route} has empty meta description`);
        errors++;
      } else {
        if (!descMap.has(desc)) descMap.set(desc, []);
        descMap.get(desc)!.push(route);
      }

      // Canonical format
      const expectedCanonical = route === "/" ? `${site.url}/` : `${site.url}${route}`;
      if (canonical !== expectedCanonical) {
        console.error(
          `FAIL: ${route} canonical mismatch: found "${canonical}", expected "${expectedCanonical}"`,
        );
        errors++;
      }

      // og:url match
      if (ogUrl && ogUrl !== expectedCanonical) {
        console.error(
          `FAIL: ${route} og:url mismatch: found "${ogUrl}", expected "${expectedCanonical}"`,
        );
        errors++;
      }
    } catch (err: any) {
      console.error(`Error auditing ${route}: ${err.message}`);
      errors++;
    }
  }

  await browser.close();

  // Check duplicate titles
  console.log("\n--- TITLE AUDIT RESULTS ---");
  let dupTitles = 0;
  for (const [title, routes] of titleMap.entries()) {
    if (routes.length > 1) {
      console.error(`DUPLICATE TITLE ("${title}") found on ${routes.length} pages:`, routes);
      dupTitles++;
      errors++;
    }
  }
  if (dupTitles === 0) {
    console.log(`PASS: All ${titleMap.size} pages have completely unique <title> tags!`);
  }

  // Check duplicate descriptions
  console.log("\n--- DESCRIPTION AUDIT RESULTS ---");
  let dupDescs = 0;
  for (const [desc, routes] of descMap.entries()) {
    if (routes.length > 1) {
      console.error(`DUPLICATE DESCRIPTION found on ${routes.length} pages:`, routes);
      dupDescs++;
      errors++;
    }
  }
  if (dupDescs === 0) {
    console.log(`PASS: All ${descMap.size} pages have completely unique meta descriptions!`);
  }

  console.log("\n==================================================");
  if (errors === 0) {
    console.log("METADATA AUDIT: PASSED (100% Unique & Valid)");
    process.exit(0);
  } else {
    console.error(`METADATA AUDIT: FAILED with ${errors} issues.`);
    process.exit(1);
  }
}

runMetadataAudit().catch((err) => {
  console.error("Fatal metadata audit error:", err);
  process.exit(1);
});
