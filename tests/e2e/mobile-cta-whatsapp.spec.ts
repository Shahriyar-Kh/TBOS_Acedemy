import { test, expect } from "@playwright/test";
import { liveOffers } from "../../src/data/liveOffers";
import { specializations } from "../../src/data/specializations";
import { courses } from "../../src/data/courses";
import { tutoringSubjects } from "../../src/data/tutoring";
import {
  getLiveBatchWhatsAppMessage,
  getSpecializationWhatsAppMessage,
  getCourseWhatsAppMessage,
  getTutoringWhatsAppMessage,
  getRouteWhatsAppMessage,
  getRouteWhatsAppLink,
} from "../../src/lib/whatsapp";

const mobileWidths = [320, 360, 375, 390, 412, 430];
const desktopWidths = [768, 1024, 1280, 1440];

test.describe("Mobile CTA & Program-Specific WhatsApp Context", () => {
  // =========================================================================
  // 1. Program-Specific Message Content & Encoding Unit Checks
  // =========================================================================

  test("1. 100 Days Complete Python generates exact requested WhatsApp message and URL", () => {
    const offer = liveOffers.find((o) => o.slug === "100-days-complete-python");
    expect(offer).toBeDefined();
    if (!offer) return;

    const message = getLiveBatchWhatsAppMessage(offer);
    const expected = [
      "Hello TechBuilt Open School, I’m interested in the 100 Days Complete Python Live Batch (PKR 5,000/month). Please share the class schedule, admission process, and Free Demo details.",
      "",
      "Program: 100 Days Complete Python",
      "Page: https://techbuiltos.online/live-batches/100-days-complete-python",
    ].join("\n");

    expect(message).toBe(expected);

    const link = getRouteWhatsAppLink("/live-batches/100-days-complete-python");
    expect(link).toContain("https://wa.me/923295448590?text=");
    expect(link).toContain(encodeURIComponent("100 Days Complete Python Live Batch (PKR 5,000/month)"));
    expect(link).toContain(encodeURIComponent("Page: https://techbuiltos.online/live-batches/100-days-complete-python"));
  });

  test("2. All live batches generate dynamic program title, fee, and canonical URL", () => {
    for (const offer of liveOffers) {
      const message = getLiveBatchWhatsAppMessage(offer);
      expect(message).toContain(offer.title);
      expect(message).toContain(offer.currency);
      expect(message).toContain(offer.billingPeriod);
      expect(message).toContain(`https://techbuiltos.online/live-batches/${offer.slug}`);
      expect(message).toContain("Please share the class schedule, admission process, and Free Demo details.");
    }
  });

  test("3. Specializations generate duration, class schedule, admission process, and demo message with fee", () => {
    for (const spec of specializations) {
      const message = getSpecializationWhatsAppMessage(spec);
      expect(message).toContain(spec.title);
      expect(message).toContain("PKR");
      expect(message).toContain("Please share the duration, class schedule, admission process, and demo details.");
      expect(message).toContain(`https://techbuiltos.online/specializations/${spec.slug}`);
    }
  });

  test("4. Single courses generate roadmap, duration, class schedule, and enrollment message", () => {
    const sampleCourses = courses.slice(0, 5);
    for (const course of sampleCourses) {
      const message = getCourseWhatsAppMessage(course);
      expect(message).toContain(course.title);
      expect(message).toContain("Please share the roadmap, duration, class schedule, and enrollment details.");
      expect(message).toContain(`https://techbuiltos.online/courses/${course.slug}`);
    }
  });

  test("5. Tutoring subjects generate curriculum, schedule, and Free Demo message", () => {
    for (const subject of tutoringSubjects) {
      const message = getTutoringWhatsAppMessage(subject);
      expect(message).toContain(subject.title);
      expect(message).toContain("Please share the curriculum, class schedule, admission process, and Free Demo details.");
      expect(message).toContain(`https://techbuiltos.online/tutoring/${subject.slug}`);
    }
  });

  test("6. General routes fallback to concise generic message", () => {
    const genericMsg = getRouteWhatsAppMessage("/");
    expect(genericMsg).toContain("Hello TechBuilt Open School");
    expect(genericMsg).toContain("courses, live batches, tutoring, or Free Demo");
  });

  // =========================================================================
  // 2. Mobile Viewport Sticky CTA & WhatsApp Floating Button Visibility
  // =========================================================================

  for (const width of mobileWidths) {
    test(`7. Mobile width ${width}px: Floating WhatsApp is hidden and sticky CTA is visible on 100 Days Python`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/live-batches/100-days-complete-python", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const stickyCta = page.locator('[data-testid="live-program-mobile-cta"]');
      await expect(stickyCta).toBeVisible();

      // Floating WhatsApp button MUST be hidden on mobile (< 768px)
      const floatingBtn = page.locator('[data-testid="floating-whatsapp-btn"]');
      await expect(floatingBtn).toBeHidden();

      // Demo and Apply Now buttons must be visible and tappable
      const demoBtn = stickyCta.getByRole("link", { name: /demo/i });
      const applyBtn = stickyCta.getByRole("link", { name: /apply now/i });

      await expect(demoBtn).toBeVisible();
      await expect(applyBtn).toBeVisible();

      // Verify no horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `Horizontal overflow at ${width}px`).toBeFalsy();
    });
  }

  test("8. Mobile interactive click: Apply Now and Demo navigate cleanly without obstruction", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/live-batches/100-days-complete-python", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const stickyCta = page.locator('[data-testid="live-program-mobile-cta"]');
    const applyBtn = stickyCta.getByRole("link", { name: /apply now/i });
    await applyBtn.click();

    await expect(page).toHaveURL(/\/apply\?/);
    await expect(page).toHaveURL(/type=Live\+Group\+Offer/);
    await expect(page).toHaveURL(/selected=100\+Days\+Complete\+Python/);
  });

  test("9. Desktop: Floating WhatsApp button is visible and carries program-specific message", async ({
    page,
  }) => {
    for (const width of desktopWidths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/live-batches/100-days-complete-python", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const floatingBtn = page.locator('[data-testid="floating-whatsapp-btn"]');
      await expect(floatingBtn).toBeVisible();

      const href = await floatingBtn.getAttribute("href");
      expect(href).toContain("https://wa.me/923295448590?text=");
      expect(href).toContain(encodeURIComponent("100 Days Complete Python Live Batch"));
    }
  });

  test("10. On-page tuition card WhatsApp inquiry contains the program-specific message", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/live-batches/100-days-complete-python", { waitUntil: "domcontentloaded" });

    const inquiryLink = page.locator('a[href*="wa.me"]').filter({ hasText: /Ask questions on WhatsApp/i }).first();
    await expect(inquiryLink).toBeVisible();
    const href = await inquiryLink.getAttribute("href");
    expect(href).toContain(encodeURIComponent("100 Days Complete Python Live Batch (PKR 5,000/month)"));
    expect(href).toContain(encodeURIComponent("Page: https://techbuiltos.online/live-batches/100-days-complete-python"));
  });

  test("11. Course detail page floating button carries single-course message", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/courses/python", { waitUntil: "domcontentloaded" });

    const floatingBtn = page.locator('[data-testid="floating-whatsapp-btn"]');
    await expect(floatingBtn).toBeVisible();
    const href = await floatingBtn.getAttribute("href");
    expect(href).toContain(encodeURIComponent("Python Course"));
    expect(href).toContain(encodeURIComponent("roadmap, duration, class schedule, and enrollment details"));
  });

  test("12. Specialization detail page floating button carries specialization message with fee", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/specializations/full-stack-developer", { waitUntil: "domcontentloaded" });

    const floatingBtn = page.locator('[data-testid="floating-whatsapp-btn"]');
    await expect(floatingBtn).toBeVisible();
    const href = await floatingBtn.getAttribute("href");
    expect(href).toContain(encodeURIComponent("Full-Stack Developer Specialization Track (PKR 20,000/month)"));
    expect(href).toContain(encodeURIComponent("duration, class schedule, admission process, and demo details"));
  });
});
