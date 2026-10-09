import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { seoLandingHead } from "@/lib/seo";

const SLUG = "grade-5-to-ms-online-learning";

export const Route = createFileRoute("/grade-5-to-ms-online-learning")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return seoLandingHead(p);
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
