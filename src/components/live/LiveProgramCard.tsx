import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LiveOffer } from "@/data/liveOffers";
import { getLiveProgramVisual } from "@/data/liveProgramVisuals";
import { whatsappLink } from "@/data/site";

export function LiveProgramCard({ offer }: { offer: LiveOffer }) {
  const visual = getLiveProgramVisual(offer.slug);
  const whatsappUrl = whatsappLink(visual.whatsappMessage);

  const regularFeeStr =
    typeof offer.regularFee === "number"
      ? offer.regularFee.toLocaleString()
      : (offer.regularFee ?? "0");
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  return (
    <article
      data-live-program-card
      data-live-offer
      className={`group relative flex min-w-0 w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 ${visual.accentClasses.borderGlow} hover:shadow-card`}
    >
      {/* Top Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-deep">
        <img
          src={visual.image}
          alt={visual.imageAlt}
          width={visual.width}
          height={visual.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge
            variant="default"
            className={`${visual.accentClasses.badgeBg} ${visual.accentClasses.badgeText} border border-white/10 text-xs font-semibold backdrop-blur-md`}
          >
            {visual.badge}
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-0.5 text-[11px] font-bold text-navy-deep shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Free Demo
          </span>
        </div>

        {/* Bottom Headline on Image */}
        <div className="absolute bottom-3 left-4 right-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
            {offer.classesPerWeek || "Live Online Cohort"}
          </span>
          <h3 className="mt-0.5 font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
              {offer.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold text-gold-foreground">{offer.tagline}</p>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {offer.summary}
          </p>

          {/* Quick Specifications */}
          <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs text-foreground/80">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">
                <strong>Audience:</strong> {offer.audience}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                <strong>Duration:</strong> {offer.duration}
              </span>
            </div>
            {offer.classesPerWeek && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  <strong>Schedule:</strong> {offer.classesPerWeek}
                  {offer.sessionDuration ? ` (${offer.sessionDuration})` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Transparent Monthly Pricing Box */}
          <div className="mt-4 rounded-xl border border-border bg-background/80 p-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Monthly Fee:</span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground line-through mr-2">
                  Rs {regularFeeStr}/{offer.billingPeriod}
                </span>
                <span className="text-base font-extrabold text-foreground">
                  Rs {offerFeeStr}
                  <span className="text-xs font-normal text-muted-foreground">
                    /{offer.billingPeriod}
                  </span>
                </span>
              </div>
            </div>
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
              {offer.freeDemoNote}
            </p>
          </div>

          {/* Key Syllabus Highlights */}
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            {offer.highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-col gap-2 pt-3 border-t border-border/60">
          <Button asChild variant="default" size="sm" className="w-full">
            <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
              View Program & Roadmap <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
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
            <Button asChild variant="secondary" size="sm">
              <Link
                to="/free-demo"
                search={{
                  type: "Live Group Offer",
                  selected: offer.title,
                }}
              >
                <Sparkles className="h-3 w-3 mr-1 text-gold-foreground" /> Free Demo
              </Link>
            </Button>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5 text-success" />
            Have questions? Ask Admissions on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
