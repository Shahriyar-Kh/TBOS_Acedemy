import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { buildMeta, faqJsonLd } from "@/lib/seo";

const SLUG = "computer-science-tutoring";

export const Route = createFileRoute("/computer-science-tutoring")({
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
