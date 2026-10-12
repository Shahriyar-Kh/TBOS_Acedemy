import { articles } from "../src/data/articles";
import { courses } from "../src/data/courses";
import { liveOffers } from "../src/data/liveOffers";
import { seoPages } from "../src/data/seoPages";
import { specializations } from "../src/data/specializations";
import { tutoringSubjects } from "../src/data/tutoring";

export const coreStaticRoutes = [
  "/",
  "/about",
  "/how-it-works",
  "/for-students",
  "/for-parents",
  "/courses",
  "/live-batches",
  "/specializations",
  "/tutoring",
  "/apply",
  "/free-demo",
  "/contact",
  "/testimonials",
  "/faq",
  "/blog",
  "/privacy",
  "/terms",
] as const;

export const indexableHtmlRoutes = [
  ...coreStaticRoutes,
  ...courses.map((course) => `/courses/${course.slug}`),
  ...specializations.map((specialization) => `/specializations/${specialization.slug}`),
  ...liveOffers.map((offer) => `/live-batches/${offer.slug}`),
  ...tutoringSubjects.map((subject) => `/tutoring/${subject.slug}`),
  ...seoPages.map((page) => `/${page.slug}`),
  ...articles.map((article) => `/blog/${article.slug}`),
];

export const auditedPublicEndpoints = [...indexableHtmlRoutes, "/sitemap.xml"];
