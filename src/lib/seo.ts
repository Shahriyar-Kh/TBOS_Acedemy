import { site } from "@/data/site";
import type { SeoPage } from "@/data/seoPages";

type MetaInput = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  keywords?: string[];
};

// Builds a consistent meta array for a route's head().
export function buildMeta({
  title,
  description,
  path,
  type = "website",
  image,
  keywords,
}: MetaInput) {
  const pageUrl = path ? new URL(path, site.url).toString() : undefined;
  const imageUrl = image ? new URL(image, site.url).toString() : undefined;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: site.fullName },
    ...(pageUrl ? [{ property: "og:url", content: pageUrl }] : []),
    { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (keywords && keywords.length) {
    meta.push({ name: "keywords", content: keywords.join(", ") });
  }
  if (imageUrl) {
    meta.push({ property: "og:image", content: imageUrl });
    meta.push({ name: "twitter:image", content: imageUrl });
  }
  return meta;
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    }),
  };
}

export function courseJsonLd(name: string, description: string) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      name,
      description,
      provider: {
        "@type": "EducationalOrganization",
        name: site.fullName,
      },
    }),
  };
}


export function canonicalLink(path: string) {
  return { rel: "canonical", href: new URL(path, site.url).toString() };
}

export function seoLandingHead(page: SeoPage) {
  const path = `/${page.slug}`;
  return {
    meta: buildMeta({
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      path,
    }),
    links: [canonicalLink(path)],
    scripts: [faqJsonLd(page.faqs)],
  };
}

export function adminNoIndexMeta(title = "TBOS Admin") {
  return [
    { title },
    { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" },
    { name: "googlebot", content: "noindex,nofollow,noarchive,nosnippet" },
  ];
}
