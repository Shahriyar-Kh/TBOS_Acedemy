import { test, expect } from "@playwright/test";

test.describe("Frontend Developer approved React pathway", () => {
  test("shows the 26-week seven-stage React roadmap and both deployable capstones", async ({ page }) => {
    await page.goto("/specializations/frontend-developer", { waitUntil: "domcontentloaded" });

    const roadmap = page.locator("[data-program-roadmap]");
    await expect(roadmap).toBeVisible();
    await expect(roadmap.locator("[data-program-course]")).toHaveCount(7);

    await expect(roadmap).toContainText("HTML5");
    await expect(roadmap).toContainText("CSS3");
    await expect(roadmap).toContainText("JavaScript");
    await expect(roadmap).toContainText("React.js");
    await expect(roadmap).toContainText("REST API");
    await expect(roadmap).toContainText("Vercel");
    await expect(roadmap).toContainText("Capstone 1");
    await expect(roadmap).toContainText("Capstone 2");
    await expect(roadmap).toContainText("Two Portfolio Capstones");

    await expect(roadmap).not.toContainText(/Next\.js|TypeScript|Bootstrap/i);
    await expect(page.locator("main")).toContainText("PKR 6,000/month");
    await expect(page.locator("main")).toContainText("PKR 15,000/month");
  });
});
