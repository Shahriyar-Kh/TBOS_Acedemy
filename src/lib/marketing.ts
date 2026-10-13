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
    __tbosMarketingConsent?: MarketingConsent;
    __tbosMetaPixelInitialized?: string;
    __tbosLastPageView?: { key: string; at: number };
    __tbosLastViewContent?: { key: string; at: number };
  }
}

const ATTRIBUTION_KEY = "tbos_marketing_attribution_v1";
const MARKETING_CONSENT_KEY = "tbos_marketing_consent_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

type MarketingAttribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;
export type MarketingConsent = "granted" | "denied";

export function getMarketingConsent(): MarketingConsent | null {
  if (typeof window === "undefined") return null;
  if (window.__tbosMarketingConsent) return window.__tbosMarketingConsent;

  try {
    const stored = window.localStorage.getItem(MARKETING_CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      window.__tbosMarketingConsent = stored;
      return stored;
    }
  } catch {
    // Storage can be unavailable in hardened browser modes. Consent remains unset.
  }

  return null;
}

export function setMarketingConsent(consent: MarketingConsent) {
  if (typeof window === "undefined") return;
  window.__tbosMarketingConsent = consent;

  try {
    window.localStorage.setItem(MARKETING_CONSENT_KEY, consent);
  } catch {
    // The in-memory choice still applies for the current page session.
  }
}

function getPixelId() {
  return (import.meta.env.VITE_META_PIXEL_ID || "").trim();
}

export function isMetaPixelConfigured() {
  return Boolean(getPixelId());
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
  const compact = new URLSearchParams();
  const pairs: Array<[(typeof UTM_KEYS)[number], string]> = [
    ["utm_source", "s"],
    ["utm_medium", "m"],
    ["utm_campaign", "c"],
    ["utm_content", "v"],
  ];

  for (const [key, shortKey] of pairs) {
    const value = attribution[key];
    if (value) compact.set(shortKey, value.slice(0, 20));
  }

  const suffix = compact.toString();
  if (!suffix) return sourcePage.slice(0, 100);
  return `${sourcePage} | ${suffix}`.slice(0, 100);
}

export function initMetaPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (getMarketingConsent() !== "granted") return false;

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
  if (!initMetaPixel() || !window.fbq) return false;
  if (data && Object.keys(data).length > 0) {
    window.fbq("track", eventName, data);
  } else {
    window.fbq("track", eventName);
  }
  return true;
}

export function trackMetaPageView() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const key = `${window.location.pathname}${window.location.search}`;
  const previous = window.__tbosLastPageView;
  if (previous?.key === key && now - previous.at < 1000) return;
  if (trackMeta("PageView")) {
    window.__tbosLastPageView = { key, at: now };
  }
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
  if (typeof window === "undefined") return;
  const now = Date.now();
  const key = `${window.location.pathname}:${contentName}`;
  const previous = window.__tbosLastViewContent;
  if (previous?.key === key && now - previous.at < 1000) return;

  const tracked = trackMeta("ViewContent", {
    content_name: contentName,
    content_category: contentCategory,
    ...(typeof value === "number" ? { value } : {}),
    currency,
  });
  if (tracked) {
    window.__tbosLastViewContent = { key, at: now };
  }
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
