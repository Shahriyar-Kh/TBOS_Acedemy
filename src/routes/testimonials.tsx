import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: buildMeta({
      title: "Testimonials | What Students & Parents Say | TechBuilt Open School",
      description:
        "Read real reviews from students and parents who learn with TechBuilt Open School. Trusted results in academic tutoring and technical courses worldwide.",
      keywords: ["online academy reviews", "tutoring testimonials", "student success stories"],
    }),
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Success stories"
        title="Trusted by students & parents"
        description="Real results and honest reviews from learners across Pakistan and around the world."
        breadcrumb={[{ label: "Testimonials" }]}
      />
      <StatsStrip />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
