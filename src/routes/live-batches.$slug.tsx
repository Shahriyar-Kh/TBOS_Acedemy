import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Award,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveOfferCard } from "@/components/LiveOfferCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { getLiveOffer, activeLiveOffers } from "@/data/liveOffers";
import { buildMeta } from "@/lib/seo";
import { whatsappLink } from "@/data/site";

export const Route = createFileRoute("/live-batches/$slug")({
  loader: ({ params }) => {
    const offer = getLiveOffer(params.slug);
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    const offer = loaderData?.offer;
    if (!offer) return { meta: buildMeta({ title: "Live Batch", description: "Program details." }) };
    return {
      meta: buildMeta({
        title: `${offer.title} | Live Group Online Batch | TechBuilt Open School`,
        description: `${offer.summary} Current offer: Rs ${offer.offerFee.toLocaleString()}/${offer.billingPeriod}. Free Demo session available.`,
        keywords: offer.keywords,
        type: "article",
      }),
      links: [{ rel: "canonical", href: `/live-batches/${offer.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Program not found</h1>
      <p className="mt-3 text-muted-foreground">The live group program you're looking for doesn't exist.</p>
      <Button asChild className="mt-6">
        <Link to="/live-batches">Browse all live batches</Link>
      </Button>
    </div>
  ),
  component: LiveOfferDetail,
});

function LiveOfferDetail() {
  const { offer } = Route.useLoaderData();
  const relatedOffers = activeLiveOffers.filter((o) => o.slug !== offer.slug);

  const whatsappInquiryText = `Hello TechBuilt Open School, I would like information about the ${offer.title} live group program and Free Demo.`;

  return (
    <>
      <PageHeader
        eyebrow="Active Live Group Program"
        title={offer.title}
        description={offer.tagline}
        breadcrumb={[
          { label: "Live Batches", to: "/live-batches" },
          { label: offer.shortTitle },
        ]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {/* Header info */}
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                  <Icon name={offer.icon} className="h-8 w-8" />
                </span>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="hero">Active Group Batch</Badge>
                    <Badge variant="secondary">{offer.ageOrEducationLevel}</Badge>
                    <Badge variant="outline">{offer.duration}</Badge>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Program Overview
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {offer.description}
              </p>
            </Reveal>

            {/* Key Highlights */}
            <Reveal className="mt-10">
              <h3 className="text-xl font-bold text-foreground">Program Highlights</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {offer.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground/90 shadow-soft"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Structured Roadmap / Phases */}
            <Reveal className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Syllabus & Roadmap</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Structured progressive phases designed for deep mastery.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                  <Layers className="h-3.5 w-3.5" /> {offer.roadmap.length} Phases
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {offer.roadmap.map((phase, idx) => (
                  <div
                    key={phase.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-foreground">
                          {phase.phase}: {phase.title}
                        </h4>
                      </div>
                    </div>

                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {phase.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>

                    {phase.outcome && (
                      <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-foreground/80 flex items-start gap-2">
                        <Award className="h-4 w-4 shrink-0 text-gold-foreground mt-0.5" />
                        <span><strong>Milestone Outcome:</strong> {phase.outcome}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Who is this for & Prerequisites */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft h-full">
                  <h3 className="text-lg font-bold text-foreground">Who this is for</h3>
                  <ul className="mt-4 space-y-2.5">
                    {offer.idealFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft h-full">
                  <h3 className="text-lg font-bold text-foreground">Prerequisites</h3>
                  <ul className="mt-4 space-y-2.5">
                    {offer.prerequisites.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Free Demo Trial Disclosure */}
            <Reveal className="mt-10">
              <div className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-gold-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Free Demo Trial Session Available
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      We offer a complimentary trial demo class so students and parents can experience our live interactive teaching environment, mentor style, and curriculum firsthand before enrolling. The full program is a structured paid monthly course.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sticky Enrollment Sidebar */}
          <Reveal delay={120} className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="hero" className="text-xs">
                  Active Live Batch
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-foreground">
                  <Sparkles className="h-3 w-3" /> Free Demo
                </span>
              </div>

              {/* Pricing Callout */}
              <div className="mt-5 rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Current Group Cohort Fee</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground line-through">
                    Rs {offer.regularFee.toLocaleString()}/{offer.billingPeriod}
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">
                    Rs {offer.offerFee.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">/{offer.billingPeriod}</span>
                </div>
                <p className="mt-2 text-[11px] leading-tight text-gold-foreground font-medium">
                  {offer.paidNote}
                </p>
              </div>

              <h3 className="mt-5 text-lg font-bold text-foreground">Enrol in {offer.title}</h3>

              <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>Duration:</strong> {offer.duration}</span>
                </li>
                {offer.classesPerWeek && (
                  <li className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>Frequency:</strong> {offer.classesPerWeek}</span>
                  </li>
                )}
                {offer.sessionDuration && (
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>Session:</strong> {offer.sessionDuration}</span>
                  </li>
                )}
                <li className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>Format:</strong> {offer.format}</span>
                </li>
              </ul>

              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-[11px] text-muted-foreground">
                <p><strong>Next Schedule:</strong> {offer.scheduleNote}</p>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-2.5">
                <Button asChild variant="hero" size="lg" className="w-full">
                  <Link
                    to="/apply"
                    search={{
                      type: "Live Group Offer",
                      selected: offer.title,
                    }}
                  >
                    Apply for this Batch <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full">
                  <a href={whatsappLink(whatsappInquiryText)} target="_blank" rel="noopener noreferrer">
                    <Sparkles className="h-4 w-4 text-gold-foreground" /> Book Free Demo on WhatsApp
                  </a>
                </Button>

                <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                  <a href={whatsappLink(whatsappInquiryText)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" /> Have questions? Ask on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Other Active Batches */}
      {relatedOffers.length > 0 && (
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
            <h2 className="text-2xl font-bold text-foreground">Other Active Live Batches</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore our other scheduled group programs currently open for registration.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {relatedOffers.map((o) => (
                <LiveOfferCard key={o.slug} offer={o} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />
    </>
  );
}
