import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SpecializationCard } from "@/components/SpecializationCard";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CtaSection } from "@/components/sections/CtaSection";
import { specializations } from "@/data/specializations";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/specializations/")({
  head: () => ({
    meta: buildMeta({
      title: "Specializations | Career Learning Tracks | TechBuilt Open School",
      description:
        "Structured, mentor-led specializations in Full Stack, Web, Frontend, Backend and Python development, plus Academic Support. Become job-ready online.",
      keywords: [
        "full stack development course",
        "web development specialization",
        "python development course",
      ],
    }),
    links: [{ rel: "canonical", href: "/specializations" }],
  }),
  component: SpecializationsPage,
});

function SpecializationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career tracks"
        title="Specializations that build careers"
        description="Go beyond single courses with complete, structured learning paths that take you from fundamentals to job-ready expertise — guided by expert mentors."
        breadcrumb={[{ label: "Specializations" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specializations.map((s, i) => (
            <Reveal key={s.slug} delay={i * 70}>
              <SpecializationCard spec={s} />
            </Reveal>
          ))}
        </div>
      </section>

      <HowItWorks />
      <CtaSection />
    </>
  );
}
