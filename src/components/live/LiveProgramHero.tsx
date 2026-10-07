import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import type { LiveOffer } from "@/data/liveOffers";
import { getLiveProgramVisual } from "@/data/liveProgramVisuals";
import { whatsappLink } from "@/data/site";

export function LiveProgramHero({ offer }: { offer: LiveOffer }) {
  const visual = getLiveProgramVisual(offer.slug);
  const whatsappUrl = whatsappLink(visual.whatsappMessage);

  const regularFeeStr =
    typeof offer.regularFee === "number"
      ? offer.regularFee.toLocaleString()
      : (offer.regularFee ?? "0");
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-20 lg:py-24">
      {/* Background technical motifs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full ${visual.accentClasses.glowBg} blur-3xl`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl container-px">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-primary-foreground/75"
        >
          <Link to="/" className="hover:text-cyan transition-colors">
            Home
          </Link>
          <span className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link to="/live-batches" className="hover:text-cyan transition-colors">
              Live Batches
            </Link>
          </span>
          <span className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-primary-foreground/95 font-medium">{offer.shortTitle}</span>
          </span>
        </nav>

        {/* 2-Column Desktop Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          {/* Left Column: Program Value Proposition & Scannable Facts */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge
                  variant="default"
                  className={`${visual.accentClasses.badgeBg} ${visual.accentClasses.badgeText} border border-white/10 text-xs font-semibold`}
                >
                  {visual.badge}
                </Badge>
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground/90">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan" />
                  {offer.ageOrEducationLevel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1 text-xs font-bold text-navy-deep shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Free Demo Available
                </span>
              </div>
            </Reveal>

            {/* H1 Headline */}
            <Reveal delay={60}>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {offer.title}
              </h1>
            </Reveal>

            {/* Tagline */}
            <Reveal delay={120}>
              <p className="mt-3 text-base font-medium text-gold sm:text-lg">{offer.tagline}</p>
            </Reveal>

            {/* Summary */}
            <Reveal delay={160}>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                {offer.summary}
              </p>
            </Reveal>

            {/* Program Scannable Metric Chips */}
            <Reveal delay={200}>
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {visual.heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="glass rounded-xl p-3 border border-white/10 bg-white/[0.04]"
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-primary-foreground/60">
                      {metric.label}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-primary-foreground">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Free Demo Trial Disclosure */}
            <Reveal delay={240}>
              <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-3.5 text-xs text-primary-foreground/90 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gold">Try One Live Session Before Enrolling: </strong>
                  <span>
                    Attend a complimentary trial session to understand the instructor, teaching
                    style, and interactive format before committing to paid monthly enrollment.
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={280}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild variant="hero" size="lg" className="shadow-gold">
                  <Link
                    data-program-apply
                    to="/apply"
                    search={{
                      type: "Live Group Offer",
                      selected: offer.title,
                    }}
                  >
                    Apply for this Batch <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-primary-foreground hover:bg-white/10"
                >
                  <Link
                    data-program-demo
                    to="/free-demo"
                    search={{
                      type: "Live Group Offer",
                      selected: offer.title,
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-gold" /> Request Free Demo
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-primary-foreground/80 hover:text-white hover:bg-white/5"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-1.5 text-success" /> Ask on WhatsApp
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Hero Visual & Enrollment Pricing Card */}
          <Reveal delay={150}>
            <div className="flex flex-col gap-5">
              {/* Unique Program Hero Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 bg-navy-deep shadow-2xl">
                <img
                  src={visual.image}
                  alt={visual.imageAlt}
                  width={visual.width}
                  height={visual.height}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="font-mono text-xs font-semibold text-cyan">{offer.format}</span>
                  <p className="text-xs text-primary-foreground/80 mt-0.5">{visual.tagline}</p>
                </div>
              </div>

              {/* Pricing & Enrollment Card */}
              <div className="rounded-2xl border border-white/15 bg-navy/90 p-5 backdrop-blur-xl shadow-card text-primary-foreground">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-primary-foreground/60">
                      Monthly Group Offer
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm text-primary-foreground/50 line-through">
                        Rs {regularFeeStr}/{offer.billingPeriod}
                      </span>
                      <span className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                        Rs {offerFeeStr}
                      </span>
                      <span className="text-xs text-primary-foreground/70">
                        /{offer.billingPeriod}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold">
                    <Sparkles className="h-3 w-3" /> Free Trial
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs text-primary-foreground/80">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/60">Schedule:</span>
                    <span className="font-medium text-white">
                      {offer.classesPerWeek || "Scheduled Weekly"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/60">Session Length:</span>
                    <span className="font-medium text-white">
                      {offer.sessionDuration || "1 hour"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/60">Next Cohort:</span>
                    <span className="font-medium text-gold">Confirmed with admissions</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <Button asChild variant="default" size="sm" className="w-full">
                    <Link
                      to="/apply"
                      search={{
                        type: "Live Group Offer",
                        selected: offer.title,
                      }}
                    >
                      Apply Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Link
                      to="/free-demo"
                      search={{
                        type: "Live Group Offer",
                        selected: offer.title,
                      }}
                    >
                      Free Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
