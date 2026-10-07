import { Clock, Calendar, Users, Monitor, DollarSign, BookOpen } from "lucide-react";
import type { LiveOffer } from "@/data/liveOffers";

export function LiveProgramFacts({ offer }: { offer: LiveOffer }) {
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  const facts = [
    {
      icon: Clock,
      label: "Duration",
      value: offer.duration,
    },
    {
      icon: Calendar,
      label: "Classes / Week",
      value: offer.classesPerWeek || "Scheduled Weekly",
    },
    {
      icon: BookOpen,
      label: "Session Length",
      value: offer.sessionDuration || "1 hour / session",
    },
    {
      icon: Monitor,
      label: "Learning Format",
      value: offer.format,
    },
    {
      icon: Users,
      label: "Target Audience",
      value: offer.audience,
    },
    {
      icon: DollarSign,
      label: "Monthly Fee",
      value: `Rs ${offerFeeStr} / ${offer.billingPeriod}`,
    },
  ];

  return (
    <section className="border-y border-border/60 bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl container-px">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => {
            const IconComp = fact.icon;
            return (
              <div
                key={fact.label}
                className="rounded-xl border border-border/80 bg-card p-3.5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-2 text-primary">
                  <IconComp className="h-4 w-4 shrink-0" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {fact.label}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-2">
                  {fact.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
