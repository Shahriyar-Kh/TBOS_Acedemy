import { chromium } from "@playwright/test";
import { auditedPublicEndpoints } from "./seo-route-inventory";

const BASE_URL = (process.env.TEST_URL || "https://techbuiltos.online").trim();

const allRoutes = auditedPublicEndpoints;

console.log(`Starting real-browser Chromium audit against ${BASE_URL}`);
console.log(`Total routes to audit: ${allRoutes.length}`);

interface AuditResult {
  route: string;
  status: number | null;
  pageErrors: string[];
  crashDetected: boolean;
  success: boolean;
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const results: AuditResult[] = [];
  let failures = 0;

  for (let i = 0; i < allRoutes.length; i++) {
    const route = allRoutes[i];
    const fullUrl = `${BASE_URL}${route}`;
    const page = await context.newPage();

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    let status: number | null = null;
    let crashDetected = false;

    try {
      const response = await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      status = response ? response.status() : null;

      // Allow 1.5 seconds for hydration and client-side effects
      await page.waitForTimeout(1500);

      // Check for TanStack root ErrorComponent text
      const bodyText = await page.innerText("body");
      if (
        bodyText.includes("This page didn't load") ||
        bodyText.includes("Something went wrong on our end")
      ) {
        crashDetected = true;
      }
    } catch (err: any) {
      pageErrors.push(`Navigation error: ${err.message}`);
    } finally {
      await page.close();
    }

    const success = (status === 200 || status === 304) && !crashDetected && pageErrors.length === 0;

    results.push({
      route,
      status,
      pageErrors,
      crashDetected,
      success,
    });

    if (!success) {
      failures++;
      console.log(
        `❌ [${i + 1}/${allRoutes.length}] FAIL: ${route} (status: ${status}, crash: ${crashDetected}, errors: ${pageErrors.join(" | ")})`,
      );
    } else {
      console.log(`✅ [${i + 1}/${allRoutes.length}] PASS: ${route} (status: ${status})`);
    }
  }

  await browser.close();

  console.log("\n================ AUDIT SUMMARY ================");
  console.log(`Total audited: ${allRoutes.length}`);
  console.log(`Passed: ${allRoutes.length - failures}`);
  console.log(`Failed: ${failures}`);

  if (failures > 0) {
    console.error(`\nFAILED ROUTES:`);
    for (const r of results.filter((r) => !r.success)) {
      console.error(
        `- ${r.route}: status=${r.status}, crash=${r.crashDetected}, errors=${r.pageErrors.join(", ")}`,
      );
    }
    process.exit(1);
  } else {
    console.log(
      `\n🎉 100% OF ALL ${allRoutes.length} ROUTES PASSED REAL-BROWSER AUDIT WITH ZERO ERRORS!`,
    );
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit runner error:", err);
  process.exit(1);
});
