import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __tbosFbqCalls?: unknown[][];
    fbq?: (...args: unknown[]) => void;
  }
}

const pixelId = (process.env.VITE_META_PIXEL_ID || "").trim();

async function installFbqSpy(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__tbosFbqCalls = [];
    window.fbq = (...args: unknown[]) => {
      window.__tbosFbqCalls?.push(args);
    };
  });
}

test.describe("Phase 11 Meta Ads launch readiness", () => {
  test("ad-critical pages expose absolute social metadata and canonical URLs", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://techbuiltos.online/",
    );
    await expect(page.locator('meta[property="og:image"]').last()).toHaveAttribute(
      "content",
      /^https:\/\/techbuiltos\.online\//,
    );
    await expect(page.locator('meta[name="twitter:card"]').last()).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);

    await page.goto("/live-batches/python-young-developers", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://techbuiltos.online/live-batches/python-young-developers",
    );
    await expect(page.locator('meta[property="og:image"]').last()).toHaveAttribute(
      "content",
      /^https:\/\/techbuiltos\.online\//,
    );
  });

  test("UTM attribution is preserved into a successful contact submission source", async ({
    page,
  }) => {
    let submittedBody: Record<string, unknown> | undefined;

    await page.route("**/api/admissions", async (route) => {
      submittedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, referenceId: "TBOS-MOCK-ATTRIBUTION" }),
      });
    });

    if (pixelId) await installFbqSpy(page);

    await page.goto(
      "/contact?utm_source=facebook&utm_medium=paid_social&utm_campaign=python_launch&utm_content=creative_a",
      { waitUntil: "domcontentloaded" },
    );

    await page.locator("#c-name").fill("TBOS Attribution Check");
    await page.locator("#c-email").fill("tbos-attribution@example.com");
    await page.locator("#c-wa").fill("+92 300 0000000");
    await page.locator("#c-cat").selectOption("Course enquiry");
    await page.locator("#c-msg").fill("Non-destructive attribution verification.");
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByRole("heading", { name: "Message received!" })).toBeVisible();

    const sourcePage = String(submittedBody?.sourcePage || "");
    expect(sourcePage).toContain("Contact Page");
    expect(sourcePage).toContain("s=facebook");
    expect(sourcePage).toContain("m=paid_social");
    expect(sourcePage).toContain("c=python_launch");
    expect(sourcePage).toContain("v=creative_a");

    if (pixelId) {
      const calls = await page.evaluate(() => window.__tbosFbqCalls || []);
      expect(
        calls.some(
          (call) =>
            call[0] === "track" &&
            call[1] === "Lead" &&
            (call[2] as Record<string, unknown> | undefined)?.lead_type === "contact",
        ),
      ).toBeTruthy();
    }
  });

  test("configured Meta Pixel emits init, PageView, and live-offer ViewContent", async ({
    page,
  }) => {
    test.skip(!pixelId, "VITE_META_PIXEL_ID is not configured");

    await installFbqSpy(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    let calls = await page.evaluate(() => window.__tbosFbqCalls || []);
    expect(calls.some((call) => call[0] === "init" && call[1] === pixelId)).toBeTruthy();
    expect(calls.some((call) => call[0] === "track" && call[1] === "PageView")).toBeTruthy();

    await page.goto("/live-batches/python-young-developers", {
      waitUntil: "domcontentloaded",
    });

    calls = await page.evaluate(() => window.__tbosFbqCalls || []);
    expect(
      calls.some(
        (call) =>
          call[0] === "track" &&
          call[1] === "ViewContent" &&
          (call[2] as Record<string, unknown> | undefined)?.content_name ===
            "Python Young Developers",
      ),
    ).toBeTruthy();
  });
});
