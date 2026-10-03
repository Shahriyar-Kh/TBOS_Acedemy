// Homepage curation (Phase 12A).
// The catalog (courses / specializations / live offers) stays the single source of truth.
// This file only decides WHICH records the homepage shows, and adds display-only tags
// that are taken from each record's real curriculum/modules.

import { courses, featuredCourses, type Course } from "@/data/courses";
import {
  specializations,
  featuredSpecializations,
  type Specialization,
} from "@/data/specializations";

export type HomeImageKey = "hero" | "python" | "dataAi" | "web";

// Served from /public. Files are listed in the IMAGE ASSET MANIFEST.
export const homeImages: Record<
  HomeImageKey,
  { src: string; width: number; height: number; alt: string }
> = {
  hero: {
    src: "/images/home/hero-tech-learning.webp",
    width: 1200,
    height: 1500,
    alt: "Learner writing Python code on a laptop during a live online technical class",
  },
  python: {
    src: "/images/home/python-development.webp",
    width: 1200,
    height: 750,
    alt: "Python code on a laptop screen in a clean modern workspace",
  },
  dataAi: {
    src: "/images/home/data-ai-learning.webp",
    width: 1200,
    height: 750,
    alt: "Data analysis charts and machine learning notebook on a monitor",
  },
  web: {
    src: "/images/home/web-development.webp",
    width: 1200,
    height: 750,
    alt: "Web application interface and code editor on a widescreen display",
  },
};

function pick<T extends { slug: string }>(
  all: T[],
  preferred: readonly string[],
  fallback: T[],
  count: number,
): T[] {
  const chosen = preferred
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  for (const item of fallback) {
    if (chosen.length >= count) break;
    if (!chosen.some((c) => c.slug === item.slug)) chosen.push(item);
  }
  return chosen.slice(0, count);
}

// Exactly six of each. If a preferred slug is ever removed from the catalog,
// the next featured record fills in so the grid stays 3 x 2.
export const homeSpecializations: Specialization[] = pick(
  specializations,
  [
    "python-developer",
    "full-stack-developer",
    "backend-developer",
    "frontend-developer",
    "data-analyst",
    "ai-machine-learning",
  ],
  featuredSpecializations,
  6,
);

export const homeCourses: Course[] = pick(
  courses,
  ["python", "javascript", "react", "sql", "data-analysis-foundations", "ai-ml-foundations"],
  featuredCourses,
  6,
);

// Display-only chips. Every tag below appears in the record's own curriculum / modules.
export const specializationTags: Record<string, string[]> = {
  "python-developer": ["Python", "FastAPI", "Django", "PostgreSQL", "pytest"],
  "full-stack-developer": ["React", "Next.js", "Django REST", "PostgreSQL", "JWT"],
  "backend-developer": ["Django", "DRF", "FastAPI", "PostgreSQL", "JWT"],
  "frontend-developer": ["React", "Next.js", "TypeScript", "CSS Grid", "Git"],
  "data-analyst": ["SQL", "Pandas", "NumPy", "Matplotlib", "EDA"],
  "ai-machine-learning": ["Regression", "Classification", "K-Means", "Model tuning"],
};

export const courseTags: Record<string, string[]> = {
  python: ["OOP", "File I/O", "Automation"],
  javascript: ["DOM", "Async/await", "REST APIs"],
  react: ["Hooks", "Context API", "Routing"],
  sql: ["JOINs", "CTEs", "Transactions"],
  "data-analysis-foundations": ["Data cleaning", "EDA", "KPIs"],
  "ai-ml-foundations": ["Classification", "Regression", "Model evaluation"],
};

const specializationImage: Record<string, HomeImageKey> = {
  "python-developer": "python",
  "backend-developer": "python",
  "full-stack-developer": "web",
  "frontend-developer": "web",
  "data-analyst": "dataAi",
  "ai-machine-learning": "dataAi",
};

const liveOfferImage: Record<string, HomeImageKey> = {
  "python-young-developers": "python",
  "100-days-complete-python": "python",
  "python-data-analysis-research-ai": "dataAi",
};

export const imageForSpecialization = (slug: string): HomeImageKey =>
  specializationImage[slug] ?? "web";

export const imageForLiveOffer = (slug: string): HomeImageKey => liveOfferImage[slug] ?? "python";
