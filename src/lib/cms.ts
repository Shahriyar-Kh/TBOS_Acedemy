import { z } from "zod";
import type { Course, CourseCategory } from "@/data/courses";
import type { Specialization } from "@/data/specializations";
import type { LiveOffer, OfferRoadmapPhase } from "@/data/liveOffers";
import type { TutoringSubject, TutoringCategory } from "@/data/tutoring";

export type CmsContentKind = "courses" | "specializations" | "live-offers" | "tutoring";

// Common base fields in CMS database
export interface CmsBaseRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsCourseRecord extends CmsBaseRecord {
  category: CourseCategory;
  level: string;
  duration: string;
  mode: string;
  tagline: string;
  description: string;
  outcomes: string[];
  curriculum: string[];
  audience: string;
  prerequisites?: string | null;
  price_note: string;
  icon: string;
  keywords: string[];
}

export interface CmsSpecializationRecord extends CmsBaseRecord {
  category: string;
  tagline: string;
  description: string;
  duration: string;
  level: string;
  modules: string[];
  outcomes: string[];
  careers: string[];
  icon: string;
  keywords: string[];
  monthly_price?: number | null;
  full_price?: number | null;
  upfront_discount_enabled: boolean;
  upfront_discount_percent: number;
}

export interface CmsLiveOfferRecord extends CmsBaseRecord {
  short_title: string;
  status: "active" | "upcoming" | "archived";
  audience: string;
  age_or_education_level: string;
  duration: string;
  classes_per_week?: string | null;
  session_duration?: string | null;
  format: string;
  regular_fee: number;
  offer_fee: number;
  currency: string;
  billing_period: string;
  free_demo: boolean;
  free_demo_note: string;
  paid_note: string;
  schedule_note: string;
  tagline: string;
  description: string;
  highlights: string[];
  roadmap: OfferRoadmapPhase[];
  prerequisites: string[];
  ideal_for: string[];
  icon: string;
  keywords: string[];
}

export interface CmsTutoringRecord extends CmsBaseRecord {
  category: TutoringCategory;
  level: string;
  audience: string;
  topics: string[];
  icon: string;
  keywords: string[];
  delivery_options: string;
  pricing_notes: string;
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const slugRegex = /^[a-z0-9-]+$/;

export const cmsCourseSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().trim().min(2).max(150),
  category: z.enum(["Programming", "Web Development", "Computer Science", "Database", "Data & AI"]),
  level: z.string().trim().min(2).max(50),
  duration: z.string().trim().min(2).max(50),
  mode: z.string().trim().max(150).default("Live online · One-to-one available · Group batches when scheduled"),
  tagline: z.string().trim().max(250).default(""),
  summary: z.string().trim().min(10).max(1000),
  description: z.string().trim().min(10),
  outcomes: z.array(z.string().trim()).default([]),
  curriculum: z.array(z.string().trim()).default([]),
  audience: z.string().trim().max(250).default(""),
  prerequisites: z.string().trim().max(250).optional().nullable(),
  price_note: z.string().trim().max(100).default("Affordable fee · Flexible monthly/one-time plan"),
  icon: z.string().trim().max(50).default("Code2"),
  keywords: z.array(z.string().trim()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  seo_title: z.string().trim().max(150).optional().nullable(),
  seo_description: z.string().trim().max(300).optional().nullable(),
});

export const cmsCoursePatchSchema = cmsCourseSchema.partial();

export const cmsSpecializationSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().trim().min(2).max(150),
  category: z.string().trim().max(50).default("Specialization"),
  tagline: z.string().trim().max(250).default(""),
  summary: z.string().trim().min(10).max(1000),
  description: z.string().trim().min(10),
  duration: z.string().trim().min(2).max(50),
  level: z.string().trim().max(50).default("Beginner to Advanced"),
  modules: z.array(z.string().trim()).default([]),
  outcomes: z.array(z.string().trim()).default([]),
  careers: z.array(z.string().trim()).default([]),
  icon: z.string().trim().max(50).default("Layers"),
  keywords: z.array(z.string().trim()).default([]),
  monthly_price: z.number().nonnegative().optional().nullable(),
  full_price: z.number().nonnegative().optional().nullable(),
  upfront_discount_enabled: z.boolean().default(false),
  upfront_discount_percent: z.number().int().min(0).max(100).default(20),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  seo_title: z.string().trim().max(150).optional().nullable(),
  seo_description: z.string().trim().max(300).optional().nullable(),
});

export const cmsSpecializationPatchSchema = cmsSpecializationSchema.partial();

export const cmsLiveOfferSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().trim().min(2).max(150),
  short_title: z.string().trim().min(2).max(100),
  status: z.enum(["active", "upcoming", "archived"]).default("active"),
  audience: z.string().trim().min(2).max(100),
  age_or_education_level: z.string().trim().min(2).max(150),
  duration: z.string().trim().min(2).max(50),
  classes_per_week: z.string().trim().max(50).optional().nullable(),
  session_duration: z.string().trim().max(50).optional().nullable(),
  format: z.string().trim().max(100).default("Live Online Interactive Cohort"),
  regular_fee: z.number().nonnegative(),
  offer_fee: z.number().nonnegative(),
  currency: z.string().trim().max(10).default("PKR"),
  billing_period: z.string().trim().max(50).default("month"),
  free_demo: z.boolean().default(true),
  free_demo_note: z.string().trim().max(250).default("Free trial demo session available before enrollment"),
  paid_note: z.string().trim().max(250).default("Full program is paid monthly at the group offer rate"),
  schedule_note: z.string().trim().max(250).default("Contact admissions for next confirmed batch schedule"),
  tagline: z.string().trim().max(250).default(""),
  summary: z.string().trim().min(10).max(1000),
  description: z.string().trim().min(10),
  highlights: z.array(z.string().trim()).default([]),
  roadmap: z.array(z.any()).default([]),
  prerequisites: z.array(z.string().trim()).default([]),
  ideal_for: z.array(z.string().trim()).default([]),
  icon: z.string().trim().max(50).default("Sparkles"),
  keywords: z.array(z.string().trim()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  seo_title: z.string().trim().max(150).optional().nullable(),
  seo_description: z.string().trim().max(300).optional().nullable(),
});

export const cmsLiveOfferPatchSchema = cmsLiveOfferSchema.partial();

export const cmsTutoringSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().trim().min(2).max(150),
  category: z.enum(["Academic", "Quran & Islamic Studies"]),
  level: z.string().trim().min(2).max(100),
  summary: z.string().trim().min(10).max(1000),
  audience: z.string().trim().max(250).default(""),
  topics: z.array(z.string().trim()).default([]),
  icon: z.string().trim().max(50).default("BookOpen"),
  keywords: z.array(z.string().trim()).default([]),
  delivery_options: z.string().trim().max(150).default("One-to-One Private Tuition & Small Custom Batches"),
  pricing_notes: z.string().trim().max(150).default("Customized hourly or monthly packages available"),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  seo_title: z.string().trim().max(150).optional().nullable(),
  seo_description: z.string().trim().max(300).optional().nullable(),
});

export const cmsTutoringPatchSchema = cmsTutoringSchema.partial();

// ==========================================
// CONVERTERS: Database Record -> Component Object
// ==========================================

export function mapCmsCourseToCourse(row: CmsCourseRecord): Course {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    duration: row.duration,
    mode: row.mode,
    tagline: row.tagline,
    summary: row.summary,
    description: row.description,
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
    curriculum: Array.isArray(row.curriculum) ? row.curriculum : [],
    audience: row.audience,
    prerequisites: row.prerequisites || undefined,
    priceNote: row.price_note,
    icon: row.icon,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    featured: row.featured,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}

export function mapCmsSpecializationToSpec(row: CmsSpecializationRecord): Specialization {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    summary: row.summary,
    description: row.description,
    duration: row.duration,
    level: row.level,
    modules: Array.isArray(row.modules) ? row.modules : [],
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
    careers: Array.isArray(row.careers) ? row.careers : [],
    icon: row.icon,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    featured: row.featured,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}

export function mapCmsLiveOfferToOffer(row: CmsLiveOfferRecord): LiveOffer {
  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    status: row.status,
    audience: row.audience,
    ageOrEducationLevel: row.age_or_education_level,
    duration: row.duration,
    classesPerWeek: row.classes_per_week ?? undefined,
    sessionDuration: row.session_duration ?? undefined,
    format: row.format,
    regularFee: row.regular_fee,
    offerFee: row.offer_fee,
    currency: row.currency,
    billingPeriod: row.billing_period,
    freeDemo: row.free_demo,
    freeDemoNote: row.free_demo_note,
    paidNote: row.paid_note,
    scheduleNote: row.schedule_note,
    tagline: row.tagline,
    summary: row.summary,
    description: row.description,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    roadmap: Array.isArray(row.roadmap) ? row.roadmap : [],
    prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
    idealFor: Array.isArray(row.ideal_for) ? row.ideal_for : [],
    icon: row.icon,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    featured: row.featured,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}

export function mapCmsTutoringToSubject(row: CmsTutoringRecord): TutoringSubject {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    summary: row.summary,
    audience: row.audience,
    topics: Array.isArray(row.topics) ? row.topics : [],
    icon: row.icon,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    featured: row.featured,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}
