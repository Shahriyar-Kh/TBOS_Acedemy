import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Sparkles, Users, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { LiveOfferCard } from "@/components/LiveOfferCard";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { activeLiveOffers } from "@/data/liveOffers";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/live-batches/")({
  head: () => ({
    meta: buildMeta({
      title: "Active Live Group Classes & Batches | TechBuilt Open School",
      description:
        "Explore active live group coding batches at TechBuilt Open School. Instructor-led online classes in Python, Data Analysis, and Young Developers with Free Demo sessions.",
      keywords: [
        "live online classes",
        "Python live course",
        "online Python classes",
        "coding classes for students",
        "data analysis Python course",
        "live programming batch",
      ],
    }),
    links: [{ rel: "canonical", href: "/live-batches" }],
  }),
  component: LiveBatchesPage,
});

export function LiveBatchesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Instructor-Led Cohorts"
        title="Active Live Group Programs"
        description="Join scheduled live online cohorts with real-time screen sharing, structured milestones, hands-on code reviews, and dedicated mentor guidance."
        breadcrumb={[{ label: "Live Batches" }]}
      />

      {/* Explanatory Banner: Group Cohorts vs 1-on-1 */}
      <section className="mx-auto max-w-7xl container-px pt-12 pb-4">
        <Reveal>
          <div className="rounded-2xl border border-border bg-gradient-soft p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Interactive Cohorts</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Learn in collaborative groups with live discussions, guided exercises, and peer energy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-foreground">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Free Demo Session</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Attend a live trial session before committing to monthly paid enrollment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Next Scheduled Batches</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Exact times arranged with admissions to suit student schedules and time zones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Active Live Offers Grid */}
      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Currently Promoted Live Batches
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These are our currently active group programs. Every program includes a Free Demo trial class.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {activeLiveOffers.length} Active Programs
          </span>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activeLiveOffers.map((offer) => (
            <Reveal key={offer.slug}>
              <LiveOfferCard offer={offer} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Catalog Distinction Callout */}
      <section className="mx-auto max-w-7xl container-px py-8">
        <Reveal>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="h-4 w-4" /> 1-on-1 Learning Flexibility
              </span>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Looking for other programming topics or academic subjects?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Only the programs above are running as active group batches. However, our full catalog of 32 technical courses and academic tutoring subjects are always available for private, one-to-one mentoring at flexible times.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild variant="default" size="lg">
                <Link to="/courses">
                  Browse 32 Courses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/tutoring">
                  Academic Tutoring
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <HowItWorks />
      <CtaSection />
    </>
  );
}
