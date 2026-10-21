import { test, expect } from "@playwright/test";

test("Full-Stack Developer is React + Django without TypeScript or Next.js", async ({ page }) => {
  await page.goto("/specializations/full-stack-developer", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1")).toContainText("Full-Stack Developer");
  const roadmap = page.locator("[data-program-roadmap]");
  await expect(roadmap).toBeVisible();
  await expect(roadmap.locator("[data-program-course]")).toHaveCount(10);

  await expect(roadmap).toContainText("React.js");
  await expect(roadmap).toContainText("Django");
  await expect(roadmap).toContainText("PostgreSQL");
  await expect(roadmap).toContainText("React.js frontend integration with secure Django REST APIs");
  await expect(roadmap).not.toContainText(/TypeScript|Next\.js/i);

  await expect(page.locator("main")).toContainText("8 months");
  await expect(page.locator("main")).toContainText("PKR 8,000/month");
  await expect(page.locator("main")).toContainText("PKR 20,000/month");
  await expect(page.locator('a[href*="/apply"]').first()).toBeVisible();
});
