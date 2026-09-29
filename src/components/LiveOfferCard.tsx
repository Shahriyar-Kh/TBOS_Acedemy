import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, Users, Calendar, Sparkles, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import type { LiveOffer } from "@/data/liveOffers";
import { whatsappLink } from "@/data/site";

export function LiveOfferCard({ offer }: { offer: LiveOffer }) {
  const whatsappDemoText = `Hello TechBuilt Open School, I would like information about the ${offer.title} live group program and Free Demo.`;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card">
      <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20" />

      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Icon name={offer.icon} className="h-6 w-6" />
          </span>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="hero" className="text-xs font-semibold">
              Live Group Batch
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold-foreground">
              <Sparkles className="h-3 w-3" /> Free Demo
            </span>
          </div>
        </div>

        <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
            {offer.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-medium text-gold-foreground">{offer.tagline}</p>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {offer.summary}
        </p>

        {/* Program Specs */}
        <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs text-foreground/80">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate"><strong>Audience:</strong> {offer.audience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span><strong>Duration:</strong> {offer.duration}</span>
          </div>
          {offer.classesPerWeek && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span><strong>Schedule:</strong> {offer.classesPerWeek} ({offer.sessionDuration})</span>
            </div>
          )}
        </div>

        {/* Pricing display */}
        <div className="mt-5 rounded-xl border border-border bg-background p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Monthly Fee:</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground line-through mr-2">
                Rs {offer.regularFee.toLocaleString()}/{offer.billingPeriod}
              </span>
              <span className="text-base font-extrabold text-foreground">
                Rs {offer.offerFee.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground">/{offer.billingPeriod}</span>
              </span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {offer.freeDemoNote}
          </p>
        </div>

        {/* Highlights */}
        <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
          {offer.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-border/60">
        <Button asChild variant="hero" size="sm" className="w-full">
          <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
            View Full Program & Roadmap <ArrowRight className="h-3.5 w-3.5" />
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
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <a
              href={whatsappLink(whatsappDemoText)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> Free Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
