import { test, expect } from "@playwright/test";
import { courses } from "../../src/data/courses";
import { courseCurriculumSources } from "../../src/data/courseCurriculumSources";
import { courseRoadmaps } from "../../src/data/courseRoadmaps";
import { specializations } from "../../src/data/specializations";
import { specializationRoadmaps } from "../../src/data/specializationRoadmaps";
import { liveOffers } from "../../src/data/liveOffers";
import { liveOfferCourseRoadmaps } from "../../src/data/liveOfferRoadmaps";

test.describe("Phase 13B Verified Curriculum Roadmaps", () => {
  test("1. Every catalog record has a complete structured roadmap", () => {
    expect(Object.keys(courseRoadmaps).sort()).toEqual(courses.map((course) => course.slug).sort());
    expect(Object.keys(courseCurriculumSources).sort()).toEqual(
      courses.map((course) => course.slug).sort(),
    );
    expect(Object.keys(specializationRoadmaps).sort()).toEqual(
      specializations.map((spec) => spec.slug).sort(),
    );
    expect(Object.keys(liveOfferCourseRoadmaps).sort()).toEqual(
      liveOffers.map((offer) => offer.slug).sort(),
    );

    for (const roadmap of Object.values(courseRoadmaps)) {
      expect(["30 days", "45 days", "60 days"]).toContain(roadmap.duration);
      expect(roadmap.classesPerWeek).toBe("3–4 classes/week");
      expect(roadmap.chapters.length).toBeGreaterThanOrEqual(5);
      expect(roadmap.capstoneProject.length).toBeGreaterThan(20);
      for (const chapter of roadmap.chapters) {
        expect(chapter.topics.length).toBeGreaterThanOrEqual(3);
        expect(chapter.guidedTask.length).toBeGreaterThan(15);
      }
    }

    const premiumSpecializations = new Set([
      "full-stack-developer",
      "data-analyst",
      "data-science",
      "ai-machine-learning",
    ]);

    for (const [slug, roadmap] of Object.entries(specializationRoadmaps)) {
      expect(roadmap.oneToOneFee).toBe(
        premiumSpecializations.has(slug) ? "PKR 20,000/month" : "PKR 15,000/month",
      );
      expect(roadmap.classesPerWeek).toBe("4 live online classes/week");
      expect(roadmap.pricingNote).toMatch(/recorded lectures.*multiple portfolio projects/i);
      expect(roadmap.courses.length).toBeGreaterThanOrEqual(5);
      expect(roadmap.capstoneProject.length).toBeGreaterThan(30);
      for (const course of roadmap.courses) {
        expect(course.chapters.length).toBeGreaterThanOrEqual(4);
        expect(course.project.length).toBeGreaterThan(20);
      }
    }

    for (const sources of Object.values(courseCurriculumSources)) {
      expect(sources.length).toBeGreaterThanOrEqual(1);
      for (const source of sources) {
        expect(source.label.length).toBeGreaterThan(5);
        expect(source.url).toMatch(/^https:\/\//);
      }
    }

    for (const roadmap of Object.values(liveOfferCourseRoadmaps)) {
      expect(roadmap.courses.length).toBeGreaterThanOrEqual(3);
      expect(roadmap.capstoneProject.length).toBeGreaterThan(30);
    }
  });

  test("2. Single-course pages show approved duration, chapters, guided tasks and capstone", async ({
    page,
  }) => {
    const cases = [
      { slug: "html5", duration: "30 days" },
      { slug: "pandas", duration: "45 days" },
      { slug: "python", duration: "60 days" },
    ];

    for (const item of cases) {
      await page.goto(`/courses/${item.slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByText(item.duration, { exact: true }).first()).toBeVisible();
      await expect(page.locator("[data-course-roadmap]")).toBeVisible();
      expect(await page.locator("[data-course-chapter]").count()).toBeGreaterThanOrEqual(5);
      await expect(page.getByText("Guided chapter task", { exact: true }).first()).toBeVisible();
      await expect(page.locator("[data-course-capstone]")).toBeVisible();
      await expect(page.locator("[data-curriculum-sources]")).toBeVisible();
      expect(await page.locator("[data-curriculum-sources] a").count()).toBeGreaterThanOrEqual(1);
    }
  });

  test("3. 100-Day Python is grouped into three complete courses with exact locked chapters", async ({
    page,
  }) => {
    await page.goto("/live-batches/100-days-complete-python", {
      waitUntil: "domcontentloaded",
    });

    const roadmap = page.locator("[data-program-roadmap]");
    await expect(roadmap).toBeVisible();
    await expect(roadmap.locator("[data-program-course]")).toHaveCount(3);
    await expect(roadmap.getByText("Complete Python Fundamentals", { exact: true })).toBeVisible();
    await expect(
      roadmap.getByText("Complete Object-Oriented Python", { exact: true }),
    ).toBeVisible();
    await expect(roadmap.getByText("Advanced Python Language", { exact: true })).toBeVisible();
    await expect(roadmap.getByText("Advanced Python Object Model", { exact: true })).toBeVisible();
    await expect(roadmap.locator("[data-program-capstone]")).toBeVisible();
  });

  test("4. Data Analyst live batch reflects the approved six-course instructor roadmap", async ({
    page,
  }) => {
    await page.goto("/live-batches/python-data-analysis-research-ai", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("h1")).toContainText("Data Analyst Professional Program");
    const roadmap = page.locator("[data-program-roadmap]");
    await expect(roadmap.locator("[data-program-course]")).toHaveCount(6);
    await expect(roadmap.getByText("MySQL & Business SQL", { exact: true })).toBeVisible();
    await expect(
      roadmap.getByText("Power BI & Executive Reporting", { exact: true }),
    ).toBeVisible();
    await expect(roadmap.getByText(/Python \+ MySQL \+ Power BI workflow/i)).toBeVisible();
  });

  test("5. Specializations expose included courses, projects, capstone and fixed one-to-one pricing", async ({
    page,
  }) => {
    await page.goto("/specializations/data-analyst", { waitUntil: "domcontentloaded" });

    const roadmap = page.locator("[data-program-roadmap]");
    await expect(roadmap).toBeVisible();
    expect(await roadmap.locator("[data-program-course]").count()).toBeGreaterThanOrEqual(5);
    await expect(
      roadmap.getByText("Power BI & Executive Reporting", { exact: true }),
    ).toBeVisible();
    await expect(roadmap.getByText("Course project", { exact: true }).first()).toBeVisible();
    await expect(roadmap.locator("[data-program-capstone]")).toBeVisible();
    await expect(page.getByText("PKR 20,000/month", { exact: true })).toBeVisible();
    await expect(page.getByText(/4 live online classes\/week/i).first()).toBeVisible();
    await expect(page.getByText(/recorded lectures.*multiple portfolio projects/i)).toBeVisible();
  });

  test("6. Deep curriculum pages remain responsive at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const routes = [
      "/courses/python",
      "/specializations/full-stack-developer",
      "/live-batches/100-days-complete-python",
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasOverflow, `Horizontal overflow detected on ${route}`).toBe(false);
    }
  });

  test("7. Secondary hero actions remain readable on dark backgrounds", async ({ page }) => {
    const routes = [
      "/courses/css3",
      "/specializations/full-stack-developer",
      "/tutoring/mathematics",
      "/live-batches/100-days-complete-python",
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const cta = page.locator("[data-hero-secondary-cta]").first();
      await expect(cta).toBeVisible();
      await expect(cta).toHaveClass(/text-primary-foreground/);
      await expect(cta).toHaveClass(/bg-primary-foreground\/5/);
    }
  });
});
