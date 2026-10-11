import { chromium } from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";

const artifactDir = "C:\\Users\\Shary\\.gemini\\antigravity\\brain\\155067ad-e51d-473a-b1f6-78fc50714afc";
const baseUrl = process.env.TEST_URL || "http://127.0.0.1:4173";

const targets = [
  { path: "/courses/css3", name: "course_css3" },
  { path: "/courses/python", name: "course_python" },
  { path: "/specializations/full-stack-developer", name: "spec_full_stack" },
  { path: "/specializations/data-analyst", name: "spec_data_analyst" },
  { path: "/specializations/data-science", name: "spec_data_science" },
  { path: "/specializations/frontend-developer", name: "spec_frontend_dev" },
];

async function run() {
  const browser = await chromium.launch();

  for (const target of targets) {
    // Desktop 1440x900
    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await desktopPage.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(500);
    const desktopPath = path.join(artifactDir, `${target.name}_desktop_1440.png`);
    await desktopPage.screenshot({ path: desktopPath, fullPage: false });
    console.log(`Saved desktop: ${desktopPath}`);
    await desktopPage.close();

    // Mobile 390x844
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    await mobilePage.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(500);
    const mobilePath = path.join(artifactDir, `${target.name}_mobile_390.png`);
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    console.log(`Saved mobile: ${mobilePath}`);
    await mobilePage.close();
  }

  // Detailed Component Screenshots
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // CSS3 Roadmap
  await page.goto(`${baseUrl}/courses/css3`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 400) {
      window.scrollTo(0, i);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(600);
  const cssRoadmap = page.locator("[data-course-roadmap]");
  if (await cssRoadmap.isVisible()) {
    await cssRoadmap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await cssRoadmap.screenshot({
      path: path.join(artifactDir, "course_css3_roadmap_detail.png"),
    });
    console.log("Saved course_css3_roadmap_detail.png");
  }

  // Full Stack Journey
  await page.goto(`${baseUrl}/specializations/full-stack-developer`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 400) {
      window.scrollTo(0, i);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(600);
  const specJourney = page.locator("[data-specialization-journey]");
  if (await specJourney.isVisible()) {
    await specJourney.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await specJourney.screenshot({
      path: path.join(artifactDir, "spec_full_stack_journey_detail.png"),
    });
    console.log("Saved spec_full_stack_journey_detail.png");
  }

  await page.close();

  await browser.close();
  console.log("Screenshot capture complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

