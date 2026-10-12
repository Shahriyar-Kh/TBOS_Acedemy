import { chromium } from "@playwright/test";
import { articles } from "../src/data/articles";
import { site } from "../src/data/site";
import { indexableHtmlRoutes } from "./seo-route-inventory";

const BASE_URL = (process.env.TEST_URL || site.url).trim();

type JsonLd = Record<string, unknown>;

function nestedSchemas(value: unknown): JsonLd[] {
  if (Array.isArray(value)) return value.flatMap(nestedSchemas);
  if (!value || typeof value !== "object") return [];

  const object = value as JsonLd;
  const graph = Array.isArray(object["@graph"]) ? nestedSchemas(object["@graph"]) : [];
  return [object, ...graph];
}

function hasSchemaType(schemas: JsonLd[], expectedType: string) {
  return schemas.some((schema) => {
    const schemaType = schema["@type"];
    return (
      schemaType === expectedType ||
      (Array.isArray(schemaType) && schemaType.includes(expectedType))
    );
  });
}

function hasForbiddenReviewMarkup(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenReviewMarkup);
  if (!value || typeof value !== "object") return false;

  const object = value as JsonLd;
  if ("aggregateRating" in object || "review" in object || "reviewCount" in object) return true;
  const schemaType = object["@type"];
  if (schemaType === "Review" || (Array.isArray(schemaType) && schemaType.includes("Review"))) {
    return true;
  }

  return Object.values(object).some(hasForbiddenReviewMarkup);
}

console.log("==================================================");
console.log("TBOS ACADEMY — STRUCTURED DATA & JSON-LD AUDIT");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Indexable HTML routes: ${indexableHtmlRoutes.length}`);
console.log("==================================================");

async function runStructuredDataAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  let errors = 0;
  let parsedSchemaBlocks = 0;

  for (const route of indexableHtmlRoutes) {
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

      const rawBlocks = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
        scripts.map((script) => script.textContent || ""),
      );
      if (rawBlocks.length === 0) {
        console.error(`FAIL: ${route} has no JSON-LD`);
        errors++;
        continue;
      }

      const parsedBlocks: JsonLd[] = [];
      for (const raw of rawBlocks) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          parsedBlocks.push(...nestedSchemas(parsed));
          parsedSchemaBlocks++;
          if (hasForbiddenReviewMarkup(parsed)) {
            console.error(`FAIL: ${route} contains unverified review or rating markup`);
            errors++;
          }
        } catch (error) {
          console.error(`FAIL: ${route} contains malformed JSON-LD: ${(error as Error).message}`);
          errors++;
        }
      }

      if (!hasSchemaType(parsedBlocks, "EducationalOrganization")) {
        console.error(`FAIL: ${route} is missing the global EducationalOrganization schema`);
        errors++;
      }

      const isProgramDetail = /^\/(courses|specializations|live-batches)\/.+/.test(route);
      const isBreadcrumbDetail = /^\/(courses|specializations|live-batches|tutoring)\/.+/.test(
        route,
      );
      const isArticle = route.startsWith("/blog/");

      if (isProgramDetail && !hasSchemaType(parsedBlocks, "Course")) {
        console.error(`FAIL: ${route} is missing Course schema`);
        errors++;
      }
      if ((isBreadcrumbDetail || isArticle) && !hasSchemaType(parsedBlocks, "BreadcrumbList")) {
        console.error(`FAIL: ${route} is missing BreadcrumbList schema`);
        errors++;
      }
      if (isArticle && !hasSchemaType(parsedBlocks, "Article")) {
        console.error(`FAIL: ${route} is missing Article schema`);
        errors++;
      }

      const faqSchemas = parsedBlocks.filter((schema) => schema["@type"] === "FAQPage");
      if (isArticle && faqSchemas.length !== 1) {
        console.error(`FAIL: ${route} must contain exactly one FAQPage schema`);
        errors++;
      }

      if (faqSchemas.length > 0) {
        const visibleText = await page.locator("main").innerText();
        for (const faqSchema of faqSchemas) {
          const mainEntity = Array.isArray(faqSchema.mainEntity) ? faqSchema.mainEntity : [];
          if (mainEntity.length === 0) {
            console.error(`FAIL: ${route} has an empty FAQPage schema`);
            errors++;
          }
          for (const entity of mainEntity) {
            const name =
              entity && typeof entity === "object" && typeof (entity as JsonLd).name === "string"
                ? ((entity as JsonLd).name as string)
                : "";
            if (!name || !visibleText.includes(name)) {
              console.error(`FAIL: ${route} FAQ schema question is not visibly rendered: ${name}`);
              errors++;
            }
          }
        }
      }
    } catch (error) {
      console.error(`FAIL: Could not audit ${route}: ${(error as Error).message}`);
      errors++;
    }
  }

  for (const article of articles) {
    const route = `/blog/${article.slug}`;
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    const schemas = (
      await page.$$eval('script[type="application/ld+json"]', (scripts) =>
        scripts.map((script) => JSON.parse(script.textContent || "{}")),
      )
    ).flatMap(nestedSchemas);
    const articleSchema = schemas.find((schema) => schema["@type"] === "Article");
    if (articleSchema?.headline !== article.title || articleSchema?.url !== `${site.url}${route}`) {
      console.error(`FAIL: ${route} Article identity does not match visible canonical content`);
      errors++;
    }
  }

  await browser.close();

  console.log("\n==================================================");
  if (errors === 0) {
    console.log(
      `STRUCTURED DATA AUDIT: PASSED (${indexableHtmlRoutes.length} HTML routes, ${parsedSchemaBlocks} valid JSON-LD blocks)`,
    );
    return;
  }

  console.error(`STRUCTURED DATA AUDIT: FAILED with ${errors} issue(s).`);
  process.exitCode = 1;
}

runStructuredDataAudit().catch((error) => {
  console.error("Fatal structured-data audit error:", error);
  process.exitCode = 1;
});
