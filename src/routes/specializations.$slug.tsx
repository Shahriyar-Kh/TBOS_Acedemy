import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, BarChart3, Briefcase, MessageCircle, Monitor, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpecializationCard } from "@/components/SpecializationCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { getSpecialization, specializations } from "@/data/specializations";
import { getCmsSpecializationBySlugFn } from "@/lib/cmsFunctions";
import { buildMeta, courseJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/data/site";

export const Route = createFileRoute("/specializations/$slug")({
  loader: async ({ params }) => {
    let spec = null;
    try {
      spec = await getCmsSpecializationBySlugFn({ data: params.slug });
    } catch {
      spec = getSpecialization(params.slug);
    }
    if (!spec) throw notFound();
    return { spec };
  },
  head: ({ loaderData }) => {
    const spec = loaderData?.spec;
    if (!spec) return { meta: buildMeta({ title: "Specialization", description: "Details." }) };
    const title = spec.seoTitle || `${spec.title} Specialization | TechBuilt Open School`;
    const description = spec.seoDescription || spec.summary;
    return {
      meta: buildMeta({
        title,
        description,
        keywords: spec.keywords,
        type: "article",
      }),
      links: [{ rel: "canonical", href: `/specializations/${spec.slug}` }],
      scripts: [courseJsonLd(spec.title, spec.summary)],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Specialization not found</h1>
      <p className="mt-3 text-muted-foreground">This specialization doesn't exist.</p>
      <Button asChild className="mt-6">
        <Link to="/specializations">Browse specializations</Link>
      </Button>
    </div>
  ),
  component: SpecializationDetail,
});

function SpecializationDetail() {
  const { spec } = Route.useLoaderData();
  const related = specializations.filter((s) => s.slug !== spec.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Specialization"
        title={spec.title}
        description={spec.tagline}
        breadcrumb={[{ label: "Specializations", to: "/specializations" }, { label: spec.title }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                <Icon name={spec.icon} className="h-7 w-7" />
              </span>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline">{spec.level}</Badge>
                <Badge variant="secondary">{spec.duration}</Badge>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-foreground">About this track</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{spec.description}</p>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">Learning modules</h2>
              <ol className="mt-4 space-y-3">
                {spec.modules.map((m: string, i: number) => (
                  <li key={m} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-sm font-medium text-foreground">{m}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">Outcomes</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {spec.outcomes.map((o: string) => (
                  <li key={o} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground/90 shadow-soft">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-10 rounded-2xl bg-muted/60 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Briefcase className="h-5 w-5 text-primary" /> Indicative Career Directions & Pathways
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                These represent real-world industry pathways aligned with this curriculum. Outcomes depend on individual dedication, hands-on practice, and portfolio building (no guaranteed job placement).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {spec.careers.map((c: string) => (
                  <span key={c} className="rounded-full bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-soft">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm font-semibold text-gold-foreground">{spec.tagline}</p>
              <h3 className="mt-1 text-xl font-bold text-foreground">Join {spec.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-primary" /> {spec.duration}
                </li>
                <li className="flex items-center gap-2.5">
                  <BarChart3 className="h-4 w-4 text-primary" /> {spec.level}
                </li>
                <li className="flex items-center gap-2.5">
                  <Monitor className="h-4 w-4 text-primary" /> Live Online Classes
                </li>
                <li className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-primary" /> One-to-one or cohort batches
                </li>
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-6 w-full">
                <Link to="/apply" search={{ type: "Specialization", selected: spec.title }}>
                  Apply for this track <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="mt-2.5 w-full">
                <Link to="/free-demo" search={{ type: "Specialization", selected: spec.title }}>
                  <Sparkles className="h-4 w-4 text-gold-foreground" /> Request Free Demo / Consultation
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="mt-1 w-full text-muted-foreground hover:text-foreground">
                <a
                  href={whatsappLink(`Hello TechBuilt Open School, I would like to inquire about the ${spec.title} specialization track.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Have questions? Ask on WhatsApp
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-foreground">Other specializations</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <SpecializationCard key={s.slug} spec={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
