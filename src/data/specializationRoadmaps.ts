import { getCourse, type Course } from "@/data/courses";
import { getCourseRoadmap } from "@/data/courseRoadmaps";

export interface SpecializationCoursePlan {
  title: string;
  duration: string;
  chapters: string[];
  project: string;
  courseSlug?: string;
}

export interface SpecializationRoadmap {
  classesPerWeek: string;
  oneToOneFee: string;
  groupFee: string;
  groupDiscount: string;
  groupSize: string;
  oneToOneDescription: string;
  groupDescription: string;
  pricingNote: string;
  courses: SpecializationCoursePlan[];
  capstoneProject: string;
}

type CourseReference =
  | { courseSlug: string; project?: string }
  | {
      title: string;
      duration: string;
      chapters: string[];
      project: string;
    };

const commonDelivery = {
  classesPerWeek: "4 live online classes/week",
  oneToOneFee: "PKR 15,000/month",
  groupFee: "PKR 6,000/month",
  groupDiscount: "60% OFF",
  groupSize: "5–10 students",
  oneToOneDescription:
    "Dedicated live classes at an agreed schedule, with individual pacing, direct instructor attention, recordings, and project feedback.",
  groupDescription:
    "Live online cohort for 5–10 students on a fixed shared timetable, with recordings, guided practice, and the same verified project roadmap.",
  pricingNote:
    "Choose dedicated one-to-one mentoring or a 5–10 student live group batch with 60% off. Both formats include recorded lectures, guided practice, multiple portfolio projects, and a final capstone.",
};

function resolveCourse(reference: CourseReference): SpecializationCoursePlan {
  if (!("courseSlug" in reference)) return reference;

  const course: Course | undefined = getCourse(reference.courseSlug);
  const roadmap = getCourseRoadmap(reference.courseSlug);
  if (!course || !roadmap) {
    throw new Error(`Unknown specialization course reference: ${reference.courseSlug}`);
  }

  return {
    courseSlug: reference.courseSlug,
    title: course.title,
    duration: roadmap.duration,
    chapters: roadmap.chapters.map((chapter) => chapter.title),
    project: reference.project ?? roadmap.capstoneProject,
  };
}

function specialization(
  references: CourseReference[],
  capstoneProject: string,
  oneToOneFee = commonDelivery.oneToOneFee,
): SpecializationRoadmap {
  return {
    ...commonDelivery,
    oneToOneFee,
    groupFee: oneToOneFee === "PKR 20,000/month" ? "PKR 8,000/month" : "PKR 6,000/month",
    courses: references.map(resolveCourse),
    capstoneProject,
  };
}

/**
 * Specializations are built from real, individually teachable courses.
 * Linked courses reuse the approved single-course roadmaps, which prevents the
 * specialization page and course page from describing different syllabi.
 */
export const specializationRoadmaps: Record<string, SpecializationRoadmap> = {
  "frontend-developer": specialization(
    [
      { courseSlug: "html5" },
      { courseSlug: "css3" },
      { courseSlug: "bootstrap-5" },
      { courseSlug: "javascript" },
      { courseSlug: "typescript" },
      { courseSlug: "react" },
      { courseSlug: "nextjs" },
      { courseSlug: "git-github" },
      {
        courseSlug: "rest-apis",
        project: "Integrate authenticated API data into the final frontend application.",
      },
    ],
    "Design, build, test, and deploy a production-ready frontend application with responsive UI, routing, forms, API integration, SEO, and a documented Git workflow.",
  ),

  "website-developer": specialization(
    [
      { courseSlug: "html5" },
      { courseSlug: "css3" },
      { courseSlug: "bootstrap-5" },
      {
        courseSlug: "javascript",
        project:
          "Add navigation, validation, filtering, and a practical API-powered widget to a business website.",
      },
      { courseSlug: "git-github" },
      {
        title: "Website SEO, Performance & Deployment",
        duration: "30 days",
        chapters: [
          "Technical SEO, metadata, structured data & crawlability",
          "Core Web Vitals, images, fonts & asset optimization",
          "Accessible forms, validation & conversion tracking",
          "Domains, DNS, SSL, hosting & deployment workflows",
          "Cross-device accessibility & responsive QA",
          "Analytics, Search Console & post-launch monitoring",
        ],
        project: "Audit, optimize, deploy, and document a client-ready website release.",
      },
    ],
    "Deliver a complete multi-page business website with working forms, technical SEO, analytics, accessibility, custom domain, and production deployment.",
  ),

  "backend-developer": specialization(
    [
      { courseSlug: "python" },
      { courseSlug: "oop" },
      {
        courseSlug: "dsa",
        project:
          "Implement and benchmark backend-focused collections, search, and scheduling problems.",
      },
      { courseSlug: "database-fundamentals" },
      { courseSlug: "sql" },
      { courseSlug: "postgresql" },
      { courseSlug: "rest-apis" },
      {
        title: "Django & Django REST Framework",
        duration: "60 days",
        chapters: [
          "Django project architecture, settings & environment management",
          "Models, migrations, ORM queries & transactions",
          "DRF serializers, validation, views & routers",
          "JWT/session authentication, permissions & role-based access",
          "Filtering, pagination, throttling & OpenAPI documentation",
          "Background tasks, caching & email workflows",
          "Automated testing, security review & observability",
          "ASGI/WSGI production deployment & release checklist",
        ],
        project: "Build and deploy an authenticated Django REST API with PostgreSQL.",
      },
      {
        title: "FastAPI Backend Services",
        duration: "45 days",
        chapters: [
          "FastAPI routing, async foundations & dependency injection",
          "Pydantic models, validation & settings",
          "SQL database sessions, repositories & service layers",
          "OAuth2/JWT authentication & authorization",
          "Error handling, background tasks & middleware",
          "Testing, OpenAPI contracts & API clients",
          "Logging, containerization & production deployment",
        ],
        project: "Build a tested FastAPI service with authentication and relational persistence.",
      },
    ],
    "Ship a production-style backend platform with secure authentication, role-based authorization, PostgreSQL, documented REST APIs, automated tests, logging, and deployment.",
  ),

  "full-stack-developer": specialization(
    [
      { courseSlug: "html5" },
      { courseSlug: "css3" },
      { courseSlug: "javascript" },
      { courseSlug: "typescript" },
      { courseSlug: "react" },
      { courseSlug: "nextjs" },
      { courseSlug: "python" },
      { courseSlug: "oop" },
      { courseSlug: "sql" },
      { courseSlug: "postgresql" },
      { courseSlug: "rest-apis" },
      {
        title: "Django, DRF & Full-Stack Integration",
        duration: "60 days",
        chapters: [
          "Django models, ORM & migrations",
          "DRF serializers, views & permissions",
          "JWT authentication & role-based access",
          "React/Next.js API integration",
          "Testing, CI/CD & production configuration",
        ],
        project: "Connect a secure Django API to a typed React or Next.js frontend.",
      },
    ],
    "Build and deploy a complete SaaS-style application with responsive frontend, secure Python API, PostgreSQL, authentication, admin workflows, tests, and CI/CD.",
    "PKR 20,000/month",
  ),

  "python-developer": specialization(
    [
      { courseSlug: "python" },
      { courseSlug: "oop" },
      { courseSlug: "dsa" },
      { courseSlug: "sql" },
      { courseSlug: "postgresql" },
      {
        title: "Python Automation & Data Processing",
        duration: "45 days",
        chapters: [
          "OS, pathlib, command-line tools & file automation",
          "CSV, JSON, spreadsheets & schema validation",
          "HTTP requests, REST API clients & authentication",
          "Responsible web scraping, parsing & rate limits",
          "Email, browser and repetitive workflow automation",
          "Scheduling, logging, configuration & secrets",
          "Testing, retries and idempotent automation workflows",
        ],
        project: "Build a reliable scheduled automation tool with logs and structured outputs.",
      },
      { courseSlug: "rest-apis" },
      {
        title: "FastAPI & Django Foundations",
        duration: "60 days",
        chapters: [
          "FastAPI services & validation",
          "Django architecture & ORM",
          "Authentication & permissions",
          "Testing & API documentation",
          "Deployment & environment management",
        ],
        project: "Deploy a Python web service backed by PostgreSQL.",
      },
    ],
    "Deliver a professional Python portfolio containing an automation tool, a relational application, and a tested deployed API service.",
  ),

  "database-developer": specialization(
    [
      { courseSlug: "database-fundamentals" },
      { courseSlug: "sql" },
      { courseSlug: "mysql" },
      { courseSlug: "postgresql" },
      { courseSlug: "mongodb" },
      {
        title: "Database Performance & Operations",
        duration: "45 days",
        chapters: [
          "Workload baselines, EXPLAIN & query-plan analysis",
          "B-tree, composite, partial and document index strategy",
          "Transactions, isolation, locks & concurrency",
          "Roles, auditing, encryption & data protection",
          "Connection pooling, monitoring & capacity signals",
          "Backup, restore, migrations & disaster-recovery drills",
        ],
        project: "Tune and document a database using measured before/after query evidence.",
      },
    ],
    "Design, implement, tune, secure, and document a multi-database solution with relational schemas, analytical queries, MongoDB use cases, migrations, and recovery evidence.",
  ),

  "mobile-application-developer": specialization(
    [
      { courseSlug: "javascript" },
      { courseSlug: "typescript" },
      {
        courseSlug: "react",
        project: "Build reusable stateful components and a tested API data flow.",
      },
      {
        title: "React Native Application Development",
        duration: "60 days",
        chapters: [
          "Expo setup, React Native components & platform-aware styling",
          "File-based, stack, tab & modal navigation",
          "Forms, validation, keyboard handling & safe-area layouts",
          "State management, REST APIs, authentication & network states",
          "Secure local storage, caching & offline synchronization",
          "Camera, media, location & push-notification workflows",
          "Accessibility, lists, images & performance profiling",
          "Error handling, analytics and production configuration",
        ],
        project: "Build a multi-screen mobile application connected to a live API.",
      },
      {
        title: "Mobile Testing & Release",
        duration: "30 days",
        chapters: [
          "Static analysis, component and integration testing",
          "End-to-end device testing and release QA",
          "Performance, accessibility & crash review",
          "Environment variables, signing & secure configuration",
          "EAS/native Android and iOS release builds",
          "Store assets, privacy declarations & submission readiness",
        ],
        project: "Prepare, test, and package a release-candidate mobile build.",
      },
    ],
    "Build a production-style cross-platform mobile application with authentication, live API data, offline-aware storage, device integration, tests, and release documentation.",
  ),

  "data-analyst": specialization(
    [
      {
        courseSlug: "python",
        project: "Create a reusable Python data-loading and validation utility.",
      },
      { courseSlug: "numpy" },
      { courseSlug: "pandas" },
      { courseSlug: "sql" },
      { courseSlug: "mysql" },
      { courseSlug: "statistics-for-data" },
      { courseSlug: "matplotlib" },
      { courseSlug: "data-analysis-foundations" },
      {
        title: "Power BI & Executive Reporting",
        duration: "45 days",
        chapters: [
          "Power Query connection, profiling, cleaning & transformation",
          "Dimensional modeling, star schema & grain",
          "Relationships, date tables & semantic model design",
          "DAX measures, calculated columns & variables",
          "Filter context, time intelligence & KPI validation",
          "Accessible visuals, drillthrough, tooltips & dashboard UX",
          "Performance Analyzer, refresh & row-level security",
          "Publishing, sharing & stakeholder storytelling",
        ],
        project: "Build a validated executive Power BI dashboard with documented KPIs.",
      },
    ],
    "Complete an end-to-end business analytics portfolio case using Python, MySQL, statistics, and Power BI, with a reproducible repository and executive recommendation.",
    "PKR 20,000/month",
  ),

  "data-science": specialization(
    [
      { courseSlug: "python" },
      { courseSlug: "numpy" },
      { courseSlug: "pandas" },
      { courseSlug: "sql" },
      { courseSlug: "statistics-for-data" },
      { courseSlug: "matplotlib" },
      { courseSlug: "data-science-foundations" },
      { courseSlug: "scikit-learn" },
    ],
    "Complete a reproducible data-science lifecycle project from SQL extraction and EDA through feature engineering, model evaluation, limitations, and stakeholder presentation.",
    "PKR 20,000/month",
  ),

  "ai-machine-learning": specialization(
    [
      { courseSlug: "python" },
      { courseSlug: "numpy" },
      { courseSlug: "pandas" },
      { courseSlug: "statistics-for-data" },
      { courseSlug: "ai-ml-foundations" },
      { courseSlug: "scikit-learn" },
      {
        courseSlug: "rest-apis",
        project: "Expose a trained model through a validated inference API.",
      },
      {
        title: "Responsible AI & Applied Integration",
        duration: "30 days",
        chapters: [
          "Problem framing, baseline selection & responsible data use",
          "Bias, fairness, privacy & documented limitations",
          "Model cards, reproducible experiments & evaluation evidence",
          "AI/ML API integration, validation & failure handling",
          "Drift, quality and operational monitoring",
          "Human review, escalation & safe-use boundaries",
        ],
        project: "Publish a model card and responsible-use review for the capstone system.",
      },
    ],
    "Build, evaluate, document, and demonstrate a practical ML pipeline with an inference API, model card, reproducible experiments, and clearly stated limitations.",
    "PKR 20,000/month",
  ),
};

export function getSpecializationRoadmap(slug: string): SpecializationRoadmap | undefined {
  return specializationRoadmaps[slug];
}
