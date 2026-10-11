// Curriculum Roadmaps & Specialization Journey Specifications (Phase 13C).
// Content Locks:
// - Preserves all existing course chapters, core topics, guided tasks, projects, capstones, and curriculum sources.
// - Fixed specialization pricing:
//   - Full-Stack Developer: PKR 20,000/month
//   - Data Analyst: PKR 20,000/month
//   - Data Science: PKR 20,000/month
//   - AI / Machine Learning: PKR 20,000/month
//   - All other specializations: PKR 15,000/month
// - 4 live online classes/week, recorded lectures, and multiple portfolio projects.

import type { Course } from "@/data/courses";
import type { Specialization } from "@/data/specializations";

export interface CourseValidationBasis {
  officialStandard: string;
  authority: string;
  documentationUrl: string;
  validationSummary: string;
  standardType: string;
}

export interface StructuredChapter {
  chapterNumber: number | string;
  badgeLabel: string;
  title: string;
  rawText: string;
  coreTopics: string[];
  guidedTask: string;
  isProject: boolean;
  isCapstone: boolean;
}

export interface SpecializationCourseBlock {
  courseNumber: number;
  courseTitle: string;
  courseSlug?: string;
  durationEstimate: string;
  coreChapters: string[];
  projectTitle: string;
  progressionNote: string;
}

export interface SpecializationCapstone {
  title: string;
  description: string;
  deliverables: string[];
  reviewFormat: string;
}

export interface SpecializationPricingConfig {
  monthlyFee: number;
  formattedMonthlyFee: string;
  currency: "PKR";
  billingPeriod: "monthly";
  classesPerWeek: number;
  classDuration: string;
  deliveryFormat: string;
  recordingsNote: string;
  projectsNote: string;
  feeTransparencyNote: string;
}

// ============================================================================
// 1. OFFICIAL CURRICULUM VALIDATION SOURCES FOR ALL 32 COURSES
// ============================================================================

export const courseValidationData: Record<string, CourseValidationBasis> = {
  html5: {
    officialStandard: "W3C HTML5.3 Recommendation & WHATWG Living Standard",
    authority: "W3C / WHATWG & MDN Web Docs",
    documentationUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    validationSummary:
      "Curriculum strictly adheres to current W3C HTML5 semantics, accessible ARIA patterns, and valid web document architecture.",
    standardType: "Official Web Standard",
  },
  css3: {
    officialStandard: "W3C CSS Level 3 & Flexible Box / Grid Layout Specifications",
    authority: "W3C CSS Working Group & MDN Web Docs",
    documentationUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    validationSummary:
      "Verified against W3C CSS specifications for modern layout models (Flexbox, Grid), media queries, and responsive token architectures.",
    standardType: "Official Web Standard",
  },
  "bootstrap-5": {
    officialStandard: "Bootstrap 5.3 Framework Specification",
    authority: "Bootstrap Core Team",
    documentationUrl: "https://getbootstrap.com/docs/5.3/",
    validationSummary:
      "Aligned with Bootstrap 5.3 utility API, responsive 12-column grid, modular components, and CSS custom property theming.",
    standardType: "Framework Specification",
  },
  javascript: {
    officialStandard: "ECMA-262 ECMAScript Language Specification (ES6+)",
    authority: "Ecma International (TC39) & MDN Web Docs",
    documentationUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    validationSummary:
      "Built on modern ECMAScript standards covering asynchronous programming, closures, prototypes, DOM APIs, and functional patterns.",
    standardType: "Language Specification",
  },
  typescript: {
    officialStandard: "TypeScript Language Specification & Handbook",
    authority: "Microsoft TypeScript Team",
    documentationUrl: "https://www.typescriptlang.org/docs/",
    validationSummary:
      "Validated against official TypeScript typing rules, strict compiler flags, generic constraints, and production type design.",
    standardType: "Language Specification",
  },
  jquery: {
    officialStandard: "jQuery API Reference & DOM Abstraction Standards",
    authority: "OpenJS Foundation",
    documentationUrl: "https://api.jquery.com/",
    validationSummary:
      "Teaches historical and modern DOM manipulation patterns, legacy codebase maintenance, and cross-browser event handling.",
    standardType: "Library Specification",
  },
  react: {
    officialStandard: "React 19 Official Documentation & Component Standards",
    authority: "Meta Open Source & React Core Team",
    documentationUrl: "https://react.dev/",
    validationSummary:
      "Aligned with official React 19 functional component guidelines, modern hooks, declarative state flows, and concurrent model basics.",
    standardType: "Framework Specification",
  },
  nextjs: {
    officialStandard: "Next.js App Router Documentation & Server Components Spec",
    authority: "Vercel Next.js Engineering Team",
    documentationUrl: "https://nextjs.org/docs",
    validationSummary:
      "Verified against Next.js App Router architecture, React Server Components (RSC), route handlers, and streaming SSR guidelines.",
    standardType: "Framework Specification",
  },
  nodejs: {
    officialStandard: "Node.js Long Term Support (LTS) API Documentation",
    authority: "OpenJS Foundation Node.js Project",
    documentationUrl: "https://nodejs.org/en/docs/",
    validationSummary:
      "Follows official Node.js runtime standards: non-blocking event loop, stream handling, modular NPM packaging, and HTTP server core.",
    standardType: "Runtime Specification",
  },
  php: {
    officialStandard: "PHP 8.x Official Manual & PHP-FIG Standards (PSR)",
    authority: "The PHP Group & PHP-FIG",
    documentationUrl: "https://www.php.net/manual/en/",
    validationSummary:
      "Aligned with PHP 8.x modern type systems, attributes, OOP paradigms, and standard PSR coding recommendations.",
    standardType: "Language Specification",
  },
  laravel: {
    officialStandard: "Laravel 11.x Official Framework Documentation",
    authority: "Laravel Core Team",
    documentationUrl: "https://laravel.com/docs",
    validationSummary:
      "Verified against Laravel 11.x MVC patterns, Eloquent ORM relationships, Artisan tooling, migration workflows, and middleware pipelines.",
    standardType: "Framework Specification",
  },
  "rest-apis": {
    officialStandard: "RFC 7231 HTTP/1.1 Semantics & OpenAPI 3.1 Specification",
    authority: "IETF & OpenAPI Initiative (OAI)",
    documentationUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    validationSummary:
      "Aligned with canonical REST architectural constraints, RFC HTTP status codes, structured JSON payloads, and API schema design.",
    standardType: "Architectural Protocol",
  },
  python: {
    officialStandard: "Python 3 Official Documentation & PEP 8 Style Guide",
    authority: "Python Software Foundation (PSF)",
    documentationUrl: "https://docs.python.org/3/",
    validationSummary:
      "Strictly follows official Python 3 runtime manuals, PEP 8 idiomatic coding standards, and standard library best practices.",
    standardType: "Language Specification",
  },
  "c-programming": {
    officialStandard: "ISO/IEC 9899 (C11/C17) Standard & GNU C Manual",
    authority: "ISO/IEC JTC1/SC22/WG14 & Free Software Foundation",
    documentationUrl: "https://www.gnu.org/software/gnu-c-manual/",
    validationSummary:
      "Based on ISO C programming foundations: pointers, manual memory allocation, low-level data structures, and compilation processes.",
    standardType: "ISO Standard",
  },
  cpp: {
    officialStandard: "ISO/IEC 14882 (C++17/C++20) Standard",
    authority: "ISO/IEC C++ Standards Committee & cppreference.com",
    documentationUrl: "https://en.cppreference.com/w/",
    validationSummary:
      "Verified against modern C++ conventions: RAII resource management, Standard Template Library (STL), templates, and OOP hierarchy.",
    standardType: "ISO Standard",
  },
  java: {
    officialStandard: "Oracle Java SE 17+ LTS Language Specification",
    authority: "Oracle Corporation & OpenJDK Community",
    documentationUrl: "https://docs.oracle.com/en/java/",
    validationSummary:
      "Aligned with Oracle Java SE LTS specifications, JVM execution models, object-oriented principles, and Java Collections Framework.",
    standardType: "Language Specification",
  },
  oop: {
    officialStandard: "Object-Oriented Architecture & SOLID Principles",
    authority: "Software Engineering Institute & Industry Clean Code Standards",
    documentationUrl: "https://en.wikipedia.org/wiki/SOLID",
    validationSummary:
      "Covers canonical object-oriented analysis and design: encapsulation, inheritance, polymorphism, abstraction, and SOLID patterns.",
    standardType: "Software Engineering Standard",
  },
  dsa: {
    officialStandard: "Classical Data Structures & Algorithmic Analysis Standards",
    authority: "ACM / IEEE Computer Science Curricula Standards",
    documentationUrl: "https://en.wikipedia.org/wiki/Data_structure",
    validationSummary:
      "Curriculum benchmarked against ACM/IEEE computer science curricula: asymptotic Big-O analysis, linear/tree structures, and sorting.",
    standardType: "Academic Benchmark",
  },
  "git-github": {
    officialStandard: "Git Version Control System Documentation & Pro Git Standard",
    authority: "Git Community & GitHub Documentation",
    documentationUrl: "https://git-scm.com/doc",
    validationSummary:
      "Follows canonical Git content-addressable model: branching, three-tree architecture, rebase workflows, and collaborative PRs.",
    standardType: "Industry Standard",
  },
  "database-fundamentals": {
    officialStandard: "Relational Database Management Systems & ACID Protocol",
    authority: "ACM SIGMOD & Relational Model Standards (Codd's Rules)",
    documentationUrl: "https://en.wikipedia.org/wiki/Relational_database",
    validationSummary:
      "Grounds students in relational algebra, ACID transaction guarantees, normalization theory, and relational schema integrity.",
    standardType: "Database Standard",
  },
  sql: {
    officialStandard: "ISO/IEC 9075 SQL Standard & PostgreSQL Query Dialect",
    authority: "ISO/IEC & PostgreSQL Documentation",
    documentationUrl: "https://www.postgresql.org/docs/current/sql.html",
    validationSummary:
      "Aligned with ANSI/ISO SQL standards: DDL/DML, multi-table joins, subqueries, group aggregations, and transaction management.",
    standardType: "ISO Standard",
  },
  postgresql: {
    officialStandard: "PostgreSQL 16+ Official Documentation",
    authority: "PostgreSQL Global Development Group",
    documentationUrl: "https://www.postgresql.org/docs/",
    validationSummary:
      "Verified against PostgreSQL documentation: advanced indexing, query execution plans (EXPLAIN ANALYZE), JSONB, and constraints.",
    standardType: "Database Specification",
  },
  mysql: {
    officialStandard: "MySQL 8.0+ Reference Manual",
    authority: "Oracle MySQL Team",
    documentationUrl: "https://dev.mysql.com/doc/",
    validationSummary:
      "Follows official MySQL 8.0 reference manual: InnoDB engine mechanics, transaction isolation, indexing strategies, and user security.",
    standardType: "Database Specification",
  },
  mongodb: {
    officialStandard: "MongoDB 7.0+ Manual & BSON Document Specification",
    authority: "MongoDB Inc.",
    documentationUrl: "https://www.mongodb.com/docs/",
    validationSummary:
      "Aligned with MongoDB document database principles: flexible schemas, aggregation pipelines, document indexing, and CRUD patterns.",
    standardType: "Database Specification",
  },
  numpy: {
    officialStandard: "NumPy 2.x Documentation & Array Computing Standards",
    authority: "NumPy Development Team / NumFOCUS",
    documentationUrl: "https://numpy.org/doc/stable/",
    validationSummary:
      "Adheres to official NumPy array computing standards: vectorized broadcasting, indexing, multidimensional array operations, and math.",
    standardType: "Scientific Computing Standard",
  },
  pandas: {
    officialStandard: "Pandas 2.x Documentation & Tabular Data Specifications",
    authority: "Pandas Development Team / NumFOCUS",
    documentationUrl: "https://pandas.pydata.org/docs/",
    validationSummary:
      "Covers official Pandas DataFrame and Series operations: data wrangling, missing data imputation, group-by aggregations, and reshaping.",
    standardType: "Data Analysis Standard",
  },
  matplotlib: {
    officialStandard: "Matplotlib 3.x Official Documentation & Pyplot API",
    authority: "Matplotlib Development Team / NumFOCUS",
    documentationUrl: "https://matplotlib.org/stable/",
    validationSummary:
      "Based on Matplotlib object-oriented plotting API: figures, axes, subplots, publication-quality styling, and statistical chart types.",
    standardType: "Visualization Standard",
  },
  "statistics-for-data": {
    officialStandard: "Applied Inferential & Descriptive Statistics Standards",
    authority: "American Statistical Association (ASA) Guidelines",
    documentationUrl: "https://en.wikipedia.org/wiki/Statistics",
    validationSummary:
      "Curriculum covers standard statistical methods: central tendency, variance, probability distributions, hypothesis tests, and p-values.",
    standardType: "Statistical Benchmark",
  },
  "data-analysis-foundations": {
    officialStandard: "CRISP-DM Framework & Exploratory Data Analysis Standards",
    authority: "Cross-Industry Standard Process for Data Mining (CRISP-DM)",
    documentationUrl: "https://en.wikipedia.org/wiki/Data_analysis",
    validationSummary:
      "Structured according to CRISP-DM workflow: business understanding, data exploration, cleaning, metric definition, and insight reporting.",
    standardType: "Methodological Standard",
  },
  "data-science-foundations": {
    officialStandard: "PyData Ecosystem & Machine Learning Engineering Lifecycle",
    authority: "PyData / Open Data Science Standards",
    documentationUrl: "https://pydata.org/",
    validationSummary:
      "Follows reproducible data science lifecycle: hypothesis formulation, EDA, feature preprocessing, model selection, and validation.",
    standardType: "Data Science Framework",
  },
  "ai-ml-foundations": {
    officialStandard: "Applied Machine Learning & Statistical Modeling Standards",
    authority: "Scikit-Learn Community & IEEE AI Ethics/Practices",
    documentationUrl: "https://scikit-learn.org/stable/",
    validationSummary:
      "Aligned with responsible machine learning guidelines: train/test splitting, leakage prevention, cross-validation, and metrics.",
    standardType: "Machine Learning Standard",
  },
  "scikit-learn": {
    officialStandard: "Scikit-Learn 1.x Documentation & API Reference",
    authority: "Scikit-Learn Core Team / INRIA",
    documentationUrl: "https://scikit-learn.org/stable/user_guide.html",
    validationSummary:
      "Strictly follows scikit-learn estimator API (fit/transform/predict), Pipelines, ColumnTransformer, GridSearchCV, and model metrics.",
    standardType: "Library Specification",
  },
};

export function getCourseValidationBasis(slug: string): CourseValidationBasis {
  return (
    courseValidationData[slug] || {
      officialStandard: "Industry Technical Curriculum Benchmark",
      authority: "Technical Documentation Standards",
      documentationUrl: "https://developer.mozilla.org/",
      validationSummary:
        "Curriculum benchmarked against modern software engineering practices, official documentation, and live practical coding exercises.",
      standardType: "Technical Standard",
    }
  );
}

// ============================================================================
// 2. STRUCTURED CHAPTER ROADMAP PARSER
// ============================================================================

/**
 * Transforms a course's canonical curriculum array into rich, scannable chapters.
 * 100% of the original string data is preserved in `rawText`.
 */
export function getStructuredCourseChapters(course: Course): StructuredChapter[] {
  return course.curriculum.map((item, index) => {
    const isProjectOrCapstone =
      item.toLowerCase().includes("project:") ||
      item.toLowerCase().includes("capstone:") ||
      index === course.curriculum.length - 1;

    const isCapstone =
      item.toLowerCase().includes("capstone:") ||
      (isProjectOrCapstone && index === course.curriculum.length - 1);

    // Parse title & core topics from colon or ampersand/comma separators
    let title = item;
    let coreTopics: string[] = [];

    if (item.includes(":")) {
      const parts = item.split(":");
      title = parts[0].trim();
      const details = parts.slice(1).join(":").trim();
      coreTopics = details
        .split(/[,&]/)
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (item.includes("&")) {
      const parts = item.split("&");
      title = parts[0].trim();
      coreTopics = parts.map((t) => t.trim()).filter(Boolean);
    } else if (item.includes(",")) {
      const parts = item.split(",");
      title = parts[0].trim();
      coreTopics = parts.slice(1).map((t) => t.trim()).filter(Boolean);
    }

    if (coreTopics.length === 0) {
      coreTopics = [item];
    }

    const chapterNum = index + 1;
    const badgeLabel = isCapstone
      ? "Final Capstone"
      : isProjectOrCapstone
        ? "Milestone Project"
        : `Chapter ${String(chapterNum).padStart(2, "0")}`;

    // Practical guided task derived for this chapter
    const guidedTask = isCapstone
      ? "End-to-end portfolio capstone: Complete code implementation, documentation, and live 1-on-1 mentor code evaluation."
      : isProjectOrCapstone
        ? "Hands-on milestone project: Build and test a complete application milestone incorporating all chapter concepts."
        : `Guided practical exercise: Hands-on coding lab and instructor-reviewed implementation for ${title.toLowerCase()}.`;

    return {
      chapterNumber: isCapstone ? "Capstone" : chapterNum,
      badgeLabel,
      title,
      rawText: item,
      coreTopics,
      guidedTask,
      isProject: isProjectOrCapstone,
      isCapstone,
    };
  });
}

// ============================================================================
// 3. SPECIALIZATION PRICING CONFIGURATION (STRICT CONTENT LOCKS)
// ============================================================================

const PREMIUM_20K_SLUGS = new Set([
  "full-stack-developer",
  "data-analyst",
  "data-science",
  "ai-machine-learning",
]);

export function getSpecializationPricing(slug: string): SpecializationPricingConfig {
  const is20k = PREMIUM_20K_SLUGS.has(slug);
  const monthlyFee = is20k ? 20000 : 15000;

  return {
    monthlyFee,
    formattedMonthlyFee: `PKR ${monthlyFee.toLocaleString()}/month`,
    currency: "PKR",
    billingPeriod: "monthly",
    classesPerWeek: 4,
    classDuration: "1 hour per live session",
    deliveryFormat: "One-to-one live online classes",
    recordingsNote: "Recorded lectures available for lifetime review after every session",
    projectsNote: "Multiple portfolio projects built throughout the track",
    feeTransparencyNote:
      "Fixed monthly tuition with zero hidden charges. Billed monthly for the confirmed track duration.",
  };
}

// ============================================================================
// 4. SPECIALIZATION LEARNING JOURNEY CONFIGURATION (10 SPECIALIZATIONS)
// ============================================================================

export const specializationJourneys: Record<
  string,
  {
    courses: SpecializationCourseBlock[];
    capstone: SpecializationCapstone;
  }
> = {
  "frontend-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "HTML5 — Semantic Web Architecture",
        courseSlug: "html5",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Document hierarchy & semantic tags",
          "Accessible form controls & validation",
          "Multimedia embedding & SEO structuring",
        ],
        projectTitle: "Accessible Multi-Page Web Portal Structure",
        progressionNote:
          "Establishes clean document semantics before applying CSS3 layout and styling rules.",
      },
      {
        courseNumber: 2,
        courseTitle: "CSS3 — Responsive Layout Engineering",
        courseSlug: "css3",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Flexbox axes, alignment & card layouts",
          "CSS Grid responsive dashboard templates",
          "Media queries, transitions & CSS custom properties",
        ],
        projectTitle: "Pixel-Perfect Responsive Landing Page",
        progressionNote:
          "Enables responsive UI construction before introducing rapid grid framework utilities.",
      },
      {
        courseNumber: 3,
        courseTitle: "Bootstrap 5 — Component Systems & Grids",
        courseSlug: "bootstrap-5",
        durationEstimate: "3 weeks",
        coreChapters: [
          "12-column responsive layout grid",
          "Navbars, modals, accordions & forms",
          "Custom utility classes & theme overrides",
        ],
        projectTitle: "Rapid Multi-Section Corporate UI",
        progressionNote:
          "Gives developers rapid prototyping workflows before diving into core JavaScript programming.",
      },
      {
        courseNumber: 4,
        courseTitle: "JavaScript — Modern Logic & DOM Engineering",
        courseSlug: "javascript",
        durationEstimate: "6 weeks",
        coreChapters: [
          "ES6+ syntax, arrays, objects & closures",
          "DOM tree manipulation & event handling",
          "Asynchronous JavaScript: Promises & Fetch API",
        ],
        projectTitle: "Dynamic Interactive Client Dashboard",
        progressionNote:
          "Builds essential programming logic necessary for TypeScript types and React state.",
      },
      {
        courseNumber: 5,
        courseTitle: "TypeScript — Static Type Systems",
        courseSlug: "typescript",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Static typing, interfaces & custom types",
          "Generics, utility types & union types",
          "TypeScript compiler setup & error handling",
        ],
        projectTitle: "Type-Safe Client State Management Module",
        progressionNote:
          "Prepares type-safe architectures required for production-grade React components.",
      },
      {
        courseNumber: 6,
        courseTitle: "React.js — Component Architecture & Hooks",
        courseSlug: "react",
        durationEstimate: "6 weeks",
        coreChapters: [
          "Declarative JSX & component composition",
          "useState, useEffect & custom hooks",
          "Client-side routing & external REST API consumption",
        ],
        projectTitle: "Full-Featured Single-Page Web Application",
        progressionNote:
          "Lays the foundation for Next.js full-stack capabilities, server components, and SSR.",
      },
      {
        courseNumber: 7,
        courseTitle: "Next.js — Full-Stack Web Framework",
        courseSlug: "nextjs",
        durationEstimate: "5 weeks",
        coreChapters: [
          "App Router, layout nesting & server components",
          "Server-side rendering (SSR) & static generation (SSG)",
          "Route handlers, API routes & metadata SEO",
        ],
        projectTitle: "High-Performance SSR Content Portal",
        progressionNote:
          "Prepares version control and deployment workflows for the final portfolio capstone.",
      },
      {
        courseNumber: 8,
        courseTitle: "Git & GitHub — Engineering Workflows",
        courseSlug: "git-github",
        durationEstimate: "2 weeks",
        coreChapters: [
          "Git branch strategies & commit conventions",
          "Pull requests, merge conflict resolution & reviews",
          "Production repository showcase & deployment hosting",
        ],
        projectTitle: "Published Open-Source Developer Portfolio",
        progressionNote:
          "Culminates in the final end-to-end production capstone application.",
      },
    ],
    capstone: {
      title: "Production-Grade Multi-Page Web Application Portfolio",
      description:
        "Students architect, build, and deploy a complete, production-ready frontend web application featuring TypeScript, React/Next.js, responsive layouts, API data fetching, and live GitHub deployment.",
      deliverables: [
        "Fully responsive multi-page web application hosted on Vercel or Netlify",
        "Type-safe TypeScript codebase adhering to ESLint standards",
        "Public GitHub repository with comprehensive README, documentation, and commit history",
        "Live 1-on-1 code walkthrough and mentor evaluation",
      ],
      reviewFormat: "Live 1-on-1 code walkthrough with senior frontend mentor",
    },
  },

  "website-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "HTML5 — Web Structure & Semantics",
        courseSlug: "html5",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Semantic page architecture & header/nav hierarchy",
          "Forms, inputs & client-side validation attributes",
          "SEO fundamentals & metadata tags",
        ],
        projectTitle: "Semantic Multi-Page Business Website Wireframe",
        progressionNote:
          "Builds the document hierarchy before applying responsive CSS styling.",
      },
      {
        courseNumber: 2,
        courseTitle: "CSS3 — Responsive Styling & Flexbox/Grid",
        courseSlug: "css3",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Box model, typography & color palettes",
          "Mobile-first responsive design & media queries",
          "Flexbox & CSS Grid website layouts",
        ],
        projectTitle: "Responsive Multi-Device Business Landing Page",
        progressionNote:
          "Enables rapid prototyping with Bootstrap components.",
      },
      {
        courseNumber: 3,
        courseTitle: "Bootstrap 5 — Rapid Layout Assembly",
        courseSlug: "bootstrap-5",
        durationEstimate: "3 weeks",
        coreChapters: [
          "Grid system, container breakpoints & columns",
          "Prebuilt navigation bars, cards, carousels & modals",
          "Utility classes & custom brand styling",
        ],
        projectTitle: "Modern Commercial Agency Website",
        progressionNote:
          "Prepares developers to add interactive JavaScript features.",
      },
      {
        courseNumber: 4,
        courseTitle: "JavaScript — Interactive Web Widgets",
        courseSlug: "javascript",
        durationEstimate: "4 weeks",
        coreChapters: [
          "DOM manipulation for dropdowns, sliders & tabs",
          "Interactive form validation & submission handling",
          "Local storage & dynamic UI updates",
        ],
        projectTitle: "Interactive Lead Generation Website with Custom Widgets",
        progressionNote:
          "Transitions to Git version control and live web hosting.",
      },
      {
        courseNumber: 5,
        courseTitle: "Git & Deployment — Web Publishing & Hosting",
        courseSlug: "git-github",
        durationEstimate: "2 weeks",
        coreChapters: [
          "Git repository initialization & version tracking",
          "GitHub Pages, Netlify & Vercel deployment",
          "Custom domain configuration, DNS & SSL certificates",
        ],
        projectTitle: "Live Deployed Custom Client Portal",
        progressionNote:
          "Leads directly into the final comprehensive business website capstone.",
      },
    ],
    capstone: {
      title: "Custom Multi-Page Business Website with Interactive Forms",
      description:
        "Design, code, and deploy a complete commercial business website with responsive pages, working interactive inquiry forms, mobile navigation, technical SEO tags, and custom domain deployment.",
      deliverables: [
        "Live deployed multi-page website tested on mobile, tablet, and desktop",
        "Interactive contact forms with client-side validation",
        "Complete Git version history on GitHub",
        "Performance and SEO validation score report",
      ],
      reviewFormat: "Live mentor review of responsiveness, forms, and code structure",
    },
  },

  "backend-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Python — Server-Side Core Engineering",
        courseSlug: "python",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Syntax, data structures & control flow",
          "Modular architecture, packages & virtual environments",
          "File processing & exception handling",
        ],
        projectTitle: "Modular File Processing & System Automation Tool",
        progressionNote:
          "Provides the programming language foundation for object-oriented backend design.",
      },
      {
        courseNumber: 2,
        courseTitle: "OOP — Object-Oriented Software Design",
        courseSlug: "oop",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Classes, encapsulation & inheritance",
          "Polymorphism, abstraction & interfaces",
          "SOLID principles & design patterns",
        ],
        projectTitle: "Extensible Backend Domain Entity Architecture",
        progressionNote:
          "Ensures clean architecture principles before implementing database systems.",
      },
      {
        courseNumber: 3,
        courseTitle: "DSA — Algorithmic Foundations for Backends",
        courseSlug: "dsa",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Time & space complexity (Big-O analysis)",
          "Stacks, queues, linked lists & hash tables",
          "Sorting, searching & recursion",
        ],
        projectTitle: "High-Efficiency Data Lookup & Caching Engine",
        progressionNote:
          "Teaches algorithmic performance optimization for backend APIs.",
      },
      {
        courseNumber: 4,
        courseTitle: "SQL & Relational Databases — Schema Design",
        courseSlug: "sql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Relational modeling, primary & foreign keys",
          "Complex multi-table JOINs, GROUP BY & subqueries",
          "Transactions (ACID) & database indexing",
        ],
        projectTitle: "Normalized Multi-Table Relational Database Schema",
        progressionNote:
          "Builds the persistence layer required for RESTful web services.",
      },
      {
        courseNumber: 5,
        courseTitle: "PostgreSQL — Enterprise Relational Engine",
        courseSlug: "postgresql",
        durationEstimate: "3 weeks",
        coreChapters: [
          "PostgreSQL administration & data types (JSONB, UUID)",
          "Query optimization with EXPLAIN ANALYZE",
          "Constraints, triggers & connection pooling",
        ],
        projectTitle: "Optimized Enterprise Database Service",
        progressionNote:
          "Enables high-throughput API endpoints with robust data persistence.",
      },
      {
        courseNumber: 6,
        courseTitle: "REST APIs & Web Services — Architecture & Auth",
        courseSlug: "rest-apis",
        durationEstimate: "5 weeks",
        coreChapters: [
          "HTTP semantics, RESTful constraints & status codes",
          "Authentication (JWT, API keys) & role-based permissions",
          "API documentation with OpenAPI / Swagger & Postman tests",
        ],
        projectTitle: "Secure Multi-Resource RESTful API Service",
        progressionNote:
          "Unifies database, OOP, and web protocols into the production capstone.",
      },
    ],
    capstone: {
      title: "Production-Ready REST API Service with Auth & Relational Database",
      description:
        "Build and deploy an enterprise-grade RESTful API service featuring JWT authentication, role-based access control, PostgreSQL persistence, database migrations, comprehensive unit tests, and interactive API documentation.",
      deliverables: [
        "Fully documented REST API with Swagger/OpenAPI specifications",
        "PostgreSQL schema with migrations, relational constraints, and indexes",
        "Automated unit and integration test suite passing in CI",
        "Live deployment with environment variable management",
      ],
      reviewFormat: "Live API demonstration, security review, and database audit",
    },
  },

  "full-stack-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Web Standards — HTML5, CSS3 & Responsive UI",
        courseSlug: "html5",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Semantic HTML5 & accessible form structures",
          "CSS3 Flexbox, CSS Grid & responsive layout design",
          "Bootstrap 5 utility grid & rapid layout prototyping",
        ],
        projectTitle: "Responsive Client Portal Interface",
        progressionNote:
          "Establishes frontend styling foundation before writing modern client logic.",
      },
      {
        courseNumber: 2,
        courseTitle: "JavaScript & TypeScript — Dynamic Type-Safe Logic",
        courseSlug: "javascript",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Modern JavaScript (ES6+): Async, promises & DOM APIs",
          "TypeScript static typing: Interfaces, generics & compiler",
          "Modular code structure & error handling",
        ],
        projectTitle: "Type-Safe Client Dashboard Application",
        progressionNote:
          "Prepares type systems and logic for React component engineering.",
      },
      {
        courseNumber: 3,
        courseTitle: "React.js — Declarative Frontend Architecture",
        courseSlug: "react",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Component state, props & lifecycle with hooks",
          "Client-side routing, context & state management",
          "Consuming REST APIs & handling network states",
        ],
        projectTitle: "Interactive Single-Page React Application",
        progressionNote:
          "Expands into Next.js server components and full-stack capabilities.",
      },
      {
        courseNumber: 4,
        courseTitle: "Next.js — Full-Stack Server-Rendered Platform",
        courseSlug: "nextjs",
        durationEstimate: "4 weeks",
        coreChapters: [
          "App Router, server components & streaming SSR",
          "API routes, server actions & authentication flows",
          "Performance optimization & SEO metadata",
        ],
        projectTitle: "High-Performance SSR Web Application",
        progressionNote:
          "Completes client engineering; begins deep server-side Python engineering.",
      },
      {
        courseNumber: 5,
        courseTitle: "Python & OOP — Server-Side Architecture",
        courseSlug: "python",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Core Python syntax, data structures & file I/O",
          "Object-Oriented Programming (classes, inheritance, SOLID)",
          "Modular backend structure & virtual environments",
        ],
        projectTitle: "Modular Python Backend Core Engine",
        progressionNote:
          "Establishes backend programming foundation before database modeling.",
      },
      {
        courseNumber: 6,
        courseTitle: "SQL & PostgreSQL — Relational Data Management",
        courseSlug: "postgresql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Relational schema design, normalization & keys",
          "PostgreSQL complex queries, indexing & ACID transactions",
          "Data migrations & connection pooling",
        ],
        projectTitle: "Production Relational PostgreSQL Database",
        progressionNote:
          "Enables persistent data storage for full-stack API integration.",
      },
      {
        courseNumber: 7,
        courseTitle: "REST APIs & Web Services — Backend Integration",
        courseSlug: "rest-apis",
        durationEstimate: "3 weeks",
        coreChapters: [
          "RESTful endpoints, HTTP protocols & status codes",
          "JWT authentication, CORS & authorization layers",
          "Connecting React/Next.js frontend with Python APIs",
        ],
        projectTitle: "Full-Stack Integrated API Client System",
        progressionNote:
          "Integrates frontend and backend before version control and deployment.",
      },
      {
        courseNumber: 8,
        courseTitle: "Git, DevOps & Cloud Deployment",
        courseSlug: "git-github",
        durationEstimate: "2 weeks",
        coreChapters: [
          "Git branching, PR workflows & code reviews",
          "Environment configuration, secrets management & CI/CD",
          "Cloud deployment (Vercel, Railway/Render) & monitoring",
        ],
        projectTitle: "Live Deployed Full-Stack Application",
        progressionNote:
          "Culminates in the final end-to-end production SaaS capstone project.",
      },
    ],
    capstone: {
      title: "Full-Scale SaaS Web Application Built & Deployed End to End",
      description:
        "Architect, build, test, and deploy a complete production-grade SaaS web application uniting a Next.js/React frontend with a Python/PostgreSQL backend, featuring user authentication, database persistence, and live cloud deployment.",
      deliverables: [
        "Live deployed full-stack application on public domain",
        "React/Next.js frontend with responsive UI and client validation",
        "Python REST backend with PostgreSQL database and migrations",
        "Clean Git repository with complete setup and architecture documentation",
      ],
      reviewFormat: "Comprehensive end-to-end technical evaluation with senior architect",
    },
  },

  "python-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Python — Core Language & Standard Library",
        courseSlug: "python",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Syntax, data types, control flow & comprehensions",
          "Functions, scope, *args/**kwargs & lambda expressions",
          "File processing (CSV, JSON) & exception handling",
        ],
        projectTitle: "Command-Line File & Data Automation Utility",
        progressionNote:
          "Provides fundamental programming fluency before object-oriented architecture.",
      },
      {
        courseNumber: 2,
        courseTitle: "OOP — Object-Oriented Software Engineering",
        courseSlug: "oop",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Classes, instances, attributes & methods",
          "Inheritance, encapsulation & polymorphism",
          "SOLID design principles & design patterns in Python",
        ],
        projectTitle: "Object-Oriented Business Domain Engine",
        progressionNote:
          "Ensures maintainable code structure before algorithmic problem solving.",
      },
      {
        courseNumber: 3,
        courseTitle: "DSA — Data Structures & Algorithmic Thinking",
        courseSlug: "dsa",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Lists, dictionaries, sets & algorithmic Big-O analysis",
          "Stacks, queues, linked lists & binary search trees",
          "Sorting, searching & recursive problem-solving",
        ],
        projectTitle: "Algorithmic Search & Data Indexing Engine",
        progressionNote:
          "Builds computational problem solving required for data-intensive tools.",
      },
      {
        courseNumber: 4,
        courseTitle: "SQL & Relational Databases — Python Integration",
        courseSlug: "sql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Relational schema design, tables & foreign keys",
          "Complex SQL queries, multi-table joins & aggregations",
          "Connecting Python to PostgreSQL with psycopg & SQLAlchemy",
        ],
        projectTitle: "Database-Backed Data Management Application",
        progressionNote:
          "Connects Python programs with persistent enterprise databases.",
      },
      {
        courseNumber: 5,
        courseTitle: "REST APIs & Web Services — Backend Architecture",
        courseSlug: "rest-apis",
        durationEstimate: "4 weeks",
        coreChapters: [
          "REST principles, HTTP verbs & request/response lifecycle",
          "Building fast web APIs with Python frameworks (FastAPI/Django)",
          "JWT authentication, input validation & Postman testing",
        ],
        projectTitle: "High-Performance Python RESTful Web Service",
        progressionNote:
          "Leads directly into the final automation and web API capstone project.",
      },
    ],
    capstone: {
      title: "Multi-Module Python Automation & Web API Project",
      description:
        "Build an integrated Python project combining automated data processing, database persistence with PostgreSQL, and a high-speed REST API endpoint with authentication and automated test suites.",
      deliverables: [
        "Tested Python package adhering strictly to PEP 8 standards",
        "PostgreSQL integration with automated schema migrations",
        "REST API endpoints with interactive Swagger documentation",
        "Automated pytest test suite with high coverage",
      ],
      reviewFormat: "Live code walkthrough and automated test evaluation",
    },
  },

  "database-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Database Fundamentals — Relational Theory & ACID",
        courseSlug: "database-fundamentals",
        durationEstimate: "4 weeks",
        coreChapters: [
          "DBMS architecture, file systems vs. relational databases",
          "Entity-Relationship Modeling (ERD) & cardinalities",
          "ACID transactions, relational algebra & Codd's rules",
        ],
        projectTitle: "Complete Enterprise Entity-Relationship Data Model",
        progressionNote:
          "Establishes theoretical grounding before implementing physical schemas in SQL.",
      },
      {
        courseNumber: 2,
        courseTitle: "SQL — Advanced Query Engineering",
        courseSlug: "sql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Data Definition (DDL) & Data Manipulation (DML)",
          "Multi-table JOINs, subqueries & Common Table Expressions (CTEs)",
          "Window functions, aggregations & complex filtering",
        ],
        projectTitle: "Complex Multi-Table Analytical Query Suite",
        progressionNote:
          "Provides advanced SQL fluency before exploring specific database engines.",
      },
      {
        courseNumber: 3,
        courseTitle: "MySQL — Administration & High-Performance Storage",
        courseSlug: "mysql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "MySQL 8.0 installation, user privileges & security",
          "InnoDB storage engine, locking & transaction isolation",
          "B-Tree index optimization & slow query logging",
        ],
        projectTitle: "Optimized High-Concurrency MySQL Database Instance",
        progressionNote:
          "Contrasts MySQL engine architecture with PostgreSQL enterprise features.",
      },
      {
        courseNumber: 4,
        courseTitle: "PostgreSQL — Enterprise Architecture & Advanced Types",
        courseSlug: "postgresql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Advanced data types (JSONB, Arrays, UUID) & extensions",
          "Query execution plan analysis with EXPLAIN ANALYZE",
          "Partial indexes, GIN indexes & connection management",
        ],
        projectTitle: "Enterprise PostgreSQL Architecture with JSONB Indexing",
        progressionNote:
          "Transitions from relational systems to NoSQL document data models.",
      },
      {
        courseNumber: 5,
        courseTitle: "MongoDB — Document Database Modeling & NoSQL",
        courseSlug: "mongodb",
        durationEstimate: "4 weeks",
        coreChapters: [
          "NoSQL paradigms: Document vs. Relational models",
          "BSON documents, collections & CRUD operations",
          "MongoDB Aggregation Framework & compound indexing",
        ],
        projectTitle: "Scalable Document-Oriented NoSQL Database Store",
        progressionNote:
          "Prepares developers for the comprehensive multi-model database capstone.",
      },
    ],
    capstone: {
      title: "Enterprise Database Architecture, Schemas & Migration Scripts",
      description:
        "Design and implement a complete enterprise data layer featuring normalized PostgreSQL schemas, optimized indexes, backup/restore procedures, automated migration scripts, and a companion MongoDB document store.",
      deliverables: [
        "Production-grade SQL schema with DDL, constraints, and index strategies",
        "Benchmarked query execution plans demonstrating optimization",
        "Automated migration and seed scripts for reproducible deployment",
        "Architectural data dictionary and ERD documentation",
      ],
      reviewFormat: "Live database architectural defense and query benchmark audit",
    },
  },

  "mobile-application-developer": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "JavaScript & TypeScript — Mobile Foundations",
        courseSlug: "javascript",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Modern ES6+ syntax: Async/await, modules & immutability",
          "TypeScript static typing: Interfaces & type safety",
          "Client-side event architectures & functional paradigms",
        ],
        projectTitle: "Type-Safe Mobile Business Logic Library",
        progressionNote:
          "Builds the language foundation required for declarative mobile UI engineering.",
      },
      {
        courseNumber: 2,
        courseTitle: "React — Declarative Component Foundations",
        courseSlug: "react",
        durationEstimate: "4 weeks",
        coreChapters: [
          "React component lifecycle, JSX & virtual DOM",
          "useState, useEffect & custom hooks for state",
          "Modular component design & props validation",
        ],
        projectTitle: "Modular Declarative Component Suite",
        progressionNote:
          "Enables seamless transition to React Native mobile UI components.",
      },
      {
        courseNumber: 3,
        courseTitle: "React Native — Cross-Platform Core UI",
        durationEstimate: "4 weeks",
        coreChapters: [
          "View, Text, Image, ScrollView & FlatList components",
          "Flexbox layout styling with StyleSheet for iOS & Android",
          "Touch interactions, buttons, inputs & safe area handling",
        ],
        projectTitle: "Cross-Platform Mobile Interface & Feed Layout",
        progressionNote:
          "Prepares multi-screen navigation flows and global application state.",
      },
      {
        courseNumber: 4,
        courseTitle: "React Navigation & State — Multi-Screen Apps",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Stack, Tab & Drawer navigation hierarchies",
          "Screen parameter passing & deep linking concepts",
          "Application-wide state management & form handling",
        ],
        projectTitle: "Multi-Screen Interactive Mobile Application",
        progressionNote:
          "Connects mobile applications to backend REST APIs and local storage.",
      },
      {
        courseNumber: 5,
        courseTitle: "API Integration & Device Features — Mobile Production",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Consuming REST APIs & handling network states/offline mode",
          "Local storage with AsyncStorage / SQLite",
          "Device hardware APIs: Camera, geolocation & push notifications",
        ],
        projectTitle: "Connected Mobile Application with Offline Persistence",
        progressionNote:
          "Leads directly into the final cross-platform mobile capstone application.",
      },
    ],
    capstone: {
      title: "Complete Cross-Platform Mobile Application with Live API Integration",
      description:
        "Build, test, and package a production-quality cross-platform mobile app for iOS and Android featuring multi-screen navigation, live API data synchronization, offline local storage, and release bundling.",
      deliverables: [
        "Complete React Native application runnable on iOS and Android",
        "Secure REST API integration with token authentication",
        "Offline storage caching and graceful error handling",
        "Documented GitHub repository and release bundle (APK / simulator build)",
      ],
      reviewFormat: "Live mobile device / simulator demonstration and code review",
    },
  },

  "data-analyst": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Python — Analytical Programming Core",
        courseSlug: "python",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Core syntax, data types, lists & dictionaries",
          "Functions, comprehensions & modular script execution",
          "Reading and parsing tabular data files (CSV, TSV, JSON)",
        ],
        projectTitle: "Automated Tabular Data File Ingestion & Parsing Tool",
        progressionNote:
          "Provides the programming fluency required for SQL extraction and data libraries.",
      },
      {
        courseNumber: 2,
        courseTitle: "SQL for Data Analysis — Querying & Aggregations",
        courseSlug: "sql",
        durationEstimate: "4 weeks",
        coreChapters: [
          "SELECT filtering, sorting & group-by aggregations",
          "Multi-table JOINs, subqueries & CTEs for business questions",
          "Window functions: Running totals, rankings & moving averages",
        ],
        projectTitle: "Business Intelligence SQL Extraction & Reporting Suite",
        progressionNote:
          "Enables direct database querying before in-depth Python data wrangling.",
      },
      {
        courseNumber: 3,
        courseTitle: "NumPy — Numerical Array Computing",
        courseSlug: "numpy",
        durationEstimate: "3 weeks",
        coreChapters: [
          "N-dimensional arrays, data types & vectorization",
          "Array slicing, indexing, boolean masking & broadcasting",
          "Mathematical, statistical & linear algebra operations",
        ],
        projectTitle: "High-Performance Numerical Array Computation Engine",
        progressionNote:
          "Provides the computational backbone for Pandas DataFrame manipulation.",
      },
      {
        courseNumber: 4,
        courseTitle: "Pandas — Tabular Data Wrangling & Cleaning",
        courseSlug: "pandas",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Series & DataFrame data structures, indexing & filtering",
          "Handling missing data, duplicate records & type coercion",
          "Group-by aggregations, pivot tables, merging & reshaping",
        ],
        projectTitle: "Real-World Dataset Cleaning & Transformation Pipeline",
        progressionNote:
          "Prepares clean, structured datasets for statistical hypothesis testing.",
      },
      {
        courseNumber: 5,
        courseTitle: "Statistics for Data — Inferential & Descriptive Analysis",
        courseSlug: "statistics-for-data",
        durationEstimate: "3 weeks",
        coreChapters: [
          "Measures of central tendency, dispersion & skewness",
          "Probability distributions (Normal, Binomial, Uniform)",
          "Hypothesis testing, correlation analysis & confidence intervals",
        ],
        projectTitle: "Statistical Hypothesis Testing & Analysis Report",
        progressionNote:
          "Equips analysts to validate findings statistically before visualizing.",
      },
      {
        courseNumber: 6,
        courseTitle: "Matplotlib & Visualization — Communicating Insights",
        courseSlug: "matplotlib",
        durationEstimate: "3 weeks",
        coreChapters: [
          "Figure and Axes object-oriented plotting architecture",
          "Bar charts, line graphs, histograms, box plots & scatter plots",
          "Publication-quality chart formatting, annotations & color scales",
        ],
        projectTitle: "Executive Visual Analytics Dashboard & Presentation",
        progressionNote:
          "Combines wrangling, statistics, and charts into the final capstone.",
      },
    ],
    capstone: {
      title: "Comprehensive Data Analysis Report on Real Business Datasets",
      description:
        "Perform a complete exploratory data analysis (EDA) on a real-world business dataset: extracting with SQL, cleaning with Pandas, conducting statistical tests, generating visual dashboards, and delivering actionable executive recommendations.",
      deliverables: [
        "Reproducible Jupyter notebook with end-to-end analysis workflow",
        "Cleaned, validated dataset and documented transformation pipeline",
        "Publication-quality visualization figures and dashboard metrics",
        "Executive findings report with actionable business takeaways",
      ],
      reviewFormat: "Executive insight presentation and live notebook walkthrough",
    },
  },

  "data-science": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Python — Scientific Programming",
        courseSlug: "python",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Python syntax, functions & scientific environments",
          "Working with files, modules & packages",
          "Object-oriented programming for data pipelines",
        ],
        projectTitle: "Modular Scientific Data Ingestion Module",
        progressionNote:
          "Provides fundamental language skills for numerical computing.",
      },
      {
        courseNumber: 2,
        courseTitle: "SQL & Relational Querying — Feature Extraction",
        courseSlug: "sql",
        durationEstimate: "3 weeks",
        coreChapters: [
          "Querying relational datasets & table aggregations",
          "Complex JOINs, window functions & feature extraction",
          "Exporting curated SQL extracts into Python pipelines",
        ],
        projectTitle: "Relational Feature Extraction SQL Pipeline",
        progressionNote:
          "Connects database queries with scientific array libraries.",
      },
      {
        courseNumber: 3,
        courseTitle: "NumPy & Pandas — Array Computing & Data Wrangling",
        courseSlug: "pandas",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Vectorized array computing with NumPy",
          "Pandas DataFrames: Cleaning, merging & time series",
          "Outlier detection, imputation & feature transformation",
        ],
        projectTitle: "Comprehensive Dataset Cleaning & Feature Preprocessing",
        progressionNote:
          "Prepares datasets for statistical modeling and hypothesis testing.",
      },
      {
        courseNumber: 4,
        courseTitle: "Statistics for Data — Probability & Inference",
        courseSlug: "statistics-for-data",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Probability theory, random variables & distributions",
          "Central Limit Theorem, sampling & confidence intervals",
          "Hypothesis tests (t-tests, ANOVA, Chi-Square)",
        ],
        projectTitle: "Inferential Statistical Analysis & Experiment Report",
        progressionNote:
          "Builds mathematical intuition required for machine learning algorithms.",
      },
      {
        courseNumber: 5,
        courseTitle: "Data Analysis Foundations — Exploratory Data Analysis",
        courseSlug: "data-analysis-foundations",
        durationEstimate: "3 weeks",
        coreChapters: [
          "CRISP-DM methodology & research problem formulation",
          "Univariate, bivariate & multivariate EDA with Seaborn",
          "Feature correlation & dimensionality assessment",
        ],
        projectTitle: "Deep Exploratory Data Analysis & Feature Exploration",
        progressionNote:
          "Informs feature selection for predictive machine learning models.",
      },
      {
        courseNumber: 6,
        courseTitle: "Scikit-Learn — Predictive Machine Learning Modeling",
        courseSlug: "scikit-learn",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Supervised learning: Linear models, Decision Trees & Random Forests",
          "Data preprocessing, Pipelines & ColumnTransformer",
          "Cross-validation, hyperparameter tuning & evaluation metrics",
        ],
        projectTitle: "Tuned Predictive Machine Learning Model Pipeline",
        progressionNote:
          "Culminates in the end-to-end data science lifecycle capstone project.",
      },
    ],
    capstone: {
      title: "End-to-End Data Science Project: Raw Data to Predictive Modeling",
      description:
        "Execute the entire data science methodology on an uncleaned real-world dataset: problem framing, data wrangling, EDA, feature engineering, statistical hypothesis testing, model training with scikit-learn, and objective performance evaluation.",
      deliverables: [
        "Documented reproducible Jupyter notebook from raw data to predictions",
        "Preprocessed feature dataset with documented transformations",
        "Evaluated machine learning models with ROC-AUC, RMSE, and confusion matrices",
        "Executive presentation detailing methodology, results, and limitations",
      ],
      reviewFormat: "Scientific defense and live model verification review",
    },
  },

  "ai-machine-learning": {
    courses: [
      {
        courseNumber: 1,
        courseTitle: "Python Scientific Stack — NumPy & Pandas Pipelines",
        courseSlug: "numpy",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Vectorized array operations & matrix mathematics",
          "Pandas data transformation & pipeline engineering",
          "Efficient memory management for large datasets",
        ],
        projectTitle: "High-Throughput Vectorized Data Preprocessing Pipeline",
        progressionNote:
          "Builds computational foundations before mathematical modeling.",
      },
      {
        courseNumber: 2,
        courseTitle: "Mathematics & Statistics for Machine Learning",
        courseSlug: "statistics-for-data",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Linear algebra: Vectors, matrices, dot products & eigenvalues",
          "Calculus intuition: Gradients, partial derivatives & optimization",
          "Probability distributions, Bayes' theorem & maximum likelihood",
        ],
        projectTitle: "Mathematical Optimization & Gradient Descent Engine",
        progressionNote:
          "Demystifies the algorithmic mechanics behind machine learning estimators.",
      },
      {
        courseNumber: 3,
        courseTitle: "Data Science Foundations — Feature Engineering & EDA",
        courseSlug: "data-science-foundations",
        durationEstimate: "3 weeks",
        coreChapters: [
          "Exploratory analysis, feature correlation & distributions",
          "Encoding categorical features, scaling & handling outliers",
          "Train/test splits, stratification & leakage prevention",
        ],
        projectTitle: "Leakage-Free Feature Engineering & Transformation Pipeline",
        progressionNote:
          "Prepares clean, leakage-free feature matrices for estimator training.",
      },
      {
        courseNumber: 4,
        courseTitle: "Scikit-Learn — Supervised Learning Algorithms",
        courseSlug: "scikit-learn",
        durationEstimate: "5 weeks",
        coreChapters: [
          "Linear & Logistic Regression, regularization (L1/L2)",
          "Decision Trees, Random Forests & Ensemble methods",
          "Support Vector Machines (SVM) & classification boundaries",
        ],
        projectTitle: "Supervised Classifier & Regressor Evaluation Suite",
        progressionNote:
          "Transitions to unsupervised learning, clustering, and tuning.",
      },
      {
        courseNumber: 5,
        courseTitle: "Unsupervised Learning & Model Optimization",
        courseSlug: "ai-ml-foundations",
        durationEstimate: "4 weeks",
        coreChapters: [
          "K-Means clustering, hierarchical clustering & silhouette scores",
          "Principal Component Analysis (PCA) dimensionality reduction",
          "GridSearchCV, RandomizedSearchCV & cross-validation strategies",
        ],
        projectTitle: "Clustering & Dimensionality Reduction Pipeline",
        progressionNote:
          "Prepares models for serialization, API serving, and the final capstone.",
      },
      {
        courseNumber: 6,
        courseTitle: "Model Serving & AI API Integration",
        durationEstimate: "4 weeks",
        coreChapters: [
          "Model serialization with Joblib / Pickle",
          "Building inference REST endpoints with Python web APIs",
          "Integrating modern AI APIs & deep learning orientation",
        ],
        projectTitle: "Live Machine Learning Model Inference API Service",
        progressionNote:
          "Culminates in the production machine learning pipeline capstone.",
      },
    ],
    capstone: {
      title: "Production-Ready Machine Learning Pipeline with Live Inference",
      description:
        "Build, tune, evaluate, serialize, and serve a complete machine learning model pipeline. Features strict leakage prevention, cross-validated hyperparameter tuning, standardized metrics, and a working inference REST API endpoint.",
      deliverables: [
        "End-to-end Scikit-Learn Pipeline with preprocessing and model estimation",
        "Benchmarked model evaluation report with precision, recall, and ROC curves",
        "Serialized model artifacts and working Python inference REST API",
        "Documented GitHub repository and reproducible deployment instructions",
      ],
      reviewFormat: "Live inference demonstration and technical model architecture audit",
    },
  },
};

export function getSpecializationJourney(slug: string) {
  return specializationJourneys[slug] || null;
}

