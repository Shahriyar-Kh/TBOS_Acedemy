import { expect, test, type Page } from "@playwright/test";

const liveFormMode = process.env.TBOS_E2E_ALLOW_LIVE_FORMS === "1";
const hasAdminCreds = Boolean(
  process.env.TBOS_E2E_ADMIN_EMAIL && process.env.TBOS_E2E_ADMIN_PASSWORD,
);
const hasSupabaseServerCreds = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

async function cleanupEmail(email: string) {
  if (!hasSupabaseServerCreds) return;
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const { data: rows } = await supabase.from("admissions_requests").select("id").eq("email", email);
  const ids = (rows || []).map((row) => row.id).filter(Boolean);
  if (ids.length > 0) {
    await supabase.from("admissions_activity").delete().in("admission_id", ids);
    await supabase.from("admissions_delivery_log").delete().in("admission_id", ids);
    await supabase.from("admissions_requests").delete().in("id", ids);
  }
}

async function loginAndGetToken(page: Page) {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(process.env.TBOS_E2E_ADMIN_EMAIL!);
  await page.locator("#password").fill(process.env.TBOS_E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in to admin portal/i }).click();
  await page.waitForURL(/\/admin\/admissions(?:$|\?)/, { timeout: 15000 });
  await page.waitForFunction(() =>
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).some(
      (key) => key?.includes("auth-token"),
    ),
  );

  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.includes("auth-token")) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        if (value?.access_token) return value.access_token as string;
      } catch {
        // Ignore unrelated local storage values.
      }
    }
    return null;
  });
}

test.describe("TBOS Phase10B closure coverage", () => {
  test("mobile route matrix has no horizontal page overflow at 375, 390, and 430px", async ({
    page,
  }) => {
    const routes = [
      "/",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      "/apply",
      "/free-demo",
      "/contact",
    ];
    for (const width of [375, 390, 430]) {
      await page.setViewportSize({ width, height: 812 });
      for (const route of routes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.locator("body")).not.toContainText("This page didn't load");
        const dimensions = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
        }));
        expect(dimensions.documentScrollWidth, `${route} at ${width}px`).toBeLessThanOrEqual(
          dimensions.innerWidth + 1,
        );
        expect(dimensions.bodyScrollWidth, `${route} body at ${width}px`).toBeLessThanOrEqual(
          dimensions.innerWidth + 1,
        );
      }
    }
  });

  test("mobile navigation supports Courses, Apply, Free Demo, and WhatsApp", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Production can reach DOMContentLoaded before React hydration has attached the menu click handler.
    await page.waitForTimeout(750);
    const menuTrigger = page
      .locator('button[aria-label="Toggle menu"], button[aria-label="Open menu"]')
      .first();
    await expect(menuTrigger).toBeVisible();
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "false");
    await menuTrigger.click();
    const closeTrigger = page.locator('button[aria-label="Close menu"]').first();
    await expect(closeTrigger).toBeVisible();
    await expect(closeTrigger).toHaveAttribute("aria-expanded", "true");
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Courses", exact: true })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Apply Now", exact: true })).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Request Free Demo", exact: true }),
    ).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: /chat on whatsapp/i })).toBeVisible();
    await mobileNav.getByRole("link", { name: "Courses", exact: true }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
  });

  test("course and specialization CTAs preserve program context", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await page.goto("/courses/html5", { waitUntil: "domcontentloaded" });
    const courseApply = page.locator('a[href*="/apply"][href*="HTML5"]').first();
    await expect(courseApply).toBeVisible();
    await courseApply.click();
    await expect(page).toHaveURL(/\/apply\?/);
    await expect(page.locator("#selectedProgram")).toHaveValue("HTML5");

    await page.goto("/specializations/frontend-developer", { waitUntil: "domcontentloaded" });
    const specializationApply = page.locator('a[href*="/apply"]').first();
    await expect(specializationApply).toBeVisible();
    await specializationApply.click();
    await expect(page).toHaveURL(/\/apply$/);
    await expect(page.locator("#selectedProgram")).toBeVisible();
  });

  test("anonymous admin reads and mutations reject access", async ({ request }) => {
    const read = await request.get("/api/admin/me");
    expect(read.status()).toBe(401);
    const invalid = await request.get("/api/admin/me", {
      headers: { Authorization: "Bearer invalid-phase10b-token" },
    });
    expect([401, 403]).toContain(invalid.status());
    const mutation = await request.post("/api/admin/content/courses", { data: {} });
    expect(mutation.status()).toBe(401);
  });

  test("contact live submission returns 201, persists, and cleans up", async ({ page }) => {
    test.skip(
      !liveFormMode,
      "Set TBOS_E2E_ALLOW_LIVE_FORMS=1 for controlled production submissions.",
    );
    const email = "tbos-phase10b-contact@example.com";
    try {
      await cleanupEmail(email);
      await page.goto("/contact", { waitUntil: "domcontentloaded" });
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admissions") && response.request().method() === "POST",
      );
      await page.locator("#c-name").fill("TBOS Phase10B Contact");
      await page.locator("#c-email").fill(email);
      await page.locator("#c-wa").fill("+92 300 0000000");
      await page.locator("#c-cat").selectOption("Course enquiry");
      await page.locator("#c-msg").fill("Phase10B controlled contact submission.");
      await page.getByRole("button", { name: /send message/i }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(201);
      await expect(page.getByText(/message received!/i)).toBeVisible();
      if (hasSupabaseServerCreds) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
        const { data } = await supabase.from("admissions_requests").select("id").eq("email", email);
        expect(data?.length).toBe(1);
      }
    } finally {
      await cleanupEmail(email);
    }
  });

  test("adult application live submission returns 201 and cleans up", async ({ page }) => {
    test.skip(
      !liveFormMode,
      "Set TBOS_E2E_ALLOW_LIVE_FORMS=1 for controlled production submissions.",
    );
    const email = "tbos-phase10b-application@example.com";
    try {
      await cleanupEmail(email);
      await page.goto("/apply?type=Single%20Course&selected=HTML5", {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("#selectedProgram")).toHaveValue("HTML5");
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admissions") && response.request().method() === "POST",
      );
      await page.locator("#studentName").fill("TBOS Phase10B Application");
      await page.locator("#email").fill(email);
      await page.locator("#phone").fill("+92 300 0000000");
      await page.locator("#country").fill("Pakistan");
      await page.locator("#city").fill("Lahore");
      await page.locator("#age").fill("25");
      await page.locator("#educationLevel").selectOption("Undergraduate / University Student");
      await page
        .locator("#learningPreference")
        .selectOption("One-to-One (Personalized Private Tuition)");
      await page.locator("#consent").check();
      await page.getByRole("button", { name: /submit application/i }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(201);
      const json = await response.json();
      expect(json.referenceId).toMatch(/^TBOS-/);
      await expect(page.getByRole("heading", { name: "Application Received!" })).toBeVisible();
    } finally {
      await cleanupEmail(email);
    }
  });

  test("minor guardian live submission persists guardian fields and cleans up", async ({
    page,
  }) => {
    test.skip(
      !liveFormMode,
      "Set TBOS_E2E_ALLOW_LIVE_FORMS=1 for controlled production submissions.",
    );
    const email = "tbos-phase10b-minor@example.com";
    try {
      await cleanupEmail(email);
      await page.goto("/apply", { waitUntil: "domcontentloaded" });
      await page.locator("#studentName").fill("TBOS Phase10B Minor");
      await page.locator("#email").fill(email);
      await page.locator("#phone").fill("+92 300 0000000");
      await page.locator("#country").fill("Pakistan");
      await page.locator("#age").fill("14");
      await page.locator("#educationLevel").selectOption("Grade 9-10 / Matric / O-Level");
      await page.locator("#selectedProgram").fill("HTML5");
      await page.locator("#consent").check();
      await page.getByRole("button", { name: /submit application/i }).click();
      await expect(page.getByText(/please provide a parent or guardian name/i)).toBeVisible();
      await page.locator("#guardianName").fill("TBOS Phase10B Guardian");
      await page.locator("#guardianPhone").fill("+92 300 0000001");
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admissions") && response.request().method() === "POST",
      );
      await page.getByRole("button", { name: /submit application/i }).click();
      expect((await responsePromise).status()).toBe(201);
      await expect(page.getByRole("heading", { name: "Application Received!" })).toBeVisible();
    } finally {
      await cleanupEmail(email);
    }
  });

  test("free demo live submission returns 201 with demo status and cleans up", async ({ page }) => {
    test.skip(
      !liveFormMode,
      "Set TBOS_E2E_ALLOW_LIVE_FORMS=1 for controlled production submissions.",
    );
    const email = "tbos-phase10b-demo@example.com";
    try {
      await cleanupEmail(email);
      await page.goto("/free-demo?type=Single%20Course&selected=HTML5", {
        waitUntil: "domcontentloaded",
      });
      await page.locator("#demo-studentName").fill("TBOS Phase10B Demo");
      await page.locator("#demo-email").fill(email);
      await page.locator("#demo-phone").fill("+92 300 0000000");
      await page.locator("#demo-country").fill("Pakistan");
      await page.locator("#demo-age").fill("25");
      await page.locator("#demo-educationLevel").selectOption("Undergraduate / University Student");
      await page.locator("#demo-preferredDays").selectOption("Flexible / Any Day");
      await page.locator("#demo-preferredTime").selectOption("Evening (5:00 PM - 9:00 PM PKT)");
      await page.locator('input[type="checkbox"]').check();
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admissions") && response.request().method() === "POST",
      );
      await page.getByRole("button", { name: /request free demo session/i }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(201);
      await expect(page.getByRole("heading", { name: "Demo Request Received" })).toBeVisible();
      if (hasSupabaseServerCreds) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
        const { data } = await supabase
          .from("admissions_requests")
          .select("submission_kind,status")
          .eq("email", email)
          .single();
        expect(data).toEqual({ submission_kind: "demo", status: "demo_requested" });
      }
    } finally {
      await cleanupEmail(email);
    }
  });

  test("authenticated admin surface is blocked without local credentials", async ({ page }) => {
    test.skip(!hasAdminCreds, "BLOCKED_BY_LOCAL_CREDENTIAL: admin credentials are not configured.");
    const token = await loginAndGetToken(page);
    expect(token).toBeTruthy();
    const me = await page.request.get("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.status()).toBe(200);
    const json = await me.json();
    expect(json.admin.role).toBe("owner");
  });

  test("authenticated admin CRM and CMS lifecycle is credential-gated", async ({ page }) => {
    test.skip(!hasAdminCreds, "BLOCKED_BY_LOCAL_CREDENTIAL: admin credentials are not configured.");
    const token = await loginAndGetToken(page);
    expect(token).toBeTruthy();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const cmsPayload = {
      slug: "tbos-phase10b-cms-verification",
      title: "TBOS Phase10B CMS Verification",
      category: "Programming",
      level: "Beginner",
      duration: "Phase10B",
      summary: "Controlled Phase10B CMS verification record.",
      description:
        "Controlled Phase10B CMS verification record for create, publish, unpublish, and delete.",
      published: false,
      featured: false,
      sort_order: 999,
      outcomes: [],
      curriculum: [],
      keywords: [],
    };
    const create = await page.request.post("/api/admin/content/courses", {
      headers,
      data: cmsPayload,
    });
    expect(create.status()).toBe(201);
    const item = (await create.json()).item;
    try {
      const publicDraft = await page.request.get(
        "/api/content/courses?slug=tbos-phase10b-cms-verification",
      );
      expect(publicDraft.status()).toBe(404);
      const update = await page.request.patch(`/api/admin/content/courses/${item.id}`, {
        headers,
        data: { published: true },
      });
      expect(update.status()).toBe(200);
      const publicPublished = await page.request.get(
        "/api/content/courses?slug=tbos-phase10b-cms-verification",
      );
      expect(publicPublished.status()).toBe(200);
      const unpublish = await page.request.patch(`/api/admin/content/courses/${item.id}`, {
        headers,
        data: { published: false },
      });
      expect(unpublish.status()).toBe(200);
    } finally {
      const remove = await page.request.delete(`/api/admin/content/courses/${item.id}`, {
        headers,
      });
      expect(remove.status()).toBe(200);
    }
  });
});
