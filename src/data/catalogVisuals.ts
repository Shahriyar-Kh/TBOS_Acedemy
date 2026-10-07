// Catalog visual configuration (Phase 12C).
// The catalog (src/data/courses.ts and src/data/specializations.ts) remains the single source of truth for business data.
// This module provides display-only visual identities, motifs, accents, and image mappings for all 32 courses and 10 specializations.

export type CourseVisualMotif =
  | "angle-brackets"
  | "style-tokens"
  | "responsive-grid"
  | "code-block"
  | "type-system"
  | "dom-selector"
  | "orbitals"
  | "route-split"
  | "event-loop"
  | "server-script"
  | "mvc-pipeline"
  | "api-arrows"
  | "terminal"
  | "memory-blocks"
  | "compiled-system"
  | "jvm-architecture"
  | "class-diagram"
  | "dsa-nodes"
  | "branch-tree"
  | "relational-schema"
  | "relational-grid"
  | "advanced-db"
  | "table-records"
  | "document-tree"
  | "matrix-array"
  | "dataframe-table"
  | "chart-visualization"
  | "distribution-histogram"
  | "analytical-chart"
  | "data-pipeline"
  | "model-pipeline"
  | "ml-estimator";

export type CourseCatalogVisual = {
  slug: string;
  motif: CourseVisualMotif;
  accent: string;
  badge: string;
  tagline: string;
  accentColor: string;
  bgGradient: string;
  glowColor: string;
  borderGlow: string;
  iconName: string;
};

export type SpecializationCatalogVisual = {
  slug: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  accent: string;
  badge: string;
  objectPosition?: string;
  iconName: string;
};

// ============================================================================
// 1. ALL 32 TECHNICAL COURSES VISUAL CONFIGURATION
// ============================================================================

export const courseCatalogVisuals: Record<string, CourseCatalogVisual> = {
  // Web Development
  html5: {
    slug: "html5",
    motif: "angle-brackets",
    accent: "orange",
    badge: "Semantic Markup",
    tagline: "Semantic structure & modern web standards",
    accentColor: "text-orange-400",
    bgGradient: "from-navy-deep via-navy to-orange-950/45",
    glowColor: "bg-orange-500/20",
    borderGlow: "hover:border-orange-500/40",
    iconName: "Globe",
  },
  css3: {
    slug: "css3",
    motif: "style-tokens",
    accent: "sky",
    badge: "Modern Layouts",
    tagline: "Flexbox, CSS Grid & responsive typography",
    accentColor: "text-sky-400",
    bgGradient: "from-navy-deep via-navy to-sky-950/45",
    glowColor: "bg-sky-500/20",
    borderGlow: "hover:border-sky-500/40",
    iconName: "Layout",
  },
  "bootstrap-5": {
    slug: "bootstrap-5",
    motif: "responsive-grid",
    accent: "purple",
    badge: "Component Grid",
    tagline: "Rapid responsive UI & utility grid system",
    accentColor: "text-purple-400",
    bgGradient: "from-navy-deep via-navy to-purple-950/45",
    glowColor: "bg-purple-500/20",
    borderGlow: "hover:border-purple-500/40",
    iconName: "Layout",
  },
  javascript: {
    slug: "javascript",
    motif: "code-block",
    accent: "amber",
    badge: "Web Logic",
    tagline: "ES6+, asynchronous runtime & DOM interaction",
    accentColor: "text-amber-400",
    bgGradient: "from-navy-deep via-navy to-amber-950/40",
    glowColor: "bg-amber-500/20",
    borderGlow: "hover:border-amber-500/40",
    iconName: "FileCode",
  },
  typescript: {
    slug: "typescript",
    motif: "type-system",
    accent: "blue",
    badge: "Type Safety",
    tagline: "Static typing, interfaces & scalable architecture",
    accentColor: "text-blue-400",
    bgGradient: "from-navy-deep via-navy to-blue-950/45",
    glowColor: "bg-blue-500/20",
    borderGlow: "hover:border-blue-500/40",
    iconName: "Braces",
  },
  jquery: {
    slug: "jquery",
    motif: "dom-selector",
    accent: "cyan",
    badge: "DOM Manipulation",
    tagline: "Event handling, AJAX & DOM traversal patterns",
    accentColor: "text-cyan",
    bgGradient: "from-navy-deep via-navy to-cyan-950/40",
    glowColor: "bg-cyan/20",
    borderGlow: "hover:border-cyan/50",
    iconName: "Code2",
  },
  react: {
    slug: "react",
    motif: "orbitals",
    accent: "cyan",
    badge: "UI Components",
    tagline: "Component architecture, hooks & reactive state",
    accentColor: "text-cyan",
    bgGradient: "from-navy-deep via-navy to-cyan-950/45",
    glowColor: "bg-cyan/20",
    borderGlow: "hover:border-cyan/50",
    iconName: "Atom",
  },
  nextjs: {
    slug: "nextjs",
    motif: "route-split",
    accent: "slate",
    badge: "Full-Stack React",
    tagline: "App router, server components & edge rendering",
    accentColor: "text-slate-300",
    bgGradient: "from-navy-deep via-navy to-slate-900/60",
    glowColor: "bg-slate-400/20",
    borderGlow: "hover:border-slate-400/50",
    iconName: "Layers",
  },
  nodejs: {
    slug: "nodejs",
    motif: "event-loop",
    accent: "emerald",
    badge: "Backend Runtime",
    tagline: "Event-driven I/O, Express APIs & microservices",
    accentColor: "text-emerald-400",
    bgGradient: "from-navy-deep via-navy to-emerald-950/45",
    glowColor: "bg-emerald-500/20",
    borderGlow: "hover:border-emerald-500/40",
    iconName: "Server",
  },
  php: {
    slug: "php",
    motif: "server-script",
    accent: "indigo",
    badge: "Server Scripting",
    tagline: "Modern PHP 8+, backend requests & data persistence",
    accentColor: "text-indigo-400",
    bgGradient: "from-navy-deep via-navy to-indigo-950/45",
    glowColor: "bg-indigo-500/20",
    borderGlow: "hover:border-indigo-500/40",
    iconName: "Server",
  },
  laravel: {
    slug: "laravel",
    motif: "mvc-pipeline",
    accent: "rose",
    badge: "MVC Framework",
    tagline: "Elegant MVC, Eloquent ORM & artisan architecture",
    accentColor: "text-rose-400",
    bgGradient: "from-navy-deep via-navy to-rose-950/45",
    glowColor: "bg-rose-500/20",
    borderGlow: "hover:border-rose-500/40",
    iconName: "Layers",
  },
  "rest-apis": {
    slug: "rest-apis",
    motif: "api-arrows",
    accent: "teal",
    badge: "API Architecture",
    tagline: "RESTful principles, OpenAPI, auth & rate limiting",
    accentColor: "text-teal-400",
    bgGradient: "from-navy-deep via-navy to-teal-950/45",
    glowColor: "bg-teal-500/20",
    borderGlow: "hover:border-teal-500/40",
    iconName: "Workflow",
  },

  // Programming & Computer Science
  python: {
    slug: "python",
    motif: "terminal",
    accent: "emerald",
    badge: "Core Language",
    tagline: "Clean syntax, OOP, automation & scripting",
    accentColor: "text-emerald-400",
    bgGradient: "from-navy-deep via-navy to-emerald-950/45",
    glowColor: "bg-emerald-500/20",
    borderGlow: "hover:border-emerald-500/40",
    iconName: "Terminal",
  },
  "c-programming": {
    slug: "c-programming",
    motif: "memory-blocks",
    accent: "blue",
    badge: "Systems Foundation",
    tagline: "Pointers, memory layout & low-level fundamentals",
    accentColor: "text-blue-400",
    bgGradient: "from-navy-deep via-navy to-blue-950/45",
    glowColor: "bg-blue-500/20",
    borderGlow: "hover:border-blue-500/40",
    iconName: "Binary",
  },
  cpp: {
    slug: "cpp",
    motif: "compiled-system",
    accent: "sky",
    badge: "High Performance",
    tagline: "Modern C++20, STL, templates & memory efficiency",
    accentColor: "text-sky-400",
    bgGradient: "from-navy-deep via-navy to-sky-950/45",
    glowColor: "bg-sky-500/20",
    borderGlow: "hover:border-sky-500/40",
    iconName: "Cpu",
  },
  java: {
    slug: "java",
    motif: "jvm-architecture",
    accent: "amber",
    badge: "Enterprise OOP",
    tagline: "JVM architecture, multithreading & robust backend code",
    accentColor: "text-amber-400",
    bgGradient: "from-navy-deep via-navy to-amber-950/45",
    glowColor: "bg-amber-500/20",
    borderGlow: "hover:border-amber-500/40",
    iconName: "Coffee",
  },
  oop: {
    slug: "oop",
    motif: "class-diagram",
    accent: "violet",
    badge: "Design Paradigm",
    tagline: "Encapsulation, inheritance, polymorphism & SOLID",
    accentColor: "text-violet-400",
    bgGradient: "from-navy-deep via-navy to-violet-950/45",
    glowColor: "bg-violet-500/20",
    borderGlow: "hover:border-violet-500/40",
    iconName: "Layers",
  },
  dsa: {
    slug: "dsa",
    motif: "dsa-nodes",
    accent: "purple",
    badge: "Algorithms",
    tagline: "Trees, graphs, dynamic programming & complexity",
    accentColor: "text-purple-400",
    bgGradient: "from-navy-deep via-navy to-purple-950/45",
    glowColor: "bg-purple-500/20",
    borderGlow: "hover:border-purple-500/40",
    iconName: "Binary",
  },
  "git-github": {
    slug: "git-github",
    motif: "branch-tree",
    accent: "orange",
    badge: "Version Control",
    tagline: "Branching workflows, pull requests & team collaboration",
    accentColor: "text-orange-400",
    bgGradient: "from-navy-deep via-navy to-orange-950/45",
    glowColor: "bg-orange-500/20",
    borderGlow: "hover:border-orange-500/40",
    iconName: "GitBranch",
  },

  // Databases
  "database-fundamentals": {
    slug: "database-fundamentals",
    motif: "relational-schema",
    accent: "indigo",
    badge: "Data Modeling",
    tagline: "Normalization, ACID properties & relational design",
    accentColor: "text-indigo-400",
    bgGradient: "from-navy-deep via-navy to-indigo-950/45",
    glowColor: "bg-indigo-500/20",
    borderGlow: "hover:border-indigo-500/40",
    iconName: "Database",
  },
  sql: {
    slug: "sql",
    motif: "relational-grid",
    accent: "indigo",
    badge: "Relational Data",
    tagline: "Complex queries, window functions & indexing strategies",
    accentColor: "text-indigo-400",
    bgGradient: "from-navy-deep via-navy to-indigo-950/45",
    glowColor: "bg-indigo-500/20",
    borderGlow: "hover:border-indigo-500/40",
    iconName: "Table",
  },
  postgresql: {
    slug: "postgresql",
    motif: "advanced-db",
    accent: "blue",
    badge: "Enterprise Relational",
    tagline: "Advanced indexing, JSONB queries & query optimization",
    accentColor: "text-blue-400",
    bgGradient: "from-navy-deep via-navy to-blue-950/45",
    glowColor: "bg-blue-500/20",
    borderGlow: "hover:border-blue-500/40",
    iconName: "Database",
  },
  mysql: {
    slug: "mysql",
    motif: "table-records",
    accent: "amber",
    badge: "Relational Engine",
    tagline: "Engine architecture, transactions & replication",
    accentColor: "text-amber-400",
    bgGradient: "from-navy-deep via-navy to-amber-950/45",
    glowColor: "bg-amber-500/20",
    borderGlow: "hover:border-amber-500/40",
    iconName: "Database",
  },
  mongodb: {
    slug: "mongodb",
    motif: "document-tree",
    accent: "emerald",
    badge: "Document NoSQL",
    tagline: "Document models, aggregation pipelines & Atlas hosting",
    accentColor: "text-emerald-400",
    bgGradient: "from-navy-deep via-navy to-emerald-950/45",
    glowColor: "bg-emerald-500/20",
    borderGlow: "hover:border-emerald-500/40",
    iconName: "Database",
  },

  // Data & AI
  numpy: {
    slug: "numpy",
    motif: "matrix-array",
    accent: "sky",
    badge: "Numerical Computing",
    tagline: "Vectorized arrays, linear algebra & multidimensional math",
    accentColor: "text-sky-400",
    bgGradient: "from-navy-deep via-navy to-sky-950/45",
    glowColor: "bg-sky-500/20",
    borderGlow: "hover:border-sky-500/40",
    iconName: "Sigma",
  },
  pandas: {
    slug: "pandas",
    motif: "dataframe-table",
    accent: "indigo",
    badge: "Data Manipulation",
    tagline: "DataFrames, data wrangling, cleaning & transformations",
    accentColor: "text-indigo-400",
    bgGradient: "from-navy-deep via-navy to-indigo-950/45",
    glowColor: "bg-indigo-500/20",
    borderGlow: "hover:border-indigo-500/40",
    iconName: "Table",
  },
  matplotlib: {
    slug: "matplotlib",
    motif: "chart-visualization",
    accent: "teal",
    badge: "Data Visualization",
    tagline: "Statistical plots, custom figures & publication charts",
    accentColor: "text-teal-400",
    bgGradient: "from-navy-deep via-navy to-teal-950/45",
    glowColor: "bg-teal-500/20",
    borderGlow: "hover:border-teal-500/40",
    iconName: "LineChart",
  },
  "statistics-for-data": {
    slug: "statistics-for-data",
    motif: "distribution-histogram",
    accent: "gold",
    badge: "Statistical Theory",
    tagline: "Probability, hypothesis testing, distributions & variance",
    accentColor: "text-gold",
    bgGradient: "from-navy-deep via-navy to-yellow-950/40",
    glowColor: "bg-gold/20",
    borderGlow: "hover:border-gold/45",
    iconName: "Sigma",
  },
  "data-analysis-foundations": {
    slug: "data-analysis-foundations",
    motif: "analytical-chart",
    accent: "gold",
    badge: "Insights & EDA",
    tagline: "End-to-end data pipelines, exploratory analysis & KPIs",
    accentColor: "text-gold",
    bgGradient: "from-navy-deep via-navy to-yellow-950/35",
    glowColor: "bg-gold/20",
    borderGlow: "hover:border-gold/45",
    iconName: "BarChart3",
  },
  "data-science-foundations": {
    slug: "data-science-foundations",
    motif: "data-pipeline",
    accent: "cyan",
    badge: "Applied Science",
    tagline: "Feature engineering, predictive workflows & modeling",
    accentColor: "text-cyan",
    bgGradient: "from-navy-deep via-navy to-cyan-950/45",
    glowColor: "bg-cyan/20",
    borderGlow: "hover:border-cyan/50",
    iconName: "Workflow",
  },
  "ai-ml-foundations": {
    slug: "ai-ml-foundations",
    motif: "model-pipeline",
    accent: "violet",
    badge: "Models & Eval",
    tagline: "Supervised & unsupervised learning, metrics & tuning",
    accentColor: "text-violet-400",
    bgGradient: "from-navy-deep via-navy to-purple-950/45",
    glowColor: "bg-purple-500/20",
    borderGlow: "hover:border-purple-500/40",
    iconName: "Bot",
  },
  "scikit-learn": {
    slug: "scikit-learn",
    motif: "ml-estimator",
    accent: "amber",
    badge: "Machine Learning API",
    tagline: "Pipelines, model selection, hyperparameter tuning & eval",
    accentColor: "text-amber-400",
    bgGradient: "from-navy-deep via-navy to-amber-950/45",
    glowColor: "bg-amber-500/20",
    borderGlow: "hover:border-amber-500/40",
    iconName: "Cpu",
  },
};

// Safe fallback for any unexpected or newly added CMS course slug
const defaultCourseVisual: CourseCatalogVisual = {
  slug: "default",
  motif: "terminal",
  accent: "cyan",
  badge: "Technical Course",
  tagline: "Comprehensive instructor-led practical course",
  accentColor: "text-cyan",
  bgGradient: "from-navy-deep via-navy to-cyan-950/45",
  glowColor: "bg-cyan/20",
  borderGlow: "hover:border-cyan/50",
  iconName: "Code2",
};

export function getCourseCatalogVisual(slug: string): CourseCatalogVisual {
  const match = courseCatalogVisuals[slug];
  if (match) return match;
  return {
    ...defaultCourseVisual,
    slug,
  };
}

export function isCourseVisualFallback(slug: string): boolean {
  return !(slug in courseCatalogVisuals);
}

// ============================================================================
// 2. ALL 10 SPECIALIZATIONS VISUAL CONFIGURATION
// ============================================================================

export const specializationCatalogVisuals: Record<string, SpecializationCatalogVisual> = {
  "frontend-developer": {
    slug: "frontend-developer",
    src: "/images/home/spec-frontend-developer.webp",
    alt: "Frontend engineering workstation with modern React component code and responsive preview",
    width: 1200,
    height: 750,
    accent: "sky",
    badge: "Frontend Pathway",
    objectPosition: "object-center",
    iconName: "Layout",
  },
  "website-developer": {
    slug: "website-developer",
    src: "/images/specializations/spec-website-developer.webp",
    alt: "Modern website development workspace with responsive client sites, HTML/CSS code, and modern tools",
    width: 1200,
    height: 750,
    accent: "cyan",
    badge: "Web Production Pathway",
    objectPosition: "object-center",
    iconName: "Globe",
  },
  "backend-developer": {
    slug: "backend-developer",
    src: "/images/home/spec-backend-developer.webp",
    alt: "Backend engineering workspace with API request debugging, database schemas, and server architecture",
    width: 1200,
    height: 750,
    accent: "indigo",
    badge: "Backend Pathway",
    objectPosition: "object-center",
    iconName: "Server",
  },
  "full-stack-developer": {
    slug: "full-stack-developer",
    src: "/images/home/spec-full-stack-developer.webp",
    alt: "Full-stack development workstation showing responsive web frontend and backend API workflows",
    width: 1200,
    height: 750,
    accent: "blue",
    badge: "Full-Stack Pathway",
    objectPosition: "object-center",
    iconName: "Layers",
  },
  "python-developer": {
    slug: "python-developer",
    src: "/images/home/spec-python-developer.webp",
    alt: "Python developer workspace with automation scripts, terminal, and backend code",
    width: 1200,
    height: 750,
    accent: "emerald",
    badge: "Python Pathway",
    objectPosition: "object-center",
    iconName: "Terminal",
  },
  "database-developer": {
    slug: "database-developer",
    src: "/images/specializations/spec-database-developer.webp",
    alt: "Database engineering workstation with relational table schemas, SQL queries, and architecture diagrams",
    width: 1200,
    height: 750,
    accent: "purple",
    badge: "Database Pathway",
    objectPosition: "object-center",
    iconName: "Database",
  },
  "mobile-application-developer": {
    slug: "mobile-application-developer",
    src: "/images/specializations/spec-mobile-application-developer.webp",
    alt: "Mobile application development workspace with modern app UI preview on mobile devices and IDE code",
    width: 1200,
    height: 750,
    accent: "teal",
    badge: "Mobile Pathway",
    objectPosition: "object-center",
    iconName: "Smartphone",
  },
  "data-analyst": {
    slug: "data-analyst",
    src: "/images/home/spec-data-analyst.webp",
    alt: "Data analyst workspace with tabular datasets, visual dashboards, and statistical charts",
    width: 1200,
    height: 750,
    accent: "amber",
    badge: "Analytics Pathway",
    objectPosition: "object-center",
    iconName: "BarChart3",
  },
  "data-science": {
    slug: "data-science",
    src: "/images/specializations/spec-data-science.webp",
    alt: "Data science workstation with statistical plots, Jupyter notebooks, data preparation and predictive models",
    width: 1200,
    height: 750,
    accent: "gold",
    badge: "Data Science Pathway",
    objectPosition: "object-center",
    iconName: "Workflow",
  },
  "ai-machine-learning": {
    slug: "ai-machine-learning",
    src: "/images/home/spec-ai-machine-learning.webp",
    alt: "Machine learning experimentation environment with model pipelines, validation metrics, and Python notebooks",
    width: 1200,
    height: 750,
    accent: "violet",
    badge: "AI / ML Pathway",
    objectPosition: "object-center",
    iconName: "Bot",
  },
};

const defaultSpecializationVisual: SpecializationCatalogVisual = {
  slug: "default",
  src: "/images/home/spec-python-developer.webp",
  alt: "Professional technical specialization learning path at TechBuilt Open School",
  width: 1200,
  height: 750,
  accent: "cyan",
  badge: "Specialization Track",
  objectPosition: "object-center",
  iconName: "Layers",
};

export function getSpecializationCatalogVisual(slug: string): SpecializationCatalogVisual {
  const match = specializationCatalogVisuals[slug];
  if (match) return match;
  return {
    ...defaultSpecializationVisual,
    slug,
  };
}

export function isSpecializationVisualFallback(slug: string): boolean {
  return !(slug in specializationCatalogVisuals);
}

/**
 * Derives authentic technology and topic tags directly from a specialization's modules.
 * This guarantees truthful, non-fabricated technology badges for every track.
 */
export function deriveSpecializationTags(modules: string[]): string[] {
  if (!modules || modules.length === 0) return [];

  const candidateKeywords = [
    "HTML5",
    "CSS3",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "Python",
    "Django",
    "FastAPI",
    "DRF",
    "PHP",
    "Laravel",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Git",
    "GitHub",
    "REST APIs",
    "NumPy",
    "Pandas",
    "Matplotlib",
    "Seaborn",
    "Scikit-Learn",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "React Native",
    "Flutter",
    "Tailwind CSS",
    "Bootstrap",
    "Data Modeling",
    "Database Tuning",
    "EDA",
    "Statistics",
    "JWT",
    "State Management",
    "Responsive Design",
    "OOP",
  ];

  const matched = new Set<string>();
  const allText = modules.join(" ");

  for (const kw of candidateKeywords) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(allText)) {
      matched.add(kw);
    }
  }

  // If few direct keyword matches, extract concise phrases from the first 4 module titles
  if (matched.size < 3) {
    modules.slice(0, 4).forEach((m) => {
      const parts = m.split(/[-–—:]/);
      const prefix = parts[0]?.trim();
      if (prefix && prefix.length > 2 && prefix.length < 24) {
        matched.add(prefix);
      }
    });
  }

  return Array.from(matched).slice(0, 5);
}
