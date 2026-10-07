// Homepage curation (Phase 12B).
// The catalog (courses / specializations / live offers) stays the single source of truth.
// This file only decides WHICH records the homepage shows, provides per-slug visual configurations,
// and adds display-only tags that are taken from each record's real curriculum/modules.

import { courses, featuredCourses, type Course } from "@/data/courses";
import {
  specializations,
  featuredSpecializations,
  type Specialization,
} from "@/data/specializations";

export type HomeVisualConfig = {
  src: string;
  width: number;
  height: number;
  alt: string;
  objectPosition?: string;
  accent?: string;
};

export type CourseVisualMotif =
  | "terminal"
  | "code-block"
  | "orbitals"
  | "relational-grid"
  | "analytical-chart"
  | "model-pipeline";

export type CourseVisualConfig = {
  motif: CourseVisualMotif;
  accent: string;
  badge: string;
  accentColor: string;
  bgGradient: string;
  glowColor: string;
  borderGlow: string;
};

// 1. Hero visual configuration
export const homeHeroVisual: HomeVisualConfig = {
  src: "/images/home/hero-tech-learning.webp",
  width: 1200,
  height: 1500,
  alt: "Learner writing Python code on a laptop during a live online technical class",
};

// 2. PART A — Unique Live Program Imagery
export const homeLiveOfferVisuals: Record<string, HomeVisualConfig> = {
  "python-young-developers": {
    src: "/images/home/live-python-young-developers.webp",
    width: 1200,
    height: 750,
    alt: "Young learner writing Python code on a laptop in a modern study environment",
    objectPosition: "object-center",
    accent: "cyan",
  },
  "100-days-complete-python": {
    src: "/images/home/live-100-days-python.webp",
    width: 1200,
    height: 750,
    alt: "University learner working through structured Python programming in a professional coding workspace",
    objectPosition: "object-center",
    accent: "gold",
  },
  "python-data-analysis-research-ai": {
    src: "/images/home/live-data-ai-research.webp",
    width: 1200,
    height: 750,
    alt: "Scientific research and analytics workstation with Python data analysis charts and scientific notebook",
    objectPosition: "object-center",
    accent: "teal",
  },
};

export function getLiveOfferVisual(slug: string): HomeVisualConfig {
  return (
    homeLiveOfferVisuals[slug] ?? {
      src: "/images/home/live-python-young-developers.webp",
      width: 1200,
      height: 750,
      alt: "Live interactive coding class at TechBuilt Open School",
      objectPosition: "object-center",
      accent: "cyan",
    }
  );
}

// 3. PART B — Unique Specialization Imagery
export const homeSpecializationVisuals: Record<string, HomeVisualConfig> = {
  "python-developer": {
    src: "/images/home/spec-python-developer.webp",
    width: 1200,
    height: 750,
    alt: "Python developer workspace with automation scripts, terminal, and backend code",
    objectPosition: "object-center",
    accent: "cyan",
  },
  "full-stack-developer": {
    src: "/images/home/spec-full-stack-developer.webp",
    width: 1200,
    height: 750,
    alt: "Full-stack development workstation showing responsive web frontend and backend API workflows",
    objectPosition: "object-center",
    accent: "blue",
  },
  "backend-developer": {
    src: "/images/home/spec-backend-developer.webp",
    width: 1200,
    height: 750,
    alt: "Backend engineering workspace with API request debugging, database schemas, and server architecture",
    objectPosition: "object-center",
    accent: "indigo",
  },
  "frontend-developer": {
    src: "/images/home/spec-frontend-developer.webp",
    width: 1200,
    height: 750,
    alt: "Frontend engineering workstation with modern React component code and multi-device responsive preview",
    objectPosition: "object-center",
    accent: "sky",
  },
  "data-analyst": {
    src: "/images/home/spec-data-analyst.webp",
    width: 1200,
    height: 750,
    alt: "Data analyst workspace with tabular datasets, visual dashboards, and statistical charts",
    objectPosition: "object-center",
    accent: "amber",
  },
  "ai-machine-learning": {
    src: "/images/home/spec-ai-machine-learning.webp",
    width: 1200,
    height: 750,
    alt: "Machine learning experimentation environment with model pipelines, validation metrics, and Python notebooks",
    objectPosition: "object-center",
    accent: "violet",
  },
};

export function getSpecializationVisual(slug: string): HomeVisualConfig {
  return (
    homeSpecializationVisuals[slug] ?? {
      src: "/images/home/spec-python-developer.webp",
      width: 1200,
      height: 750,
      alt: "Technology specialization learning track at TechBuilt Open School",
      objectPosition: "object-center",
      accent: "cyan",
    }
  );
}

// 4. PART C — Unique Course Technical Visual Headers
export const homeCourseVisuals: Record<string, CourseVisualConfig> = {
  python: {
    motif: "terminal",
    accent: "emerald",
    badge: "Core Language",
    accentColor: "text-emerald-400",
    bgGradient: "from-navy-deep via-navy to-emerald-950/45",
    glowColor: "bg-emerald-500/20",
    borderGlow: "hover:border-emerald-500/40",
  },
  javascript: {
    motif: "code-block",
    accent: "amber",
    badge: "Web Logic",
    accentColor: "text-amber-400",
    bgGradient: "from-navy-deep via-navy to-amber-950/40",
    glowColor: "bg-amber-500/20",
    borderGlow: "hover:border-amber-500/40",
  },
  react: {
    motif: "orbitals",
    accent: "cyan",
    badge: "Interfaces",
    accentColor: "text-cyan",
    bgGradient: "from-navy-deep via-navy to-cyan-950/45",
    glowColor: "bg-cyan/20",
    borderGlow: "hover:border-cyan/50",
  },
  sql: {
    motif: "relational-grid",
    accent: "indigo",
    badge: "Relational Data",
    accentColor: "text-indigo-400",
    bgGradient: "from-navy-deep via-navy to-indigo-950/45",
    glowColor: "bg-indigo-500/20",
    borderGlow: "hover:border-indigo-500/40",
  },
  "data-analysis-foundations": {
    motif: "analytical-chart",
    accent: "gold",
    badge: "Insights & EDA",
    accentColor: "text-gold",
    bgGradient: "from-navy-deep via-navy to-yellow-950/35",
    glowColor: "bg-gold/20",
    borderGlow: "hover:border-gold/45",
  },
  "ai-ml-foundations": {
    motif: "model-pipeline",
    accent: "violet",
    badge: "Models & Eval",
    accentColor: "text-violet-400",
    bgGradient: "from-navy-deep via-navy to-purple-950/45",
    glowColor: "bg-purple-500/20",
    borderGlow: "hover:border-purple-500/40",
  },
};

export function getCourseVisual(slug: string): CourseVisualConfig {
  return (
    homeCourseVisuals[slug] ?? {
      motif: "terminal",
      accent: "cyan",
      badge: "Course",
      accentColor: "text-cyan",
      bgGradient: "from-navy-deep via-navy to-cyan-950/45",
      glowColor: "bg-cyan/20",
      borderGlow: "hover:border-cyan/50",
    }
  );
}

// Legacy dictionary for HeroSection and backwards compatibility
export const homeImages = {
  hero: homeHeroVisual,
  python: homeSpecializationVisuals["python-developer"],
  dataAi: homeSpecializationVisuals["data-analyst"],
  web: homeSpecializationVisuals["frontend-developer"],
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
