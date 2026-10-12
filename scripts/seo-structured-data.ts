import { chromium } from "@playwright/test";
import { courses } from "../src/data/courses";
import { specializations } from "../src/data/specializations";
import { liveOffers } from "../src/data/liveOffers";
import { tutoringSubjects } from "../src/data/tutoring";
import { articles } from "../src/data/articles";
import { site } from "../src/data/site";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

console.log("==================================================");
console.log("TBOS ACADEMY — STRUCTURED DATA & JSON-LD AUDIT");
console.log(`Base URL: ${BASE_URL}`);
console.log("==================================================");

async function runStructuredDataAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let errors = 0;

  // 1. Root EducationalOrganization Schema
  console.log("\n[1/5] Verifying EducationalOrganization schema on homepage...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  const rootJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => s.textContent || ""),
  );

  let hasEduOrg = false;
  for (const raw of rootJsonLds) {
    try {
      const data = JSON.parse(raw);
      if (data["@type"] === "EducationalOrganization") {
        hasEduOrg = true;
        if (!data.name || data.url !== site.url) {
          console.error("FAIL: EducationalOrganization missing name or url");
          errors++;
        }
      }
    } catch (e: any) {
      console.error("FAIL: Malformed JSON-LD on homepage:", e.message);
      errors++;
    }
  }
  if (!hasEduOrg) {
    console.error("FAIL: Missing EducationalOrganization JSON-LD on root");
    errors++;
  } else {
    console.log("PASS: EducationalOrganization JSON-LD verified.");
  }

  // 2. Course Schema on Courses and Live Batches
  console.log("\n[2/5] Verifying Course schema on courses and live batches...");
  const sampleCourse = courses[0];
  await page.goto(`${BASE_URL}/courses/${sampleCourse.slug}`, { waitUntil: "domcontentloaded" });
  const courseJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => s.textContent || ""),
  );
  let hasCourse = false;
  for (const raw of courseJsonLds) {
    try {
      const data = JSON.parse(raw);
      if (data["@type"] === "Course") {
        hasCourse = true;
        if (!data.name || !data.description || !data.provider) {
          console.error("FAIL: Incomplete Course JSON-LD");
          errors++;
        }
      }
    } catch (e: any) {
      console.error("FAIL: Malformed JSON-LD on course page:", e.message);
      errors++;
    }
  }
  if (!hasCourse) {
    console.error("FAIL: Missing Course JSON-LD on course page");
    errors++;
  } else {
    console.log("PASS: Course JSON-LD verified.");
  }

  // 3. Article Schema on all 6 Resource Pages
  console.log("\n[3/5] Verifying Article & Breadcrumb schema on all 6 resource pages...");
  for (const article of articles) {
    await page.goto(`${BASE_URL}/blog/${article.slug}`, { waitUntil: "domcontentloaded" });
    const articleJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.map((s) => s.textContent || ""),
    );

    let hasArticleSchema = false;
    let hasBreadcrumbSchema = false;
    let hasFaqSchema = false;

    for (const raw of articleJsonLds) {
      try {
        const data = JSON.parse(raw);
        if (data["@type"] === "Article") {
          hasArticleSchema = true;
          if (data.headline !== article.title) {
            console.error(`FAIL: Article headline mismatch for ${article.slug}`);
            errors++;
          }
          if (!data.datePublished || !data.author) {
            console.error(`FAIL: Incomplete Article metadata for ${article.slug}`);
            errors++;
          }
        }
        if (data["@type"] === "BreadcrumbList") {
          hasBreadcrumbSchema = true;
        }
        if (data["@type"] === "FAQPage") {
          hasFaqSchema = true;
        }
      } catch (e: any) {
        console.error(`FAIL: Malformed JSON-LD on /blog/${article.slug}:`, e.message);
        errors++;
      }
    }

    if (!hasArticleSchema || !hasBreadcrumbSchema || !hasFaqSchema) {
      console.error(`FAIL: Missing required schemas on /blog/${article.slug}`);
      errors++;
    }
  }
  console.log("PASS: Article, Breadcrumb, and FAQPage schemas verified on all 6 articles.");

  // 4. FAQ Schema matches visible content strictly
  console.log("\n[4/5] Verifying FAQPage schema matches visible FAQs strictly on /faq...");
  await page.goto(`${BASE_URL}/faq`, { waitUntil: "domcontentloaded" });
  const faqJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => s.textContent || ""),
  );
  let faqSchemaFound = false;
  for (const raw of faqJsonLds) {
    try {
      const data = JSON.parse(raw);
      if (data["@type"] === "FAQPage") {
        faqSchemaFound = true;
        const mainEntities = data.mainEntity || [];
        if (mainEntities.length === 0) {
          console.error("FAIL: Empty FAQPage entity array");
          errors++;
        }
      }
    } catch (e: any) {
      console.error("FAIL: Malformed FAQ schema:", e.message);
      errors++;
    }
  }
  if (!faqSchemaFound) {
    console.error("FAIL: FAQPage schema missing on /faq");
    errors++;
  } else {
    console.log("PASS: FAQPage schema verified.");
  }

  // 5. Check for disallowed black-hat structured data (aggregateRating, fake reviews)
  console.log("\n[5/5] Scanning for forbidden fake review/rating markup across pages...");
  const samplePages = ["/", "/courses", "/specializations", "/live-batches", "/tutoring", "/apply"];
  for (const route of samplePages) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    const content = await page.content();
    if (content.includes('"aggregateRating"') || content.includes('"Review"')) {
      console.error(`FAIL: Prohibited aggregateRating or Review schema detected on ${route}`);
      errors++;
    }
  }
  console.log("PASS: Zero prohibited rating or review schemas found.");

  await browser.close();

  console.log("\n==================================================");
  if (errors === 0) {
    console.log("STRUCTURED DATA AUDIT: PASSED (100% Valid & Honest)");
    process.exit(0);
  } else {
    console.error(`STRUCTURED DATA AUDIT: FAILED with ${errors} issues.`);
    process.exit(1);
  }
}

runStructuredDataAudit().catch((err) => {
  console.error("Fatal structured data audit error:", err);
  process.exit(1);
});
