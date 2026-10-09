import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding } from "@/components/SeoLanding";
import { getSeoPage } from "@/data/seoPages";
import { seoLandingHead } from "@/lib/seo";

const SLUG = "international-online-academy";

export const Route = createFileRoute("/international-online-academy")({
  head: () => {
    const p = getSeoPage(SLUG)!;
    return seoLandingHead(p);
  },
  component: () => <SeoLanding page={getSeoPage(SLUG)!} />,
});
