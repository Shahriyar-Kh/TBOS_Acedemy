import { site } from "@/data/site";
import { liveOffers, type LiveOffer } from "@/data/liveOffers";
import { specializations, type Specialization } from "@/data/specializations";
import { specializationRoadmaps } from "@/data/specializationRoadmaps";
import { courses, type Course } from "@/data/courses";
import { tutoringSubjects, type TutoringSubject } from "@/data/tutoring";

/**
 * Generates route-aware, program-specific WhatsApp messages and links.
 * All fees are read dynamically from canonical program data sources.
 */

export function getLiveBatchWhatsAppMessage(offer: LiveOffer): string {
  const feeStr = `${offer.currency} ${offer.offerFee.toLocaleString()}/${offer.billingPeriod}`;
  const titleLower = offer.title.toLowerCase();
  const programPhrase =
    titleLower.includes("program") || titleLower.includes("batch")
      ? `the ${offer.title}`
      : `the ${offer.title} Live Batch`;

  return [
    `Hello TechBuilt Open School, I’m interested in ${programPhrase} (${feeStr}). Please share the class schedule, admission process, and Free Demo details.`,
    "",
    `Program: ${offer.title}`,
    `Page: ${site.url}/live-batches/${offer.slug}`,
  ].join("\n");
}

export function getSpecializationWhatsAppMessage(spec: Specialization): string {
  const roadmap = specializationRoadmaps[spec.slug];
  const feeStr = roadmap?.oneToOneFee ? ` (${roadmap.oneToOneFee})` : "";
  const titleLower = spec.title.toLowerCase();
  const programPhrase = titleLower.includes("specialization")
    ? `the ${spec.title}`
    : `the ${spec.title} Specialization Track`;

  return [
    `Hello TechBuilt Open School, I’m interested in ${programPhrase}${feeStr}. Please share the duration, class schedule, admission process, and demo details.`,
    "",
    `Program: ${spec.title} Specialization`,
    `Page: ${site.url}/specializations/${spec.slug}`,
  ].join("\n");
}

export function getCourseWhatsAppMessage(course: Course): string {
  const titleLower = course.title.toLowerCase();
  const programPhrase = titleLower.includes("course") ? `the ${course.title}` : `the ${course.title} Course`;

  return [
    `Hello TechBuilt Open School, I’m interested in ${programPhrase}. Please share the roadmap, duration, class schedule, and enrollment details.`,
    "",
    `Program: ${course.title}`,
    `Page: ${site.url}/courses/${course.slug}`,
  ].join("\n");
}

export function getTutoringWhatsAppMessage(subject: TutoringSubject): string {
  const titleLower = subject.title.toLowerCase();
  const programPhrase = titleLower.includes("tutoring") ? subject.title : `${subject.title} Tutoring`;

  return [
    `Hello TechBuilt Open School, I’m interested in ${programPhrase}. Please share the curriculum, class schedule, admission process, and Free Demo details.`,
    "",
    `Program: ${subject.title} Tutoring`,
    `Page: ${site.url}/tutoring/${subject.slug}`,
  ].join("\n");
}

/**
 * Returns the program-specific or generic message for any given route pathname.
 */
export function getRouteWhatsAppMessage(pathname: string): string {
  // Strip trailing slash and query params if any
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Live batch detail: /live-batches/:slug
  const liveBatchMatch = cleanPath.match(/^\/live-batches\/([^/]+)$/);
  if (liveBatchMatch) {
    const slug = liveBatchMatch[1];
    const offer = liveOffers.find((o) => o.slug === slug);
    if (offer) {
      return getLiveBatchWhatsAppMessage(offer);
    }
  }

  // 2. Specialization detail: /specializations/:slug
  const specMatch = cleanPath.match(/^\/specializations\/([^/]+)$/);
  if (specMatch) {
    const slug = specMatch[1];
    const spec = specializations.find((s) => s.slug === slug);
    if (spec) {
      return getSpecializationWhatsAppMessage(spec);
    }
  }

  // 3. Single course detail: /courses/:slug
  const courseMatch = cleanPath.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const slug = courseMatch[1];
    const course = courses.find((c) => c.slug === slug);
    if (course) {
      return getCourseWhatsAppMessage(course);
    }
  }

  // 4. Tutoring subject detail: /tutoring/:slug
  const tutoringMatch = cleanPath.match(/^\/tutoring\/([^/]+)$/);
  if (tutoringMatch) {
    const slug = tutoringMatch[1];
    const subject = tutoringSubjects.find((t) => t.slug === slug);
    if (subject) {
      return getTutoringWhatsAppMessage(subject);
    }
  }

  // 5. Fallback for general pages (e.g. /, /about, /courses, /contact, etc.)
  return site.whatsappMessage;
}

/**
 * Returns the fully encoded WhatsApp link for any route or custom message.
 */
export function getRouteWhatsAppLink(pathnameOrMessage?: string): string {
  if (!pathnameOrMessage) {
    return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`;
  }

  // If argument begins with / or is a relative/absolute route, treat as pathname
  if (pathnameOrMessage.startsWith("/")) {
    const message = getRouteWhatsAppMessage(pathnameOrMessage);
    return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  // Otherwise treat as a custom message string
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(pathnameOrMessage)}`;
}

