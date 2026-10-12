import { chromium } from "@playwright/test";
import { site } from "../src/data/site";
import { indexableHtmlRoutes } from "./seo-route-inventory";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

const allIndexableRoutes = indexableHtmlRoutes;

console.log("==================================================");
console.log("TBOS ACADEMY — PRODUCTION SEO AUDIT GATE");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Indexable routes to audit: ${allIndexableRoutes.length}`);
console.log("==================================================");

async function runSeoAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  let failures = 0;

  // 1. Verify robots.txt
  console.log("\n[1/4] Auditing /robots.txt...");
  try {
    const res = await page.goto(`${BASE_URL}/robots.txt`, { waitUntil: "domcontentloaded" });
    const text = await page.innerText("body");
    if (!res || res.status() !== 200) {
      console.error("FAIL: /robots.txt status is not 200");
      failures++;
    } else if (
      !text.includes("Disallow: /admin") ||
      !text.includes("Disallow: /api") ||
      !text.includes("sitemap.xml")
    ) {
      console.error("FAIL: /robots.txt missing Disallow /admin, /api or sitemap reference");
      failures++;
    } else {
      console.log("PASS: /robots.txt contains proper rules and sitemap link.");
    }
  } catch (err: any) {
    console.error(`FAIL: Error fetching robots.txt: ${err.message}`);
    failures++;
  }

  // 2. Verify sitemap.xml
  console.log("\n[2/4] Auditing /sitemap.xml...");
  let sitemapUrls: string[] = [];
  try {
    const res = await page.goto(`${BASE_URL}/sitemap.xml`, { waitUntil: "domcontentloaded" });
    const content = await page.content();
    if (!res || res.status() !== 200) {
      console.error("FAIL: /sitemap.xml status is not 200");
      failures++;
    } else {
      const locMatches = content.match(/<loc>(.*?)<\/loc>/g) || [];
      sitemapUrls = locMatches.map((m) => m.replace(/<\/?loc>/g, ""));
      console.log(`Found ${sitemapUrls.length} URLs in sitemap.xml.`);

      // Exact parity check
      const missingInSitemap = allIndexableRoutes.filter((r) => {
        const expectedLoc = r === "/" ? `${site.url}/` : `${site.url}${r}`;
        return !sitemapUrls.includes(expectedLoc);
      });

      if (missingInSitemap.length > 0) {
        console.error(
          `FAIL: Missing ${missingInSitemap.length} routes in sitemap:`,
          missingInSitemap,
        );
        failures++;
      } else {
        console.log("PASS: All indexable routes exist in sitemap.xml with exact parity.");
      }

      const expectedSitemapUrls = new Set(
        allIndexableRoutes.map((route) => (route === "/" ? `${site.url}/` : `${site.url}${route}`)),
      );
      const unexpectedInSitemap = sitemapUrls.filter((url) => !expectedSitemapUrls.has(url));
      if (unexpectedInSitemap.length > 0 || sitemapUrls.length !== expectedSitemapUrls.size) {
        console.error("FAIL: Sitemap contains unexpected or duplicate URLs:", unexpectedInSitemap);
        failures++;
      }

      // Check no private/admin/api routes in sitemap
      const invalidInSitemap = sitemapUrls.filter(
        (url) =>
          url.includes("/admin") ||
          url.includes("/api") ||
          url.includes("?") ||
          url.includes("localhost"),
      );
      if (invalidInSitemap.length > 0) {
        console.error("FAIL: Private or invalid URLs in sitemap:", invalidInSitemap);
        failures++;
      } else {
        console.log("PASS: Zero private/admin/api/query URLs in sitemap.");
      }
    }
  } catch (err: any) {
    console.error(`FAIL: Error fetching sitemap.xml: ${err.message}`);
    failures++;
  }

  // 3. Audit all indexable routes (status 200, single H1, canonical, og:url, title, description)
  console.log("\n[3/4] Auditing all indexable routes for on-page SEO...");
  let auditedCount = 0;
  for (const route of allIndexableRoutes) {
    const url = `${BASE_URL}${route}`;
    const routePage = await context.newPage();
    try {
      let res = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = await routePage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          if (res && res.status() === 200) break;
        } catch {
          if (attempt === 0) await routePage.waitForTimeout(500);
        }
      }

      if (!res || res.status() !== 200) {
        console.error(`FAIL [${res?.status()}]: ${route}`);
        failures++;
        continue;
      }

      // Canonical link
      const canonical = await routePage.locator('link[rel="canonical"]').getAttribute("href");
      const expectedCanonical = route === "/" ? `${site.url}/` : `${site.url}${route}`;
      if (!canonical || canonical !== expectedCanonical) {
        console.error(
          `FAIL: ${route} canonical is "${canonical}", expected "${expectedCanonical}"`,
        );
        failures++;
      }

      // OG URL
      const ogUrl = await routePage.locator('meta[property="og:url"]').getAttribute("content");
      if (ogUrl !== expectedCanonical) {
        console.error(`FAIL: ${route} og:url is "${ogUrl}", expected "${expectedCanonical}"`);
        failures++;
      }

      // Single H1
      const h1Count = await routePage.locator("h1").count();
      if (h1Count !== 1) {
        console.error(`FAIL: ${route} has ${h1Count} H1 tags (expected exactly 1)`);
        failures++;
      }

      // Title & Meta Description
      const title = await routePage.title();
      const description = await routePage
        .locator('meta[name="description"]')
        .getAttribute("content");
      if (!title || title.length < 10) {
        console.error(`FAIL: ${route} has missing or thin title: "${title}"`);
        failures++;
      }
      if (!description || description.length < 20) {
        console.error(`FAIL: ${route} has missing or thin description: "${description}"`);
        failures++;
      }

      auditedCount++;
    } catch (err: any) {
      console.error(`FAIL: Error auditing ${route}: ${err.message}`);
      failures++;
    } finally {
      await routePage.close();
    }
  }
  console.log(`Audited ${auditedCount}/${allIndexableRoutes.length} indexable routes.`);

  // 4. Verify admin route is noindex
  console.log("\n[4/4] Auditing /admin/login for noindex protection...");
  try {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "domcontentloaded" });
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
    if (!robotsMeta || !robotsMeta.includes("noindex")) {
      console.error(`FAIL: /admin/login robots meta is "${robotsMeta}" (expected noindex)`);
      failures++;
    } else {
      console.log("PASS: /admin/login is properly marked noindex.");
    }
  } catch (err: any) {
    console.error(`FAIL: Error auditing /admin/login: ${err.message}`);
    failures++;
  }

  await browser.close();

  console.log("\n==================================================");
  if (failures === 0) {
    console.log(
      `SEO AUDIT RESULT: PASSED! Zero errors across all ${allIndexableRoutes.length} routes.`,
    );
    process.exit(0);
  } else {
    console.error(`SEO AUDIT RESULT: FAILED with ${failures} errors.`);
    process.exit(1);
  }
}

runSeoAudit().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
