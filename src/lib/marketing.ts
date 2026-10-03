type MetaEventData = Record<string, string | number | boolean>;

type MetaFbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: MetaFbq;
    __tbosMetaPixelInitialized?: string;
  }
}

const ATTRIBUTION_KEY = "tbos_marketing_attribution_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

type MarketingAttribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function getPixelId() {
  return (import.meta.env.VITE_META_PIXEL_ID || "").trim();
}

export function captureMarketingAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const attribution: MarketingAttribution = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, 120);
  }

  if (Object.keys(attribution).length > 0) {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }
}

export function getMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as MarketingAttribution) : {};
  } catch {
    return {};
  }
}

export function withMarketingAttribution(sourcePage: string) {
  const attribution = getMarketingAttribution();
  const params = new URLSearchParams();

  for (const key of UTM_KEYS) {
    const value = attribution[key];
    if (value) params.set(key, value);
  }

  const suffix = params.toString();
  if (!suffix) return sourcePage.slice(0, 100);
  return `${sourcePage} | ${suffix}`.slice(0, 100);
}

export function initMetaPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const pixelId = getPixelId();
  if (!pixelId) return false;
  if (window.__tbosMetaPixelInitialized === pixelId && window.fbq) return true;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    } as MetaFbq;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = (...args: unknown[]) => fbq(...args);
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  window.fbq?.("init", pixelId);
  window.__tbosMetaPixelInitialized = pixelId;
  return true;
}

function trackMeta(eventName: "PageView" | "ViewContent" | "Lead", data?: MetaEventData) {
  if (!initMetaPixel() || !window.fbq) return;
  if (data && Object.keys(data).length > 0) {
    window.fbq("track", eventName, data);
  } else {
    window.fbq("track", eventName);
  }
}

export function trackMetaPageView() {
  trackMeta("PageView");
}

export function trackMetaViewContent({
  contentName,
  contentCategory,
  value,
  currency = "PKR",
}: {
  contentName: string;
  contentCategory: string;
  value?: number;
  currency?: string;
}) {
  trackMeta("ViewContent", {
    content_name: contentName,
    content_category: contentCategory,
    ...(typeof value === "number" ? { value } : {}),
    currency,
  });
}

export function trackMetaLead({
  leadType,
  contentName,
}: {
  leadType: "contact" | "application" | "free_demo";
  contentName?: string;
}) {
  trackMeta("Lead", {
    lead_type: leadType,
    ...(contentName ? { content_name: contentName } : {}),
  });
}
