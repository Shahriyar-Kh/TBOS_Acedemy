import { test, expect } from "@playwright/test";
import { articles } from "../../src/data/articles";
import { site } from "../../src/data/site";
import { auditedPublicEndpoints, indexableHtmlRoutes } from "../../scripts/seo-route-inventory";

declare global {
  interface Window {
    __tbosFbqCalls?: unknown[][];
    fbq?: (...args: unknown[]) => void;
  }
}

async function installFbqSpy(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__tbosFbqCalls = [];
    window.fbq = (...args: unknown[]) => {
      window.__tbosFbqCalls?.push(args);
    };
  });
}

test.describe("Phase 15: Complete Google SEO, Indexing, Content & Core Web Vitals Foundation", () => {
  // 1. Every audited public endpoint returns HTTP 200
  test("1. Every audited public endpoint returns HTTP 200", async ({ request }) => {
    expect(indexableHtmlRoutes.length).toBe(89);
    expect(auditedPublicEndpoints.length).toBe(90);
    for (const route of auditedPublicEndpoints) {
      const response = await request.get(route);
      expect(response.status(), `Route ${route} should return 200`).toBe(200);
    }
  });

  // 2. Every indexable route is present in the sitemap
  test("2. Every indexable route is present in the sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();

    for (const route of indexableHtmlRoutes) {
      const expectedLoc = route === "/" ? `${site.url}/` : `${site.url}${route}`;
      expect(xml, `Sitemap must contain ${expectedLoc}`).toContain(`<loc>${expectedLoc}</loc>`);
    }
    const sitemapUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(sitemapUrls).toHaveLength(indexableHtmlRoutes.length);
    expect(new Set(sitemapUrls).size).toBe(indexableHtmlRoutes.length);
  });

  // 3. No excluded route appears in the sitemap
  test("3. No excluded route appears in the sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const xml = await response.text();

    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/api");
    expect(xml).not.toContain("localhost");

    const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
    for (const loc of locMatches) {
      expect(loc).not.toContain("?");
      expect(loc).not.toContain("utm_");
    }
  });

  // 4. robots.txt is valid and references the sitemap
  test("4. robots.txt is valid and references the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();

    expect(text).toContain("User-agent: *");
    expect(text).toContain("Disallow: /admin");
    expect(text).toContain("Disallow: /api");
    expect(text).toContain(`Sitemap: ${site.url}/sitemap.xml`);
  });

  // 5. Representative indexable pages have one canonical
  test("5. Representative indexable pages have one canonical", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/courses",
      "/courses/python",
      "/specializations/full-stack-developer",
      "/live-batches/100-days-complete-python",
      "/tutoring/mathematics",
      "/blog/python-learning-roadmap-beginners",
      "/apply",
      "/free-demo",
      "/contact",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const canonicals = await page.locator('link[rel="canonical"]').count();
      expect(canonicals, `Route ${route} must have exactly 1 canonical tag`).toBe(1);
    }
  });

  // 6. Canonical is an absolute production URL
  test("6. Canonical is an absolute production URL", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/courses/python",
      "/specializations/data-analyst",
      "/blog/data-analyst-roadmap",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      const expected = route === "/" ? `${site.url}/` : `${site.url}${route}`;
      expect(canonical).toBe(expected);
    }
  });

  // 7. Canonical strips UTM/query tracking
  test("7. Canonical strips UTM/query tracking", async ({ page }) => {
    await page.goto("/courses/python?utm_source=facebook&utm_campaign=spring_sale&ref=ad123", {
      waitUntil: "domcontentloaded",
    });
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(`${site.url}/courses/python`);
  });

  // 8. og:url matches canonical
  test("8. og:url matches canonical", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/courses",
      "/specializations",
      "/blog/python-learning-roadmap-beginners",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
      expect(ogUrl).toBe(canonical);
    }
  });

  // 9. Representative indexable pages have one H1
  test("9. Representative indexable pages have one H1", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/about",
      "/courses",
      "/courses/python",
      "/specializations",
      "/specializations/full-stack-developer",
      "/live-batches",
      "/live-batches/100-days-complete-python",
      "/tutoring",
      "/tutoring/physics",
      "/blog",
      "/blog/full-stack-developer-roadmap",
      "/apply",
      "/free-demo",
      "/contact",
      "/online-tutor-service-pakistan",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `Route ${route} must have exactly one H1 tag`).toBe(1);
    }
  });

  // 10. Representative pages have a valid title and description
  test("10. Representative pages have a valid title and description", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/about",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      "/blog",
      "/apply",
      "/free-demo",
      "/contact",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(title?.length).toBeGreaterThan(10);
      expect(desc?.length).toBeGreaterThan(20);
    }
  });

  // 11. Priority titles and descriptions are unique
  test("11. Priority titles and descriptions are unique", async ({ page }) => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    const testRoutes = [
      "/",
      "/about",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      "/blog",
      "/apply",
      "/free-demo",
      "/contact",
      ...articles.map((a) => `/blog/${a.slug}`),
    ];

    for (const route of testRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute("content");

      expect(titles.has(title!)).toBeFalsy();
      expect(descs.has(desc!)).toBeFalsy();

      titles.add(title!);
      descs.add(desc!);
    }
  });

  // 12. Admin pages are noindex
  test("12. Admin pages are noindex", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
    expect(robots).toContain("nofollow");
  });

  // 13. API routes are not indexable
  test("13. API routes are not indexable", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /api");

    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).not.toContain("/api");

    const postRes = await request.post("/api/admissions", {
      headers: { "Content-Type": "application/json" },
      data: { invalid: true },
    });
    expect(postRes.headers()["content-type"]).toContain("application/json");
  });

  // 14. Structured data parses successfully
  test("14. Structured data parses successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const scripts = await page.$$eval('script[type="application/ld+json"]', (elems) =>
      elems.map((e) => e.textContent || ""),
    );
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => JSON.parse(s)).not.toThrow();
    }
  });

  // 15. Course schema matches visible course content
  test("15. Course schema matches visible course content", async ({ page }) => {
    await page.goto("/courses/python", { waitUntil: "domcontentloaded" });
    const scripts = await page.$$eval('script[type="application/ld+json"]', (elems) =>
      elems.map((e) => e.textContent || ""),
    );
    const courseSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "Course");
    expect(courseSchema).toBeTruthy();
    expect(courseSchema.name).toContain("Python");
    expect(courseSchema.provider.name).toBe(site.fullName);

    // Verify visible H1 matches
    const h1 = await page.locator("h1").innerText();
    expect(h1).toContain("Python");
  });

  // 16. Article schema exists on all six resource pages
  test("16. Article schema exists on all six resource pages", async ({ page }) => {
    expect(articles.length).toBe(6);
    for (const article of articles) {
      await page.goto(`/blog/${article.slug}`, { waitUntil: "domcontentloaded" });
      const scripts = await page.$$eval('script[type="application/ld+json"]', (elems) =>
        elems.map((e) => e.textContent || ""),
      );
      const articleSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "Article");
      expect(articleSchema).toBeTruthy();
      expect(articleSchema.headline).toBe(article.title);
      expect(articleSchema.datePublished).toBeTruthy();
      expect(articleSchema.author.name).toBe(article.author.name);
    }
  });

  // 17. FAQ schema only appears where visible FAQs exist
  test("17. FAQ schema only appears where visible FAQs exist", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "domcontentloaded" });
    const scripts = await page.$$eval('script[type="application/ld+json"]', (elems) =>
      elems.map((e) => e.textContent || ""),
    );
    const faqSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "FAQPage");
    expect(faqSchema).toBeTruthy();
    expect(faqSchema.mainEntity.length).toBeGreaterThan(0);

    // Confirm that the questions in schema are visibly rendered in the DOM
    const visibleBody = await page.innerText("main");
    for (const q of faqSchema.mainEntity.slice(0, 3)) {
      expect(visibleBody).toContain(q.name);
    }
  });

  // 18. Blog hub internal-link sample is valid (full crawl runs in seo:links)
  test("18. Blog hub internal-link sample is valid", async ({ page, request }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const links = await page.$$eval('a[href^="/"]', (anchors) =>
      anchors.map((a) => a.getAttribute("href")?.split("#")[0].split("?")[0] || "").filter(Boolean),
    );
    for (const link of Array.from(new Set(links)).slice(0, 15)) {
      if (link.startsWith("/admin") || link.startsWith("/api")) continue;
      const res = await request.get(link);
      expect(res.status(), `Internal link ${link} must return 200`).toBe(200);
    }
  });

  // 19. Every new article has an incoming link from the blog hub
  test("19. Every new article has an incoming link from the blog hub", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    for (const article of articles) {
      const link = page.locator(`a[href*="/blog/${article.slug}"]`).first();
      await expect(link).toBeAttached();
    }
  });

  // 20. New articles are available from /blog
  test("20. New articles are available from /blog", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const count = await page.locator("article").count();
    expect(count).toBe(6);
    for (const article of articles) {
      await expect(page.locator(`text=${article.title}`).first()).toBeVisible();
    }
  });

  // 21. Articles link to relevant learning programs
  test("21. Articles link to relevant learning programs", async ({ page }) => {
    await page.goto("/blog/python-learning-roadmap-beginners", { waitUntil: "domcontentloaded" });
    const courseLink = page.locator('a[href="/courses/python"]').first();
    await expect(courseLink).toBeAttached();

    const liveCohortLink = page.locator('a[href="/live-batches/100-days-complete-python"]').first();
    await expect(liveCohortLink).toBeAttached();
  });

  // 22. Critical images have alt text and non-zero rendered dimensions
  test("22. Critical images have alt text and non-zero rendered dimensions", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute("src"),
        hasAlt: img.hasAttribute("alt"),
        width: img.getBoundingClientRect().width,
        height: img.getBoundingClientRect().height,
      })),
    );
    for (const img of images) {
      expect(img.hasAlt, `Image ${img.src} must have alt attribute`).toBeTruthy();
      expect(img.width, `Image ${img.src} must have rendered width`).toBeGreaterThan(0);
      expect(img.height, `Image ${img.src} must have rendered height`).toBeGreaterThan(0);
    }
  });

  // 23. Priority pages have no mobile overflow
  test("23. Priority pages have no mobile overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const checkRoutes = [
      "/",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      "/blog/python-learning-roadmap-beginners",
      "/apply",
      "/contact",
    ];

    for (const route of checkRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(
        overflow,
        `Route ${route} should not have horizontal overflow on 390px mobile`,
      ).toBeFalsy();
    }
  });

  // 24. Reduced-motion content remains visible
  test("24. Reduced-motion content remains visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heroH1 = page.locator("h1");
    await expect(heroH1).toBeVisible();
  });

  // 25. Skip navigation remains functional
  test("25. Skip navigation remains functional", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    const mainTarget = page.locator("#main-content");
    await expect(mainTarget).toBeAttached();
  });

  // 26. Admissions CTAs preserve query context
  test("26. Admissions CTAs preserve query context", async ({ page }) => {
    await page.goto("/courses/python", { waitUntil: "domcontentloaded" });
    const applyLink = page.locator('main a[href*="/apply"]').first();
    const href = await applyLink.getAttribute("href");
    expect(href).toContain("type=Single+Course");
    expect(href).toContain("selected=Python");
  });

  // 27. Meta Pixel behaviour remains unchanged
  test("27. Meta Pixel behaviour remains unchanged", async ({ page }) => {
    const configuredPixelId = (process.env.VITE_META_PIXEL_ID || "").trim();
    if (configuredPixelId) {
      await installFbqSpy(page);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      const calls = await page.evaluate(() => window.__tbosFbqCalls || []);
      expect(calls.some((c) => c[0] === "track" && c[1] === "PageView")).toBeTruthy();
    } else {
      await installFbqSpy(page);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      const calls = await page.evaluate(() => window.__tbosFbqCalls || []);
      expect(calls).toEqual([]);
    }
  });

  // 28. Roadmaps and pricing remain unchanged
  test("28. Roadmaps and pricing remain unchanged", async ({ page }) => {
    await page.goto("/specializations/full-stack-developer", { waitUntil: "domcontentloaded" });
    const text = await page.innerText("main");
    expect(text).toContain("PKR 20,000");

    await page.goto("/specializations/frontend-developer", { waitUntil: "domcontentloaded" });
    const text2 = await page.innerText("main");
    expect(text2).toContain("PKR 15,000");
  });

  // 29. No dummy or unsupported claims appear
  test("29. No dummy or unsupported claims appear", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/about",
      "/live-batches",
      "/tutoring",
      ...articles.map((article) => `/blog/${article.slug}`),
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const text = await page.innerText("body");
      expect(text.toLowerCase()).not.toContain("no registration fee");
      expect(text.toLowerCase()).not.toContain("guaranteed job");
      expect(text.toLowerCase()).not.toContain("100% placement");
      expect(text.toLowerCase()).not.toContain("completion rates for pre-recorded courses");
      expect(text.toLowerCase()).not.toContain("students join from pakistan");
      expect(text.toLowerCase()).not.toContain("lorem ipsum");
    }
  });

  // 30. Production pages contain no localhost or preview URLs
  test("30. Production pages contain no localhost or preview URLs", async ({ page }) => {
    const sampleRoutes = [
      "/",
      "/courses",
      "/specializations",
      "/live-batches",
      "/tutoring",
      "/blog",
      "/blog/how-to-learn-python-100-days",
    ];
    for (const route of sampleRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const content = await page.content();
      expect(content).not.toContain("localhost:3000");
      expect(content).not.toContain("localhost:4173");
      expect(content).not.toContain("127.0.0.1");
    }
  });
});
