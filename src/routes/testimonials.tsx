import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: buildMeta({
      title: "Academy Standards & Quality Commitments | TechBuilt Open School",
      description:
        "Learn about TechBuilt Open School's educational standards, interactive methodology, and commitments to quality learning across programming courses and tutoring.",
      keywords: ["academy standards", "learning methodology", "online tutoring quality", "learning commitments"],
    }),
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Standards"
        title="Academy Standards & Commitments"
        description="Our pedagogical methodology, student-first philosophy, and quality standards for learners worldwide."
        breadcrumb={[{ label: "Standards & Commitments" }]}
      />
      <StatsStrip />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
