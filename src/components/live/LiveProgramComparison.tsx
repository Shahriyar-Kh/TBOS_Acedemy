import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import type { LiveOffer } from "@/data/liveOffers";

export function LiveProgramComparison({ offers }: { offers: LiveOffer[] }) {
  const comparisonRows = [
    {
      label: "Best For",
      getValue: (o: LiveOffer) => o.audience,
    },
    {
      label: "Target Level",
      getValue: (o: LiveOffer) => o.ageOrEducationLevel,
    },
    {
      label: "Program Duration",
      getValue: (o: LiveOffer) => o.duration,
    },
    {
      label: "Class Frequency",
      getValue: (o: LiveOffer) => o.classesPerWeek || "Scheduled weekly",
    },
    {
      label: "Session Duration",
      getValue: (o: LiveOffer) => o.sessionDuration || "1 hour",
    },
    {
      label: "Format",
      getValue: (o: LiveOffer) => o.format,
    },
    {
      label: "Core Focus",
      getValue: (o: LiveOffer) => o.tagline,
    },
    {
      label: "Current Monthly Fee",
      getValue: (o: LiveOffer) => {
        const fee =
          typeof o.offerFee === "number" ? o.offerFee.toLocaleString() : (o.offerFee ?? "0");
        return `Rs ${fee} / ${o.billingPeriod}`;
      },
    },
    {
      label: "Free Demo Trial",
      getValue: (_o: LiveOffer) => "1 Complimentary live session before enrollment",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl container-px py-16 sm:py-20 border-t border-border/60">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            TRANSPARENT PROGRAM DIRECTORY
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Which Live Program Fits You?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Compare our 3 scheduled live group programs side-by-side to find the right curriculum,
            intensity, and timeline for your goals.
          </p>
        </div>
      </Reveal>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid grid-cols-4 border-b border-border bg-muted/40 p-5 text-sm font-bold text-foreground">
          <div className="text-muted-foreground uppercase text-xs tracking-wider">
            Feature / Metric
          </div>
          {offers.map((offer) => (
            <div key={offer.slug} className="text-center px-2">
              <h3 className="font-bold text-foreground text-sm">{offer.title}</h3>
              <p className="mt-1 text-xs font-normal text-gold-foreground line-clamp-1">
                {offer.shortTitle}
              </p>
            </div>
          ))}
        </div>

        <div className="divide-y divide-border/60">
          {comparisonRows.map((row, idx) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 p-4 text-xs transition-colors hover:bg-muted/20 ${
                idx % 2 === 0 ? "bg-card" : "bg-muted/10"
              }`}
            >
              <div className="font-semibold text-foreground flex items-center pr-4">
                {row.label}
              </div>
              {offers.map((offer) => (
                <div
                  key={offer.slug}
                  className="px-2 text-center flex items-center justify-center text-muted-foreground leading-relaxed"
                >
                  {row.label === "Free Demo Trial" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-success">
                      <Check className="h-3.5 w-3.5" /> 1 Trial Session
                    </span>
                  ) : (
                    row.getValue(offer)
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Action Row */}
          <div className="grid grid-cols-4 p-5 bg-muted/30">
            <div className="flex items-center font-semibold text-xs text-muted-foreground">
              Program Details
            </div>
            {offers.map((offer) => (
              <div key={offer.slug} className="px-2 flex flex-col gap-2">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
                    View Program <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
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
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Stacked Cards */}
      <div className="lg:hidden space-y-6">
        {offers.map((offer) => {
          const feeStr =
            typeof offer.offerFee === "number"
              ? offer.offerFee.toLocaleString()
              : (offer.offerFee ?? "0");
          return (
            <div
              key={offer.slug}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4"
            >
              <div className="border-b border-border/60 pb-3">
                <span className="text-[11px] font-mono uppercase text-primary font-semibold">
                  {offer.format}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{offer.title}</h3>
                <p className="text-xs text-gold-foreground font-medium mt-1">{offer.tagline}</p>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Audience</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{offer.audience}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{offer.duration}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Schedule</dt>
                  <dd className="font-semibold text-foreground mt-0.5">
                    {offer.classesPerWeek || "Scheduled batches"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Monthly Fee</dt>
                  <dd className="font-extrabold text-foreground mt-0.5">
                    Rs {feeStr} /{offer.billingPeriod}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Free Demo</dt>
                  <dd className="font-semibold text-success mt-0.5 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> 1 Trial session before enrollment
                  </dd>
                </div>
              </dl>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-border/60">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link to="/live-batches/$slug" params={{ slug: offer.slug }}>
                    View Program & Roadmap
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link
                    to="/free-demo"
                    search={{
                      type: "Live Group Offer",
                      selected: offer.title,
                    }}
                  >
                    Request Free Demo
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
