import { MessageCircle } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRouteWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const location = useLocation();
  const [hasStickyCtaInDom, setHasStickyCtaInDom] = useState(false);

  useEffect(() => {
    const checkSticky = () => {
      const el = document.querySelector(
        '[data-sticky-cta="true"], [data-mobile-sticky-cta="true"]',
      );
      setHasStickyCtaInDom(!!el);
    };
    checkSticky();

    const timer = setTimeout(checkSticky, 100);

    const observer = new MutationObserver(checkSticky);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  // Hide floating WhatsApp button on mobile widths below 768px (< md:) when on live-batch detail pages
  // (which feature a fixed bottom sticky CTA bar), or dynamically when any sticky CTA exists.
  const isLiveBatchDetail = /^\/live-batches\/[^/]+$/.test(location.pathname);
  const shouldHideOnMobile = isLiveBatchDetail || hasStickyCtaInDom;

  const whatsappHref = getRouteWhatsAppLink(location.pathname);

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-testid="floating-whatsapp-btn"
      className={cn(
        "fixed bottom-5 right-5 z-50 h-14 w-14 place-items-center rounded-full bg-success text-success-foreground shadow-card transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        shouldHideOnMobile ? "hidden md:grid" : "grid",
      )}
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-success/40" />
    </a>
  );
}
