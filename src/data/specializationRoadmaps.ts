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
  pricingNote:
    "Fixed one-to-one monthly fee. Recorded lectures, guided practice, and multiple portfolio projects are included.",
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
          "Technical SEO & metadata",
          "Image, font & asset optimization",
          "Domains, DNS, SSL & hosting",
          "Accessibility & responsive QA",
          "Analytics & launch checklist",
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
          "Django project architecture & settings",
          "Models, migrations & ORM queries",
          "DRF serializers, views & routers",
          "JWT authentication & permissions",
          "Filtering, pagination & API documentation",
          "Testing, logging & production deployment",
        ],
        project: "Build and deploy an authenticated Django REST API with PostgreSQL.",
      },
      {
        title: "FastAPI Backend Services",
        duration: "45 days",
        chapters: [
          "FastAPI routing & dependency injection",
          "Pydantic validation",
          "Database sessions & service layers",
          "Authentication & authorization",
          "Testing, OpenAPI & deployment",
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
          "OS, pathlib & file automation",
          "CSV, JSON & data validation",
          "Web requests & API clients",
          "Web scraping boundaries & parsing",
          "Scheduling, logging & configuration",
          "Testing automation workflows",
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
          "Workload and query-plan analysis",
          "Index strategy & anti-patterns",
          "Transactions, locks & concurrency",
          "Roles, auditing & data protection",
          "Backup, restore & migration planning",
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
          "React Native components & styling",
          "Stack, tab & drawer navigation",
          "Forms, validation & device-safe layouts",
          "REST APIs, authentication & network states",
          "Local storage, caching & offline awareness",
          "Camera, location & notification concepts",
        ],
        project: "Build a multi-screen mobile application connected to a live API.",
      },
      {
        title: "Mobile Testing & Release",
        duration: "30 days",
        chapters: [
          "Component and integration testing",
          "Performance & accessibility review",
          "Environment configuration",
          "Android/iOS build and store-readiness concepts",
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
          "Power Query cleaning",
          "Data modeling & star schema",
          "Relationships & date tables",
          "DAX measures & calculated columns",
          "KPIs, filters & interactive dashboards",
          "Validation, publishing & stakeholder storytelling",
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
          "Bias, fairness & limitations",
          "Model cards & experiment tracking",
          "AI API integration patterns",
          "Monitoring & human review boundaries",
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
