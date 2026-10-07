import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { HomeImage } from "@/components/home/HomeImage";
import { SectionIntro } from "@/components/home/HomeSections";
import { getLiveOfferVisual } from "@/data/homepage";
import { activeLiveOffers, type LiveOffer } from "@/data/liveOffers";

// Deterministic across server and browser (avoids hydration mismatches from locale formatting).
const money = (value: number) => `Rs ${value.toLocaleString("en-US")}`;

function ProgramCard({ offer }: { offer: LiveOffer }) {
  const visual = getLiveOfferVisual(offer.slug);
  const schedule = [offer.classesPerWeek, offer.sessionDuration].filter(Boolean).join(" · ");

  const specs: { icon: typeof Clock; label: string; value: string }[] = [
    { icon: Radio, label: "Delivery", value: offer.format },
    { icon: Clock, label: "Duration", value: offer.duration },
    ...(schedule ? [{ icon: Calendar, label: "Schedule", value: schedule }] : []),
    { icon: Users, label: "Best for", value: offer.audience },
  ];

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-primary-foreground/10 bg-card shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/50 hover:shadow-card">
      {/* Visual header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-hero">
        <HomeImage
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 46vw, 92vw"
          className={`h-full w-full object-cover ${visual.objectPosition ?? "object-center"} transition-transform duration-700 group-hover:scale-105`}
          fallback={<Icon name={offer.icon} className="h-14 w-14 text-cyan/60" />}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/30 to-transparent"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Live Group Batch
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-gold-foreground shadow-sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Free Demo
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
          <span className="glass grid h-11 w-11 shrink-0 place-items-center rounded-xl text-cyan transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <Icon name={offer.icon} className="h-5 w-5" />
          </span>
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Clock className="h-3.5 w-3.5 text-cyan" aria-hidden="true" /> {offer.duration}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-extrabold leading-snug tracking-tight text-foreground">
          <Link
            to="/live-batches/$slug"
            params={{ slug: offer.slug }}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {offer.title}
          </Link>
        </h3>

        <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-gold-foreground">
          <Target className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{offer.tagline}</span>
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {offer.summary}
        </p>

        <dl className="mt-5 space-y-2.5 rounded-2xl bg-muted/60 p-4 text-xs">
          {specs.map(({ icon: SpecIcon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <SpecIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <dt className="w-16 shrink-0 font-semibold text-foreground">{label}</dt>
              <dd className="min-w-0 text-foreground/80">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Fee */}
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Group offer fee
              </p>
              <p className="mt-0.5 font-display text-2xl font-extrabold text-foreground">
                {money(offer.offerFee)}
                <span className="text-xs font-medium text-muted-foreground">
                  {" "}
                  / {offer.billingPeriod}
                </span>
              </p>
            </div>
            <p className="pb-1 text-xs text-muted-foreground">
              Regular <span className="line-through">{money(offer.regularFee)}</span>
            </p>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            <span>{offer.freeDemoNote}. The Free Demo is a trial session only.</span>
          </p>
          <p className="mt-1.5 pl-5 text-[11px] leading-snug text-muted-foreground">
            {offer.paidNote}.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button asChild size="lg" className="group/cta w-full font-semibold active:scale-[0.98]">
            <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
              View Program & Roadmap
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="hero" size="lg" className="font-semibold active:scale-[0.98]">
              <Link to="/apply" search={{ type: "Live Group Offer", selected: offer.title }}>
                Apply Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-semibold active:scale-[0.98]"
            >
              <Link to="/free-demo" search={{ type: "Live Group Offer", selected: offer.title }}>
                Free Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LiveProgramsSection() {
  return (
    <section
      id="live-programs"
      className="relative isolate scroll-mt-20 overflow-hidden bg-gradient-hero"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-tech-grid mask-fade-radial opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 -z-10 h-80 w-80 animate-orb rounded-full bg-cyan/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 animate-orb rounded-full bg-gold/15 blur-3xl [animation-delay:-9s]"
      />

      <div className="mx-auto max-w-7xl container-px py-20 sm:py-24">
        <SectionIntro
          light
          eyebrow="Scheduled cohorts"
          title="Current Live Group Programs"
          description="Join active group cohorts with live interactive instruction and step-by-step milestones. Every program offers a Free Demo trial session before you commit."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activeLiveOffers.map((offer, i) => (
            <Reveal key={offer.slug} delay={i * 90} className="min-w-0">
              <ProgramCard offer={offer} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button
            asChild
            variant="outline-light"
            size="xl"
            className="group font-semibold active:scale-[0.98]"
          >
            <Link to="/live-batches">
              View All Live Batches
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
