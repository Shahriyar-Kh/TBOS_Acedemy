import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  getMarketingConsent,
  isMetaPixelConfigured,
  setMarketingConsent,
  trackMetaPageView,
} from "@/lib/marketing";

export function MarketingConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isMetaPixelConfigured() && getMarketingConsent() === null);
  }, []);

  if (!isVisible) return null;

  return (
    <section
      aria-label="Optional marketing cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-border bg-background/95 p-4 shadow-card backdrop-blur-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold text-foreground">Your privacy, your choice</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            We use an optional Meta Pixel to measure marketing campaigns. It stays off unless you
            allow it. Essential site features work either way. Read our{" "}
            <Link to="/privacy" className="font-medium text-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMarketingConsent("denied");
              setIsVisible(false);
            }}
          >
            No thanks
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setMarketingConsent("granted");
              setIsVisible(false);
              trackMetaPageView();
            }}
          >
            Allow marketing
          </Button>
        </div>
      </div>
    </section>
  );
}
