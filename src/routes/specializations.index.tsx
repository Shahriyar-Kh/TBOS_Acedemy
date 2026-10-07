import { createFileRoute } from "@tanstack/react-router";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { SpecializationCatalogCard } from "@/components/catalog/SpecializationCatalogCard";
import { Reveal } from "@/components/Reveal";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CtaSection } from "@/components/sections/CtaSection";
import { specializations } from "@/data/specializations";
import { getCmsSpecializationsFn } from "@/lib/cmsFunctions";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/specializations/")({
  loader: async () => {
    try {
      const data = await getCmsSpecializationsFn();
      if (data && data.length > 0) return { specializations: data };
    } catch {
      // Fallback
    }
    return { specializations };
  },
  head: () => ({
    meta: buildMeta({
      title: "Technology Specializations | Developer Learning Tracks | TechBuilt Open School",
      description:
        "Structured multi-month learning paths in Full Stack, Frontend, Backend, Python, Database, Mobile, Data Analysis, and AI/ML engineering. Guided by expert instructors.",
      keywords: [
        "full stack development specialization",
        "web development learning path",
        "python developer track",
        "database developer specialization",
        "mobile application development course",
        "data science roadmap",
        "ai machine learning specialization",
      ],
    }),
    links: [{ rel: "canonical", href: "/specializations" }],
  }),
  component: SpecializationsPage,
});

function SpecializationsPage() {
  const { specializations: loadedSpecs } = Route.useLoaderData();
  const allSpecs = loadedSpecs && loadedSpecs.length > 0 ? loadedSpecs : specializations;

  return (
    <>
      {/* Hero: Career-Focused Technical Pathways */}
      <CatalogHero
        eyebrow="CAREER-FOCUSED TECHNICAL PATHWAYS"
        title="Choose a Structured Technical Specialization"
        description="Multi-month learning paths designed to connect foundational skills, tools, projects and practical software development workflows."
        breadcrumb={[{ label: "Specializations" }]}
        chips={[
          `${allSpecs.length} specializations`,
          "Structured roadmaps",
          "Project-based learning",
          "Live mentoring",
        ]}
      />

      {/* Specialization Cards Grid */}
      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allSpecs.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min((i % 6) * 60, 300)} className="h-full">
              <SpecializationCatalogCard spec={s} />
            </Reveal>
          ))}
        </div>
      </section>

      <HowItWorks />
      <CtaSection />
    </>
  );
}
