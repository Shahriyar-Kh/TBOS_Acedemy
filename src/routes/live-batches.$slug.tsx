import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CheckCircle2,
  Code2,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { LiveProgramHero } from "@/components/live/LiveProgramHero";
import { LiveProgramFacts } from "@/components/live/LiveProgramFacts";
import { LiveProgramRoadmap } from "@/components/live/LiveProgramRoadmap";
import { LiveProgramExperience } from "@/components/live/LiveProgramExperience";
import { LiveProgramFAQ } from "@/components/live/LiveProgramFAQ";
import { LiveProgramMobileCTA } from "@/components/live/LiveProgramMobileCTA";
import { LiveProgramCard } from "@/components/live/LiveProgramCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { getLiveOffer, activeLiveOffers } from "@/data/liveOffers";
import { getLiveProgramVisual } from "@/data/liveProgramVisuals";
import { getCmsLiveOfferBySlugFn } from "@/lib/cmsFunctions";
import { buildMeta, courseJsonLd } from "@/lib/seo";
import { site, whatsappLink } from "@/data/site";
import { trackMetaViewContent } from "@/lib/marketing";

export const Route = createFileRoute("/live-batches/$slug")({
  loader: async ({ params }) => {
    let offer = null;
    try {
      offer = await getCmsLiveOfferBySlugFn({ data: params.slug });
    } catch {
      offer = getLiveOffer(params.slug);
    }
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    const offer = loaderData?.offer;
    if (!offer) {
      return { meta: buildMeta({ title: "Live Batch", description: "Program details." }) };
    }
    const visual = getLiveProgramVisual(offer.slug);
    const title =
      offer.seoTitle || `${offer.title} | Live Group Online Cohort | TechBuilt Open School`;
    const feeStr =
      typeof offer.offerFee === "number"
        ? offer.offerFee.toLocaleString()
        : (offer.offerFee ?? "0");
    const description =
      offer.seoDescription ||
      `${offer.summary} Current offer: Rs ${feeStr}/${offer.billingPeriod}. Free Demo session available.`;

    return {
      meta: buildMeta({
        title,
        description,
        keywords: offer.keywords,
        type: "article",
        path: `/live-batches/${offer.slug}`,
        image: visual.image,
      }),
      links: [{ rel: "canonical", href: `${site.url}/live-batches/${offer.slug}` }],
      scripts: [courseJsonLd(offer.title, offer.summary)],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Program not found</h1>
      <p className="mt-3 text-muted-foreground">
        The live group program you're looking for doesn't exist.
      </p>
      <Button asChild className="mt-6">
        <Link to="/live-batches">Browse all live batches</Link>
      </Button>
    </div>
  ),
  component: LiveOfferDetail,
});

export function LiveOfferDetail() {
  const { offer } = Route.useLoaderData();
  const visual = getLiveProgramVisual(offer.slug);
  const relatedOffers = activeLiveOffers.filter((o) => o.slug !== offer.slug);

  useEffect(() => {
    trackMetaViewContent({
      contentName: offer.title,
      contentCategory: "Live Group Offer",
      value: typeof offer.offerFee === "number" ? offer.offerFee : undefined,
      currency: offer.currency,
    });
  }, [offer.currency, offer.offerFee, offer.slug, offer.title]);

  const regularFeeStr =
    typeof offer.regularFee === "number"
      ? offer.regularFee.toLocaleString()
      : (offer.regularFee ?? "0");
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  const whatsappInquiryText = visual.whatsappMessage;

  return (
    <>
      {/* 1. Premium Conversion Hero with Single Semantic H1 */}
      <LiveProgramHero offer={offer} />

      {/* 2. Quick Fact Strip */}
      <LiveProgramFacts offer={offer} />

      {/* 3. Program Highlights & Capstone Project Direction */}
      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Program Highlights */}
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Code2 className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                    KEY CURRICULUM HIGHLIGHTS
                  </span>
                </div>

                <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {visual.highlightsTitle}
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {offer.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {offer.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Right: Capstone Direction & Real Software Building */}
          <Reveal delay={80}>
            <div className="rounded-2xl border border-border bg-gradient-soft p-6 sm:p-8 shadow-soft h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-gold-foreground">
                    <Award className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                    MILESTONE CAPSTONE
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {visual.capstoneProject.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {visual.capstoneProject.description}
                </p>

                <div className="mt-6 rounded-xl border border-primary/20 bg-background/80 p-4">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Verified Outcome
                  </span>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-foreground">
                    {visual.capstoneProject.milestone}
                  </p>
                </div>
              </div>

              {/* Free Demo Trial Reminder */}
              <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gold-foreground shrink-0" />
                  Free trial session before enrollment
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/free-demo"
                    search={{
                      type: "Live Group Offer",
                      selected: offer.title,
                    }}
                  >
                    Request Demo
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4. Full Structured Roadmap */}
        <LiveProgramRoadmap offer={offer} />

        {/* 5. Audience & Prerequisites */}
        <div className="grid gap-8 sm:grid-cols-2 pt-4">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft h-full">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                IDEAL CANDIDATES
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                Who this Cohort is For
              </h3>
              <ul className="mt-5 space-y-3">
                {offer.idealFor.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft h-full">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                STARTING REQUIREMENTS
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                Prerequisites & Preparation
              </h3>
              <ul className="mt-5 space-y-3">
                {offer.prerequisites.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* 6. Learning Experience Section */}
        <LiveProgramExperience />

        {/* 7. Transparent Pricing & Free Demo Breakdown */}
        <section className="py-12">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-card">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                    FEE TRANSPARENCY
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Monthly Group Cohort Tuition
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    The program fee shown is the current monthly group cohort fee. Before deciding
                    on paid enrollment, we invite students and parents to attend one complimentary
                    trial session.
                  </p>

                  <div className="mt-6 space-y-2.5 text-xs text-foreground/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>One trial/demo session included before enrollment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>Paid monthly at the current group cohort rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>Batch schedule confirmed directly with admissions</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Group Offer
                  </span>
                  <div className="mt-2 flex items-baseline justify-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      Rs {regularFeeStr}/{offer.billingPeriod}
                    </span>
                    <span className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                      Rs {offerFeeStr}
                    </span>
                    <span className="text-sm text-muted-foreground">/{offer.billingPeriod}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-gold-foreground">{offer.paidNote}</p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="hero" size="lg" className="flex-1 shadow-gold">
                      <Link
                        to="/apply"
                        search={{
                          type: "Live Group Offer",
                          selected: offer.title,
                        }}
                      >
                        Start Enrollment <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="flex-1">
                      <Link
                        to="/free-demo"
                        search={{
                          type: "Live Group Offer",
                          selected: offer.title,
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-1.5 text-gold-foreground" /> Request Demo
                      </Link>
                    </Button>
                  </div>

                  <a
                    href={whatsappLink(whatsappInquiryText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-success" />
                    Ask questions on WhatsApp with Admissions
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 8. Program FAQs */}
        <LiveProgramFAQ offer={offer} />
      </section>

      {/* 9. Related Live Programs */}
      {relatedOffers.length > 0 && (
        <section className="bg-muted/40 border-t border-border/60">
          <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
            <div className="mb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                OTHER ACTIVE COHORTS
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Explore Other Live Programs
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Scheduled group classes currently accepting students.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {relatedOffers.map((o) => (
                <LiveProgramCard key={o.slug} offer={o} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Global CTA Section */}
      <CtaSection />

      {/* 11. Mobile Sticky Conversion Bar */}
      <LiveProgramMobileCTA offer={offer} />
    </>
  );
}
