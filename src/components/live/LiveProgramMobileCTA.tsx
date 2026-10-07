import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveOffer } from "@/data/liveOffers";

export function LiveProgramMobileCTA({ offer }: { offer: LiveOffer }) {
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  return (
    <div
      aria-label="Quick enrollment actions"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-card backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            Monthly Fee
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-foreground">Rs {offerFeeStr}</span>
            <span className="text-[10px] text-muted-foreground">/{offer.billingPeriod}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="h-9 px-3 text-xs">
            <Link
              to="/free-demo"
              search={{
                type: "Live Group Offer",
                selected: offer.title,
              }}
            >
              <Sparkles className="h-3 w-3 mr-1 text-gold-foreground" /> Demo
            </Link>
          </Button>

          <Button asChild variant="default" size="sm" className="h-9 px-3 text-xs">
            <Link
              to="/apply"
              search={{
                type: "Live Group Offer",
                selected: offer.title,
              }}
            >
              Apply <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
