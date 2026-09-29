import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { buildMeta, faqJsonLd } from "@/lib/seo";

const SLUG = "grade-5-to-ms-online-learning";

export const Route = createFileRoute("/grade-5-to-ms-online-learning")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return {
      meta: buildMeta({ title: p.title, description: p.description, keywords: p.keywords }),
      links: [{ rel: "canonical", href: `/${SLUG}` }],
      scripts: [faqJsonLd(p.faqs)],
    };
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
