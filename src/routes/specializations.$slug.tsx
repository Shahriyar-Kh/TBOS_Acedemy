import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Briefcase,
  MessageCircle,
  Monitor,
  Users,
  Sparkles,
  ChevronRight,
  Code2,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { QuickFacts } from "@/components/catalog/QuickFacts";
import { LearningPathTimeline } from "@/components/catalog/LearningPathTimeline";
import { SpecializationCatalogCard } from "@/components/catalog/SpecializationCatalogCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSpecialization, specializations } from "@/data/specializations";
import { getSpecializationCatalogVisual, deriveSpecializationTags } from "@/data/catalogVisuals";
import { getCmsSpecializationBySlugFn } from "@/lib/cmsFunctions";
import { buildMeta, courseJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

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
    const title = spec.seoTitle || `${spec.title} Specialization Track | TechBuilt Open School`;
    const description = spec.seoDescription || spec.summary;
    return {
      meta: buildMeta({
        title,
        description,
        keywords: spec.keywords,\n        path: `/specializations/${spec.slug}`,
        type: "article",
      }),
      links: [{ rel: "canonical", href: `/specializations/${spec.slug}` }],
      scripts: [courseJsonLd(spec.title, spec.summary)],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Specialization not found</h1>
      <p className="mt-3 text-muted-foreground">This specialization doesn&apos;t exist.</p>
      <Button asChild className="mt-6">
        <Link to="/specializations">Browse all specializations</Link>
      </Button>
    </div>
  ),
  component: SpecializationDetail,
});

function SpecializationDetail() {
  const { spec } = Route.useLoaderData();
  const visual = getSpecializationCatalogVisual(spec.slug);
  const tags = deriveSpecializationTags(spec.modules);

  const related = specializations.filter((s) => s.slug !== spec.slug).slice(0, 3);

  return (
    <>
      {/* 1. Specialization Hero: 2-Column Responsive Layout */}
      <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-dots opacity-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl container-px">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-primary-foreground/75"
          >
            <Link to="/" className="hover:text-cyan transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link to="/specializations" className="hover:text-cyan transition-colors">
              Specializations
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-primary-foreground/95 font-medium">{spec.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, Tagline, Badges & Quick CTAs */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                    {visual.badge}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground/90"
                  >
                    {spec.level}
                  </Badge>
                  <span className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    <Clock className="h-3 w-3 text-cyan" /> {spec.duration}
                  </span>
                </div>

                <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  {spec.title}
                </h1>
                <p className="mt-2 text-base font-semibold text-gold sm:text-lg">{spec.tagline}</p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                  {spec.summary}
                </p>

                {/* Primary Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild variant="hero" size="lg" className="font-semibold shadow-soft">
                    <Link to="/apply" search={{ type: "Specialization", selected: spec.title }}>
                      Apply for this track <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="glass border-primary-foreground/25 font-semibold text-primary-foreground hover:bg-white/10"
                  >
                    <Link to="/free-demo" search={{ type: "Specialization", selected: spec.title }}>
                      <Sparkles className="mr-1.5 h-4 w-4 text-gold" /> Request Free Demo
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Editorial Hero Image */}
            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-primary-foreground/20 shadow-2xl bg-gradient-hero">
                  <img
                    src={visual.src}
                    alt={visual.alt}
                    width={visual.width}
                    height={visual.height}
                    fetchPriority="high"
                    className={cn(
                      "h-full w-full object-cover",
                      visual.objectPosition ?? "object-center",
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent"
                  />
                  <span className="glass absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl text-cyan shadow-soft">
                    <Icon name={spec.icon} className="h-6 w-6" />
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        {/* 2. Quick Facts Row */}
        <Reveal>
          <QuickFacts
            duration={spec.duration}
            level={spec.level}
            mode="Live Online Classes"
            format="1-on-1 & small cohorts"
          />
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Main Column */}
          <div className="space-y-12">
            {/* 3. Track Overview */}
            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Track overview
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {spec.description}
                </p>
              </div>
            </Reveal>

            {/* 7. Technologies & Tools Covered */}
            {tags.length > 0 && (
              <Reveal>
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-soft">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Key Technologies & Core Tools Covered
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Technologies derived directly from this specialization&apos;s modules and
                    assignments.
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-xl border border-border bg-accent/60 px-3 py-1 font-mono text-xs font-semibold text-primary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {/* 4. Learning Modules Roadmap */}
            <Reveal>
              <LearningPathTimeline
                items={spec.modules}
                title="Specialization Learning Modules"
                subtitle="Progressive engineering pathway from fundamental concepts to full-scale project architecture."
              />
            </Reveal>

            {/* 5. Outcomes */}
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  What you&apos;ll build & master
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Concrete capabilities demonstrated in real codebase repositories upon completion.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {spec.outcomes.map((outcome: string) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-xs sm:text-sm font-medium text-foreground shadow-soft transition-colors hover:border-border-strong"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* 6. Career Directions (Truthful, non-guaranteed wording) */}
            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-muted/40 p-6 sm:p-8 shadow-soft">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Possible Career Directions & Professional Pathways
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  These represent industry pathways that align with this curriculum. Outcomes depend
                  on individual dedication, hands-on practice, and portfolio building (no guaranteed
                  job placement).
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {spec.careers.map((career: string) => (
                    <span
                      key={career}
                      className="rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-soft border border-border/60"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sticky Enrollment Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={120}>
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-card">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  {spec.tagline}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Join {spec.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Start with a 1-on-1 roadmap consultation and trial session with a senior mentor.
                </p>

                <ul className="mt-6 space-y-3.5 border-t border-border/80 pt-5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-cyan" />
                    <span>
                      Duration: <strong className="text-foreground">{spec.duration}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-cyan" />
                    <span>
                      Level: <strong className="text-foreground">{spec.level}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Monitor className="h-4 w-4 text-cyan" />
                    <span>
                      Delivery: <strong className="text-foreground">Live Online Classes</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-cyan" />
                    <span>
                      Format: <strong className="text-foreground">1-on-1 or cohort batches</strong>
                    </span>
                  </li>
                </ul>

                {/* Primary Apply Button */}
                <Button
                  asChild
                  variant="hero"
                  size="lg"
                  className="mt-6 w-full font-semibold shadow-soft"
                >
                  <Link to="/apply" search={{ type: "Specialization", selected: spec.title }}>
                    Apply for this track <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>

                {/* Free Demo Trial CTA (preserves selection context & trial session note) */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="mt-3 w-full font-semibold border-primary/25 hover:border-primary/50"
                >
                  <Link to="/free-demo" search={{ type: "Specialization", selected: spec.title }}>
                    <Sparkles className="mr-1.5 h-4 w-4 text-gold-foreground" /> Request Free Demo /
                    Consultation
                  </Link>
                </Button>
                <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
                  * Free Demo is a 1-on-1 trial session, not the complete program.
                </p>

                {/* WhatsApp Chat Inquiry */}
                <div className="mt-4 border-t border-border/80 pt-3">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    <a
                      href={whatsappLink(
                        `Hello TechBuilt Open School, I would like to inquire about the ${spec.title} specialization track.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Have
                      questions? Ask on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 10. Related Specialization Tracks */}
      <section className="border-t border-border/80 bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl container-px">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Explore More Pathways
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Related Specializations
              </h2>
            </div>
            <Link
              to="/specializations"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Browse all 10 tracks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <SpecializationCatalogCard key={s.slug} spec={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
