import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { seoLandingHead } from "@/lib/seo";

const SLUG = "online-tutor-service-pakistan";

export const Route = createFileRoute("/online-tutor-service-pakistan")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return seoLandingHead(p);
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
