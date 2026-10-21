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
  | { courseSlug: string; title?: string; duration?: string; chapters?: string[]; project?: string }
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
    title: reference.title ?? course.title,
    duration: reference.duration ?? roadmap.duration,
    chapters: reference.chapters ?? roadmap.chapters.map((chapter) => chapter.title),
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
      {
        courseSlug: "html5",
        title: "Stage 1 — HTML5: Web Development Foundations",
        duration: "Weeks 1–3 · 12 classes",
        chapters: [
          "Web fundamentals, VS Code and HTML document setup",
          "Semantic HTML5, headings, paragraphs, lists and links",
          "Images, tables, multimedia and organized page structure",
          "Forms, input types and built-in browser validation",
          "Accessibility, meaningful markup and basic on-page SEO",
        ],
        project: "Build a structured multi-page academy or local business website.",
      },
      {
        courseSlug: "css3",
        title: "Stage 2 — CSS3: Responsive Web Design",
        duration: "Weeks 4–7 · 16 classes",
        chapters: [
          "Selectors, cascade, specificity and the CSS box model",
          "Colors, typography, spacing and CSS custom properties",
          "Modern layouts using Flexbox and CSS Grid",
          "Mobile-first layouts, breakpoints and media queries",
          "Reusable design patterns, transitions and animations",
          "Accessibility, cross-browser and responsive testing",
        ],
        project: "Style a professional responsive business landing page for mobile, tablet and desktop.",
      },
      {
        courseSlug: "javascript",
        title: "Stage 3 — JavaScript: Fundamentals to Interactive Websites",
        duration: "Weeks 8–13 · 24 classes",
        chapters: [
          "Variables, data types, operators, conditions and loops",
          "Functions, scope, arrays, objects and modern ES6+ syntax",
          "DOM manipulation, browser events and event delegation",
          "Forms, validation, localStorage and browser debugging",
          "JSON, promises, async/await, Fetch API and error handling",
          "Modules, clean functions and basic code organization",
        ],
        project: "Build an interactive expense tracker or task manager with browser storage.",
      },
      {
        courseSlug: "git-github",
        title: "Stage 4 — Git & GitHub: Developer Workflow",
        duration: "Week 14 · 4 classes",
        chapters: [
          "Git installation, repositories, staging and commits",
          "Branches, merging and pull-request fundamentals",
          "GitHub repositories, README files and project documentation",
          "Publish and review a JavaScript project with version control",
        ],
        project: "Publish and document the JavaScript project on GitHub.",
      },
      {
        courseSlug: "react",
        title: "Stage 5 — React.js: Core Application Development",
        duration: "Weeks 15–19 · 20 classes",
        chapters: [
          "Create React projects with Vite, JSX and project structure",
          "Components, props, composition and reusable UI patterns",
          "Events, useState, conditional rendering and lists",
          "useEffect fundamentals, forms and controlled inputs",
          "React Router, navigation and multi-page SPA layouts",
          "Responsive component styling and debugging",
        ],
        project: "Capstone 1 — Build a complete responsive multi-page React business website with reusable components, routing and accessible contact forms.",
      },
      {
        title: "Stage 6 — Advanced React & REST API Integration",
        duration: "Weeks 20–24 · 20 classes",
        chapters: [
          "Custom hooks, useReducer and state management patterns",
          "Context API, shared state and component composition",
          "Consume REST APIs with Fetch or Axios and JSON",
          "Data loading, error, empty and retry states",
          "Search, filtering, pagination and supported frontend CRUD flows",
          "React form validation, accessibility and frontend testing",
          "Performance optimization, memoization basics and code splitting",
        ],
        project: "Capstone 2 — Build an API-integrated React student learning dashboard with courses, search, filters, stateful forms and reliable data states.",
      },
      {
        title: "Stage 7 — GitHub, Vercel Deployment & Portfolio Launch",
        duration: "Weeks 25–26 · 8 classes",
        chapters: [
          "Project cleanup, README documentation and production builds",
          "Connect GitHub repositories to Vercel and publish live URLs",
          "Configure React Router SPA rewrites and verify deep-link refreshes",
          "Set public environment variables and production API endpoints safely",
          "Test mobile layouts, accessibility, page speed and error handling",
          "Final portfolio presentation and deployment verification for both capstones",
        ],
        project: "Deploy both React capstones live on Vercel and document their URLs in GitHub repositories.",
      },
    ],
    "Two portfolio capstones: (1) a responsive multi-page React business website; (2) an API-integrated React student learning dashboard. Both must include GitHub documentation and verified live Vercel deployments.",
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
      {
        title: "Python Foundations & Practical Programming",
        duration: "6 weeks · 24 classes",
        chapters: [
          "Python setup, virtual environments, Git basics & developer workflow",
          "Variables, data types, operators, input/output & control flow",
          "Functions, scope, comprehensions & reusable program design",
          "Lists, tuples, dictionaries, sets & problem-solving patterns",
          "Modules, packages, pip & essential standard-library tools",
          "Files, CSV, JSON, exceptions, logging & debugging",
        ],
        project: "Build a modular command-line student, inventory, or expense-management application with file persistence and validation.",
      },
      {
        title: "Object-Oriented & Professional Python",
        duration: "4 weeks · 16 classes",
        chapters: [
          "Classes, objects, methods, constructors & instance state",
          "Encapsulation, properties, inheritance & polymorphism",
          "Composition, abstract interfaces & SOLID design foundations",
          "Iterators, generators, decorators & context managers",
          "Type hints, dataclasses, clean code & PEP 8",
          "pytest fundamentals, fixtures, mocking & testable architecture",
        ],
        project: "Build and test an object-oriented library, school, or booking-management system.",
      },
      {
        title: "Data Structures & Algorithms for Python Developers",
        duration: "3 weeks · 12 classes",
        chapters: [
          "Complexity basics and choosing appropriate data structures",
          "Stacks, queues, linked structures & practical use cases",
          "Recursion, searching, sorting & divide-and-conquer foundations",
          "Hash maps, sets, trees and traversal concepts",
          "Python problem-solving patterns and interview-style practice",
        ],
        project: "Implement and test a compact collection of reusable data structures and practical algorithms in Python.",
      },
      {
        title: "SQL & PostgreSQL for Python",
        duration: "3 weeks · 12 classes",
        chapters: [
          "Relational modeling, tables, keys, constraints & normalization",
          "SQL CRUD, filtering, aggregation, joins, subqueries & CTEs",
          "PostgreSQL setup, schemas, relationships, indexes & query plans",
          "Transactions, data integrity, roles, backup & restore foundations",
          "Python database access, parameterized queries & ORM concepts",
        ],
        project: "Design a normalized PostgreSQL database and connect it securely to a tested Python application.",
      },
      {
        title: "Django Web Application Development",
        duration: "6 weeks · 24 classes",
        chapters: [
          "Django project structure, apps, settings, URLs & request/response flow",
          "Models, ORM, relationships, migrations & Django admin",
          "Function-based and class-based views, templates & static assets",
          "Forms, validation, file uploads & user-friendly error handling",
          "Authentication, authorization, sessions & role-based access",
          "Reusable apps, email workflows, security and performance foundations",
        ],
        project: "Build a complete authenticated Django academy, booking, or business-management web application.",
      },
      {
        title: "Django REST Framework, Testing & Deployment",
        duration: "4 weeks · 16 classes",
        chapters: [
          "REST and HTTP fundamentals, serializers and validation",
          "APIView, generic views, viewsets, routers and filtering",
          "Token/JWT authentication, permissions, throttling & pagination",
          "API documentation, error contracts and frontend/client integration",
          "Django and API testing, environment variables & production security",
          "PostgreSQL deployment, static/media handling, logging & CI/CD basics",
        ],
        project: "Extend the Django application with a secure, documented and tested REST API, then deploy it with PostgreSQL.",
      },
    ],
    "Build, test, document, and deploy a production-style Django application with PostgreSQL, authentication, role-based workflows, a REST API, and a maintainable Python codebase.",
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
