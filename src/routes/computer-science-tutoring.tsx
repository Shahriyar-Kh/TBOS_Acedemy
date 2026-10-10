import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { seoLandingHead } from "@/lib/seo";

const SLUG = "computer-science-tutoring";

export const Route = createFileRoute("/computer-science-tutoring")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return seoLandingHead(p);
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
