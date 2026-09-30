import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getCmsCourses, getCmsSpecializations, getCmsLiveOffers } from "@/lib/cms.server";
import { seoPages } from "../data/seoPages";

// TODO: set this to your live domain once published, e.g. https://techbuiltopenschool.com
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [activeCourses, activeSpecs, activeOffers] = await Promise.all([
          getCmsCourses(),
          getCmsSpecializations(),
          getCmsLiveOffers(),
        ]);

        const staticPaths = [
          "/",
          "/about",
          "/courses",
          "/live-batches",
          "/specializations",
          "/tutoring",
          "/apply",
          "/free-demo",
          "/contact",
          "/testimonials",
          "/faq",
          "/blog",
          "/privacy",
          "/terms",
        ];

        const paths = [
          ...staticPaths,
          ...activeCourses.map((c) => `/courses/${c.slug}`),
          ...activeSpecs.map((s) => `/specializations/${s.slug}`),
          ...activeOffers.map((o) => `/live-batches/${o.slug}`),
          ...seoPages.map((p) => `/${p.slug}`),
        ];

        const urls = paths
          .map(
            (p) =>
              `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.7"}</priority></url>`,
          )
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
