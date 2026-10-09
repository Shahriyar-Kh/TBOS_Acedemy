import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { seoLandingHead } from "@/lib/seo";

const SLUG = "maths-tutor";

export const Route = createFileRoute("/maths-tutor")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return seoLandingHead(p);
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
