import { chromium } from "@playwright/test";
import { site } from "../src/data/site";
import { indexableHtmlRoutes } from "./seo-route-inventory";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

const allIndexableRoutes = new Set(indexableHtmlRoutes);

console.log("==================================================");
console.log("TBOS ACADEMY — INTERNAL LINK & ORPHAN CRAWLER");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Indexable inventory count: ${allIndexableRoutes.size}`);
console.log("==================================================");

async function runLinkAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const discoveredLinks = new Set<string>();
  const linkedFromMap = new Map<string, string[]>();
  const brokenLinks: { source: string; href: string; reason: string }[] = [];
  const crawlErrors: string[] = [];

  // Crawl all indexable pages to extract internal links
  for (const route of allIndexableRoutes) {
    try {
      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      if (!response || response.status() !== 200) {
        crawlErrors.push(`${route} returned HTTP ${response?.status() ?? "no response"}`);
        continue;
      }
      const hrefs = await page.$$eval("a[href]", (anchors) =>
        anchors.map((a) => a.getAttribute("href") || "").filter(Boolean),
      );

      for (const rawHref of hrefs) {
        // Strip hash
        const cleanHref = rawHref.split("#")[0].split("?")[0];
        if (!cleanHref) continue;

        // Normalize internal URLs
        let internalPath: string | null = null;
        if (cleanHref.startsWith("/")) {
          internalPath = cleanHref;
        } else if (cleanHref.startsWith(site.url)) {
          internalPath = cleanHref.replace(site.url, "");
        } else if (cleanHref.startsWith(BASE_URL)) {
          internalPath = cleanHref.replace(BASE_URL, "");
        }

        if (internalPath) {
          // Normalize trailing slash except root
          if (internalPath.length > 1 && internalPath.endsWith("/")) {
            internalPath = internalPath.slice(0, -1);
          }
          if (internalPath !== route) {
            discoveredLinks.add(internalPath);

            if (!linkedFromMap.has(internalPath)) {
              linkedFromMap.set(internalPath, []);
            }
            linkedFromMap.get(internalPath)!.push(route);
          }

          // Verify if it is an invalid internal link
          if (
            !allIndexableRoutes.has(internalPath) &&
            !internalPath.startsWith("/admin") &&
            !internalPath.startsWith("/api")
          ) {
            brokenLinks.push({
              source: route,
              href: rawHref,
              reason: `Route "${internalPath}" does not exist in indexable inventory`,
            });
          }
        }
      }
    } catch (err: any) {
      crawlErrors.push(`${route}: ${err.message}`);
    }
  }

  await browser.close();

  console.log("\n==================================================");
  console.log(`Discovered ${discoveredLinks.size} unique internal link destinations.`);

  // Check for orphan pages
  const orphanPages: string[] = [];
  for (const route of allIndexableRoutes) {
    if (route === "/") continue; // Root is entry point
    if (!discoveredLinks.has(route)) {
      orphanPages.push(route);
    }
  }

  let failed = false;

  if (crawlErrors.length > 0) {
    console.error(`\nFAIL: Could not crawl ${crawlErrors.length} indexable pages:`);
    crawlErrors.forEach((error) => console.error(` - ${error}`));
    failed = true;
  }

  if (brokenLinks.length > 0) {
    console.error(`\nFAIL: Found ${brokenLinks.length} broken internal links:`);
    brokenLinks
      .slice(0, 10)
      .forEach((b) => console.error(` - From ${b.source} -> ${b.href} (${b.reason})`));
    failed = true;
  } else {
    console.log("PASS: Zero broken internal links found!");
  }

  if (orphanPages.length > 0) {
    console.error(
      `\nFAIL: Found ${orphanPages.length} orphaned indexable pages (not linked from anywhere):`,
    );
    orphanPages.forEach((o) => console.error(` - ${o}`));
    failed = true;
  } else {
    console.log(
      `PASS: Zero orphaned indexable pages! All ${allIndexableRoutes.size} HTML pages are linked internally.`,
    );
  }

  console.log("==================================================");
  if (failed) {
    process.exit(1);
  } else {
    console.log("INTERNAL LINK AUDIT: PASSED");
    process.exit(0);
  }
}

runLinkAudit().catch((err) => {
  console.error("Fatal link audit error:", err);
  process.exit(1);
});
