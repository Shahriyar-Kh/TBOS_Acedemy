// Visual configurations for TBOS Live Programs (Phase 12D).
// Business data (fees, roadmaps, descriptions, schedule notes) remains in src/data/liveOffers.ts or CMS.
// This module provides display-only visuals, tailored hero metrics, capstone guidance, and accents.

export type LiveProgramVisual = {
  slug: string;
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  accent: "cyan" | "gold" | "teal" | string;
  badge: string;
  tagline: string;
  audienceLabel: string;
  heroMetrics: Array<{ label: string; value: string }>;
  capstoneProject: {
    title: string;
    description: string;
    milestone: string;
  };
  highlightsTitle: string;
  whatsappMessage: string;
  accentClasses: {
    badgeBg: string;
    badgeText: string;
    borderGlow: string;
    glowBg: string;
    cardBorder: string;
  };
};

export const liveProgramVisuals: Record<string, LiveProgramVisual> = {
  "python-young-developers": {
    slug: "python-young-developers",
    image: "/images/home/live-python-young-developers.webp",
    imageAlt:
      "Young student in Grades 5–10 coding Python scripts and interactive applications on a modern laptop",
    width: 1200,
    height: 750,
    accent: "cyan",
    badge: "Young Developers Cohort",
    tagline: "Real Python Programming for Grades 5–10",
    audienceLabel: "Grades 5–10 (Age 10–16)",
    heroMetrics: [
      { label: "Target Audience", value: "Grades 5–10" },
      { label: "Cohort Length", value: "6 Months" },
      { label: "Class Frequency", value: "2–3 / Week" },
      { label: "Session Time", value: "1 Hour" },
    ],
    capstoneProject: {
      title: "Interactive Desktop Application (Tkinter GUI)",
      description:
        "Students build and showcase an interactive graphical user interface desktop program incorporating user inputs, logic, and multi-screen components.",
      milestone: "Complete GUI desktop project built independently by the student.",
    },
    highlightsTitle: "Why Young Learners & Parents Choose This Cohort",
    whatsappMessage:
      "Hello TechBuilt Open School, I would like information about the Python Young Developers live program and Free Demo.",
    accentClasses: {
      badgeBg: "bg-cyan/15",
      badgeText: "text-cyan",
      borderGlow: "hover:border-cyan/50",
      glowBg: "bg-cyan/20",
      cardBorder: "border-cyan/30",
    },
  },

  "100-days-complete-python": {
    slug: "100-days-complete-python",
    image: "/images/home/live-100-days-python.webp",
    imageAlt:
      "University learner working through structured 100 days Core Python programming in a professional workspace",
    width: 1200,
    height: 750,
    accent: "gold",
    badge: "Complete Python Series",
    tagline: "3 Learning Levels • 1 Complete Python Series",
    audienceLabel: "Beginners, University Students & Transitioners",
    heroMetrics: [
      { label: "Program Length", value: "100 Days" },
      { label: "Live Lectures", value: "37 Lectures" },
      { label: "Syllabus Phases", value: "6 Phases" },
      { label: "Class Frequency", value: "3–4 / Week" },
    ],
    capstoneProject: {
      title: "Multi-Module Object-Oriented Python System",
      description:
        "Architect and implement an end-to-end multi-module software system applying custom classes, encapsulation, inheritance, file persistence, and robust error handling.",
      milestone: "Production-ready, decomposed Core Python application architecture.",
    },
    highlightsTitle: "Why This Structured 100-Day Series Works",
    whatsappMessage:
      "Hello TechBuilt Open School, I would like information about the 100 Days Complete Python program and Free Demo.",
    accentClasses: {
      badgeBg: "bg-gold/15",
      badgeText: "text-gold-foreground",
      borderGlow: "hover:border-gold/50",
      glowBg: "bg-gold/20",
      cardBorder: "border-gold/30",
    },
  },

  "python-data-analysis-research-ai": {
    slug: "python-data-analysis-research-ai",
    image: "/images/home/live-data-ai-research.webp",
    imageAlt:
      "Scientific research and data analytics workstation with Python data analysis charts and Jupyter notebook",
    width: 1200,
    height: 750,
    accent: "teal",
    badge: "Applied Data & ML Cohort",
    tagline: "Scientific Computing, Research Analytics & ML Foundations",
    audienceLabel: "BS, MS, MPhil, PhD Scholars & Professionals",
    heroMetrics: [
      { label: "Program Length", value: "6 Months" },
      { label: "Class Frequency", value: "4 Classes / Week" },
      { label: "Session Time", value: "1 Hour" },
      { label: "Key Stack", value: "NumPy • Pandas • Scikit-Learn" },
    ],
    capstoneProject: {
      title: "End-to-End Quantitative Research & ML Capstone",
      description:
        "Conduct comprehensive exploratory data analysis, hypothesis testing, and train baseline predictive models on real-world academic or industry datasets.",
      milestone: "Complete exploratory analysis and validated predictive modeling pipeline.",
    },
    highlightsTitle: "Built for Scholars, Researchers & Data Practitioners",
    whatsappMessage:
      "Hello TechBuilt Open School, I would like information about the Python for Data Analysis, Research & AI/ML Foundations program and Free Demo.",
    accentClasses: {
      badgeBg: "bg-teal-500/15",
      badgeText: "text-teal-400",
      borderGlow: "hover:border-teal-500/50",
      glowBg: "bg-teal-500/20",
      cardBorder: "border-teal-500/30",
    },
  },
};

const defaultLiveProgramVisual: LiveProgramVisual = {
  slug: "default",
  image: "/images/home/live-python-young-developers.webp",
  imageAlt: "Live interactive coding class at TechBuilt Open School",
  width: 1200,
  height: 750,
  accent: "cyan",
  badge: "Live Cohort",
  tagline: "Live Instructor-Led Group Program",
  audienceLabel: "Live Interactive Cohort",
  heroMetrics: [
    { label: "Format", value: "Live Online" },
    { label: "Class Size", value: "Small Cohort" },
    { label: "Free Demo", value: "Available" },
    { label: "Mentoring", value: "Instructor-Led" },
  ],
  capstoneProject: {
    title: "Guided Capstone Project",
    description:
      "Students build and showcase an independent capstone software project applying core curriculum principles.",
    milestone: "Complete hands-on milestone project.",
  },
  highlightsTitle: "Program Highlights",
  whatsappMessage:
    "Hello TechBuilt Open School, I would like information about your live group programs and Free Demo.",
  accentClasses: {
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    borderGlow: "hover:border-primary/50",
    glowBg: "bg-primary/20",
    cardBorder: "border-primary/30",
  },
};

export function getLiveProgramVisual(slug: string): LiveProgramVisual {
  const match = liveProgramVisuals[slug];
  if (match) return match;
  return {
    ...defaultLiveProgramVisual,
    slug,
  };
}

export function isLiveProgramVisualFallback(slug: string): boolean {
  return !(slug in liveProgramVisuals);
}
