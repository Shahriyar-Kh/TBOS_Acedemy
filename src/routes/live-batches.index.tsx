import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Sparkles, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { LiveProgramsHero } from "@/components/live/LiveProgramsHero";
import { LiveProgramCard } from "@/components/live/LiveProgramCard";
import { LiveProgramComparison } from "@/components/live/LiveProgramComparison";
import { LiveProgramExperience } from "@/components/live/LiveProgramExperience";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { activeLiveOffers } from "@/data/liveOffers";
import { getCmsLiveOffersFn } from "@/lib/cmsFunctions";
import { buildMeta } from "@/lib/seo";
import { site } from "@/data/site";

export const Route = createFileRoute("/live-batches/")({
  loader: async () => {
    try {
      const data = await getCmsLiveOffersFn();
      if (data && data.length > 0) return { offers: data };
    } catch {
      // Fallback
    }
    return { offers: activeLiveOffers };
  },
  head: () => ({
    meta: buildMeta({
      title: "Active Live Group Classes & Batches | TechBuilt Open School",
      description:
        "Explore active live group coding batches at TechBuilt Open School. Instructor-led online cohorts in Python, Data Analysis & AI, and Young Developers with Free Demo sessions.",
      path: "/live-batches",
      image: "/images/home/live-100-days-python.webp",
      keywords: [
        "live online classes",
        "Python live course",
        "online Python classes",
        "coding classes for students",
        "data analysis Python course",
        "live programming batch",
      ],
    }),
    links: [{ rel: "canonical", href: `${site.url}/live-batches` }],
  }),
  component: LiveBatchesPage,
});

export function LiveBatchesPage() {
  const { offers: loadedOffers } = Route.useLoaderData();
  const allOffers = loadedOffers && loadedOffers.length > 0 ? loadedOffers : activeLiveOffers;

  return (
    <>
      {/* Premium Hero with Single Semantic H1 */}
      <LiveProgramsHero />

      {/* Program Type Distinction: Group Cohorts vs 1-on-1 Mentoring */}
      <section className="mx-auto max-w-7xl container-px pt-12 pb-4">
        <Reveal>
          <div className="rounded-2xl border border-border bg-gradient-soft p-6 sm:p-8 shadow-soft">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Interactive Cohorts</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Learn in collaborative groups with live discussions, guided exercises, and
                    shared accountability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-foreground">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Free Demo Trial</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Attend one live trial session before committing to monthly paid enrollment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Transparent Schedules</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Timetables arranged directly with admissions to match student time zones and
                    commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3 Active Live Programs Grid */}
      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              CURRENTLY OPEN FOR ENROLLMENT
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Currently Promoted Live Batches
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These 3 programs are currently running as active group cohorts. Each includes a
              complimentary trial class.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-primary">
            {allOffers.length} Active Cohorts
          </span>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allOffers.map((offer) => (
            <Reveal key={offer.slug} className="min-w-0">
              <LiveProgramCard offer={offer} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Honest Side-by-Side Comparison */}
      <LiveProgramComparison offers={allOffers} />

      {/* Learning Experience Pillars */}
      <div className="mx-auto max-w-7xl container-px">
        <LiveProgramExperience />
      </div>

      {/* Catalog Distinction Callout */}
      <section className="mx-auto max-w-7xl container-px py-12">
        <Reveal>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="h-4 w-4" /> 1-on-1 Private Learning Flexibility
              </span>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Looking for other programming topics or academic subjects?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Only the 3 programs above are running as active group cohorts. However, our complete
                catalog of 32 technical courses and academic tutoring subjects are always available
                for private, one-to-one mentoring at flexible hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild variant="default" size="lg">
                <Link to="/courses">
                  Browse 32 Courses <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/tutoring">
                  Academic Tutoring <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <CtaSection />
    </>
  );
}
