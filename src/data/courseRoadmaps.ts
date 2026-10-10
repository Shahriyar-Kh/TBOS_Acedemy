export interface CourseRoadmapChapter {
  title: string;
  topics: string[];
  guidedTask: string;
}

export interface CourseRoadmap {
  duration: "30 days" | "45 days" | "60 days";
  classesPerWeek: "3–4 classes/week";
  chapters: CourseRoadmapChapter[];
  capstoneProject: string;
}

const chapter = (title: string, topics: string[], guidedTask: string): CourseRoadmapChapter => ({
  title,
  topics,
  guidedTask,
});

const roadmap = (
  duration: CourseRoadmap["duration"],
  chapters: CourseRoadmapChapter[],
  capstoneProject: string,
): CourseRoadmap => ({
  duration,
  classesPerWeek: "3–4 classes/week",
  chapters,
  capstoneProject,
});

/**
 * Approved single-course delivery roadmaps.
 *
 * Each course is intentionally bounded to 30–60 days at 3–4 classes per week.
 * Chapters expose the core topics, a guided end-of-chapter task, and one final
 * capstone so the public catalog describes a teachable course rather than a
 * loose technology list.
 */
export const courseRoadmaps: Record<string, CourseRoadmap> = {
  html5: roadmap(
    "30 days",
    [
      chapter(
        "Web & HTML Foundations",
        [
          "How browsers read HTML",
          "Document structure and metadata",
          "Elements, attributes, and nesting",
        ],
        "Create a valid first webpage with a complete head and body structure.",
      ),
      chapter(
        "Semantic Page Architecture",
        [
          "Header, nav, main, section, article, and footer",
          "Headings and content hierarchy",
          "Links, lists, and reusable page sections",
        ],
        "Convert a non-semantic page into an accessible semantic layout.",
      ),
      chapter(
        "Tables, Media & Embedded Content",
        [
          "Accessible data tables",
          "Images, audio, and video",
          "Responsive media and iframe safety",
        ],
        "Build a media-rich information page with captions and fallback content.",
      ),
      chapter(
        "Forms & Native Validation",
        [
          "Labels and form controls",
          "Modern input types",
          "Required, pattern, and constraint validation",
        ],
        "Create an accessible registration form with native validation states.",
      ),
      chapter(
        "Accessibility & SEO Structure",
        [
          "Keyboard-friendly markup",
          "ARIA only where needed",
          "Metadata, structured headings, and crawlable content",
        ],
        "Audit and improve a multi-page site for accessibility and basic SEO.",
      ),
    ],
    "Build a complete accessible multi-page academy or business website structure.",
  ),

  css3: roadmap(
    "45 days",
    [
      chapter(
        "Cascade, Selectors & Box Model",
        [
          "Selectors and combinators",
          "Cascade, specificity, and inheritance",
          "Content, padding, border, and margin",
        ],
        "Recreate a supplied card design while explaining every box-model decision.",
      ),
      chapter(
        "Typography, Color & Visual Systems",
        [
          "Font stacks and readable type scales",
          "Color formats and contrast",
          "Custom properties and design tokens",
        ],
        "Create a reusable visual theme with typography and color tokens.",
      ),
      chapter(
        "Flexbox Layouts",
        [
          "Main and cross axes",
          "Alignment, wrapping, and gaps",
          "Common navigation and card patterns",
        ],
        "Build a responsive header and equal-height card section using Flexbox.",
      ),
      chapter(
        "CSS Grid Layouts",
        ["Grid tracks and placement", "Template areas", "repeat(), minmax(), and auto-fit"],
        "Build a dashboard layout that adapts without duplicated markup.",
      ),
      chapter(
        "Responsive Design",
        [
          "Mobile-first breakpoints",
          "Fluid units and clamp()",
          "Responsive images and overflow control",
        ],
        "Convert a desktop page into a clean mobile, tablet, and desktop layout.",
      ),
      chapter(
        "Motion & UI Polish",
        [
          "Transitions and transforms",
          "Keyframe animation",
          "Reduced-motion and performance considerations",
        ],
        "Add purposeful micro-interactions with a reduced-motion fallback.",
      ),
    ],
    "Design and build a polished responsive brand landing page from a visual reference.",
  ),

  "bootstrap-5": roadmap(
    "30 days",
    [
      chapter(
        "Bootstrap Setup & Utilities",
        [
          "CDN and package setup",
          "Spacing, color, display, and typography utilities",
          "Responsive utility prefixes",
        ],
        "Rebuild a static content block using Bootstrap utilities only.",
      ),
      chapter(
        "Responsive Grid System",
        ["Containers, rows, and columns", "Breakpoints and gutters", "Ordering and alignment"],
        "Create a responsive product grid for mobile through desktop.",
      ),
      chapter(
        "Content & Navigation Components",
        [
          "Navbar and offcanvas",
          "Cards, badges, alerts, and tables",
          "Component accessibility basics",
        ],
        "Assemble an accessible business homepage from Bootstrap components.",
      ),
      chapter(
        "Interactive Components",
        [
          "Collapse and accordion",
          "Modal, dropdown, tabs, and carousel",
          "JavaScript initialization and events",
        ],
        "Build a compact FAQ and enquiry flow using interactive components.",
      ),
      chapter(
        "Forms & Customization",
        [
          "Form layouts and validation styles",
          "CSS variables and theme overrides",
          "Combining Bootstrap with custom CSS",
        ],
        "Create a branded multi-section form with clear validation feedback.",
      ),
    ],
    "Build a responsive business website plus a compact admin-dashboard interface.",
  ),

  javascript: roadmap(
    "60 days",
    [
      chapter(
        "JavaScript Language Foundations",
        [
          "Variables, data types, and operators",
          "Conditionals and loops",
          "Input, output, and debugging",
        ],
        "Build a menu-driven calculator with validation and repeatable actions.",
      ),
      chapter(
        "Functions, Scope & Reusable Logic",
        [
          "Function declarations and expressions",
          "Parameters, return values, and scope",
          "Arrow functions and callbacks",
        ],
        "Refactor a long script into small testable functions.",
      ),
      chapter(
        "Arrays, Objects & Modern Syntax",
        ["Array methods", "Object modeling", "Destructuring, spread, and modules"],
        "Transform and summarize a collection of student or sales records.",
      ),
      chapter(
        "DOM & Browser Events",
        [
          "Selecting and updating elements",
          "Event handling and delegation",
          "Forms and browser storage",
        ],
        "Create an interactive task list with filtering and local persistence.",
      ),
      chapter(
        "Asynchronous JavaScript & APIs",
        [
          "Event loop mental model",
          "Promises and async/await",
          "Fetch, JSON, loading, and error states",
        ],
        "Consume a public API and render resilient loading, success, and error views.",
      ),
      chapter(
        "Application Structure & Reliability",
        [
          "Classes and object-oriented patterns",
          "ES modules",
          "Exceptions, validation, and clean-code practices",
        ],
        "Organize a browser application into reusable modules with defensive error handling.",
      ),
    ],
    "Build a complete task, weather, or expense-management web application using an external API and local storage.",
  ),

  typescript: roadmap(
    "45 days",
    [
      chapter(
        "Compiler & Type Foundations",
        [
          "TypeScript setup and tsconfig",
          "Primitive, array, tuple, and object types",
          "Inference and strict mode",
        ],
        "Convert a JavaScript utility into strict TypeScript without any types.",
      ),
      chapter(
        "Functions & Domain Models",
        [
          "Typed parameters and returns",
          "Interfaces and type aliases",
          "Optional and readonly properties",
        ],
        "Model and validate a typed student, product, or order workflow.",
      ),
      chapter(
        "Unions & Type Narrowing",
        [
          "Union and intersection types",
          "Literal types and discriminated unions",
          "Guards and exhaustive checks",
        ],
        "Implement a safe state machine for loading, success, and error states.",
      ),
      chapter(
        "Classes & Reusable Contracts",
        [
          "Access modifiers",
          "Abstract classes and interfaces",
          "Composition and dependency contracts",
        ],
        "Create a typed service layer with interchangeable implementations.",
      ),
      chapter(
        "Generics & Utility Types",
        [
          "Generic functions and constraints",
          "Generic interfaces and classes",
          "Partial, Pick, Omit, Record, and Readonly",
        ],
        "Build a reusable typed repository or API-response helper.",
      ),
      chapter(
        "Typed API Integration",
        [
          "Module organization",
          "Parsing unknown data safely",
          "Build tooling and declaration awareness",
        ],
        "Consume an API while keeping transport, validation, and UI types separate.",
      ),
    ],
    "Build a strict, type-safe CRUD application module with reusable models and API services.",
  ),

  jquery: roadmap(
    "30 days",
    [
      chapter(
        "jQuery Foundations",
        [
          "Library setup and document ready",
          "Selectors and chained methods",
          "Reading and updating content",
        ],
        "Enhance an existing static page without changing its HTML structure.",
      ),
      chapter(
        "DOM Traversal & Manipulation",
        [
          "Parent, child, and sibling traversal",
          "Creating and removing elements",
          "Classes, attributes, and styles",
        ],
        "Build a dynamic product or FAQ list from JavaScript data.",
      ),
      chapter(
        "Events & Forms",
        [
          "Event binding and delegation",
          "Form values and validation",
          "Preventing default behavior",
        ],
        "Create a validated enquiry form with inline feedback.",
      ),
      chapter(
        "Effects & UI Behavior",
        ["Show, hide, fade, and slide", "Custom animations", "Accessible interaction states"],
        "Add a compact navigation, accordion, and modal interaction set.",
      ),
      chapter(
        "AJAX & Legacy Maintenance",
        [
          "GET and POST requests",
          "JSON responses and errors",
          "Refactoring jQuery toward modern JavaScript",
        ],
        "Load remote records and document a safe modernization plan.",
      ),
    ],
    "Build and progressively modernize a jQuery-powered catalogue or admin interface.",
  ),

  react: roadmap(
    "60 days",
    [
      chapter(
        "Components, JSX & Props",
        ["React project setup", "JSX rules", "Reusable components and composition"],
        "Break a supplied page into reusable components with clear prop contracts.",
      ),
      chapter(
        "State, Events & Conditional UI",
        ["useState", "Event handling", "Conditional rendering and lists"],
        "Build an interactive catalogue with filters and selected-item state.",
      ),
      chapter(
        "Effects & Data Fetching",
        ["useEffect lifecycle", "API requests", "Loading, empty, and error states"],
        "Create a resilient data-driven page backed by a REST endpoint.",
      ),
      chapter(
        "Forms & Validation",
        ["Controlled inputs", "Reusable form state", "Validation and submission feedback"],
        "Build a multi-field application form with accessible validation.",
      ),
      chapter(
        "Routing & Shared State",
        ["Client-side routes", "Nested layouts and parameters", "Context and reducer patterns"],
        "Create a multi-page dashboard with protected-layout awareness.",
      ),
      chapter(
        "Performance, Testing & Delivery",
        [
          "Memoization and rendering behavior",
          "Component testing fundamentals",
          "Production build and deployment",
        ],
        "Profile and test a feature before preparing a production build.",
      ),
    ],
    "Build and deploy a responsive React dashboard or learning portal with routing, forms, and live API data.",
  ),

  nextjs: roadmap(
    "60 days",
    [
      chapter(
        "App Router Foundations",
        ["Project structure", "Layouts, pages, and route groups", "Dynamic and nested routes"],
        "Build a multi-section application shell with dynamic detail routes.",
      ),
      chapter(
        "Server & Client Components",
        ["Rendering boundaries", "Props and serialization", "Choosing the correct component type"],
        "Refactor a page to minimize client JavaScript while retaining interactivity.",
      ),
      chapter(
        "Data Fetching, Caching & Revalidation",
        ["Server-side data access", "Caching strategies", "Loading, error, and not-found states"],
        "Build a cached catalogue that supports controlled revalidation.",
      ),
      chapter(
        "Forms, Actions & Route Handlers",
        ["Server actions", "Validation", "Route handlers and API responses"],
        "Implement a validated enquiry or content-management workflow.",
      ),
      chapter(
        "SEO, Media & Performance",
        ["Metadata and canonical URLs", "Images and fonts", "Performance measurement"],
        "Audit and improve metadata, images, and loading behavior for a public page.",
      ),
      chapter(
        "Authentication & Deployment",
        [
          "Session and authorization concepts",
          "Environment variables",
          "Production deployment and observability",
        ],
        "Protect a dashboard route and prepare an environment-safe deployment.",
      ),
    ],
    "Build and deploy an SEO-ready content, admissions, or client portal using the Next.js App Router.",
  ),

  nodejs: roadmap(
    "60 days",
    [
      chapter(
        "Node Runtime & Modules",
        ["Runtime architecture", "CommonJS and ES modules", "npm and package scripts"],
        "Create a reusable command-line utility organized into modules.",
      ),
      chapter(
        "Asynchronous Programming",
        ["Callbacks, promises, and async/await", "Event loop", "Error propagation"],
        "Coordinate multiple asynchronous tasks with reliable failure handling.",
      ),
      chapter(
        "Files, Streams & Events",
        ["File-system APIs", "Buffers and streams", "EventEmitter"],
        "Process a large text or CSV file without loading it fully into memory.",
      ),
      chapter(
        "HTTP & Express Services",
        ["HTTP fundamentals", "Routing and middleware", "Validation and centralized errors"],
        "Build a layered CRUD API with consistent response and error formats.",
      ),
      chapter(
        "Data, Auth & Security",
        [
          "Database access patterns",
          "Password and token concepts",
          "CORS, rate limits, and secure configuration",
        ],
        "Add protected endpoints and environment-based configuration.",
      ),
      chapter(
        "Testing & Production Delivery",
        ["Unit and API tests", "Logging and health checks", "Deployment fundamentals"],
        "Create a tested health endpoint and production-readiness checklist.",
      ),
    ],
    "Build and deploy a tested REST service with authentication, persistence, logging, and health checks.",
  ),

  php: roadmap(
    "60 days",
    [
      chapter(
        "PHP Language Foundations",
        [
          "Environment and request lifecycle",
          "Variables, types, and operators",
          "Conditions and loops",
        ],
        "Build a server-rendered calculator with validated input.",
      ),
      chapter(
        "Functions, Arrays & Reusable Code",
        [
          "Functions and scope",
          "Indexed and associative arrays",
          "Includes, namespaces, and organization",
        ],
        "Create reusable helpers for filtering and summarizing records.",
      ),
      chapter(
        "Forms, Sessions & Validation",
        ["GET and POST", "Validation and escaping", "Sessions and cookies"],
        "Build a multi-step form with session-based progress.",
      ),
      chapter(
        "Object-Oriented PHP",
        ["Classes and objects", "Inheritance and interfaces", "Composer and autoloading"],
        "Refactor procedural features into service and model classes.",
      ),
      chapter(
        "Database Development with PDO",
        ["SQL integration", "Prepared statements", "CRUD and transactions"],
        "Implement a secure database-backed records module.",
      ),
      chapter(
        "Security & Deployment",
        ["Authentication concepts", "CSRF, XSS, and secure passwords", "Configuration and hosting"],
        "Complete a security checklist and production configuration.",
      ),
    ],
    "Build a secure database-backed management portal with authentication and CRUD workflows.",
  ),

  laravel: roadmap(
    "60 days",
    [
      chapter(
        "Laravel & MVC Foundations",
        ["Project setup", "Routing and controllers", "MVC request lifecycle"],
        "Build a routed feature using controllers and clear response types.",
      ),
      chapter(
        "Blade, Forms & Validation",
        ["Blade layouts and components", "Forms and CSRF", "Validation and errors"],
        "Create a reusable form flow with server-side validation.",
      ),
      chapter(
        "Eloquent & Database Design",
        ["Migrations and seeders", "Models and relationships", "Query scopes and pagination"],
        "Model and query a related two-entity business workflow.",
      ),
      chapter(
        "Authentication & Authorization",
        ["Authentication scaffolding concepts", "Policies and gates", "Role-aware access"],
        "Protect management actions using ownership and role rules.",
      ),
      chapter(
        "REST APIs & Services",
        ["API resources", "Service-layer organization", "Tokens, errors, and versioning"],
        "Expose a documented JSON API for an existing feature.",
      ),
      chapter(
        "Testing & Deployment",
        [
          "Feature and unit tests",
          "Queues and mail overview",
          "Environment, cache, and deployment",
        ],
        "Test a critical user flow and prepare a deployment checklist.",
      ),
    ],
    "Build and deploy a Laravel admissions, inventory, or service-management system.",
  ),

  "rest-apis": roadmap(
    "45 days",
    [
      chapter(
        "HTTP & Resource Design",
        ["Methods, status codes, and headers", "Resources and URLs", "JSON representations"],
        "Design the resource model and endpoint table for a business use case.",
      ),
      chapter(
        "CRUD Endpoints & Validation",
        ["Create, read, update, and delete", "Input schemas", "Consistent validation errors"],
        "Implement a complete CRUD resource with invalid-input tests.",
      ),
      chapter(
        "Querying, Pagination & Relationships",
        ["Filtering and sorting", "Pagination", "Nested and related resources"],
        "Add stable filters and pagination to a collection endpoint.",
      ),
      chapter(
        "Authentication & Authorization",
        ["Sessions, tokens, and JWT concepts", "Role and ownership checks", "CORS and rate limits"],
        "Protect endpoints using a documented authorization matrix.",
      ),
      chapter(
        "Documentation & Testing",
        ["OpenAPI concepts", "Postman collections", "Unit, integration, and contract tests"],
        "Publish an executable API collection with happy-path and error cases.",
      ),
      chapter(
        "Production API Practices",
        ["Versioning", "Idempotency and retries", "Logging, health checks, and deployment"],
        "Add operational endpoints and trace a request through structured logs.",
      ),
    ],
    "Design, document, test, and deploy a secure production-style REST API service.",
  ),

  python: roadmap(
    "60 days",
    [
      chapter(
        "Python Foundations",
        [
          "Environment, syntax, and code structure",
          "Variables and core data types",
          "Input, output, operators, and strings",
        ],
        "Build a validated command-line student result calculator.",
      ),
      chapter(
        "Control Flow & Functions",
        ["Conditions and pattern matching", "Loops", "Functions, arguments, scope, and recursion"],
        "Create a menu-driven utility suite made from reusable functions.",
      ),
      chapter(
        "Core Data Structures",
        ["Lists and tuples", "Sets and dictionaries", "Comprehensions, unpacking, and copying"],
        "Build an in-memory student or inventory data manager.",
      ),
      chapter(
        "Modules, Files & Reliability",
        [
          "Modules and packages",
          "Files, pathlib, JSON, and CSV",
          "Exceptions and virtual environments",
        ],
        "Create a multi-file expense tracker with persistent structured data.",
      ),
      chapter(
        "Object-Oriented Python",
        [
          "Classes and object state",
          "Inheritance, composition, and polymorphism",
          "Properties, class tools, and dunder methods",
        ],
        "Model a library, school, or banking workflow with collaborating classes.",
      ),
      chapter(
        "Advanced Python Language",
        [
          "Iterators and generators",
          "Decorators and functools",
          "Context managers and object-model awareness",
        ],
        "Build a lazy processing pipeline with reusable decorators and safe resources.",
      ),
    ],
    "Build a complete multi-module Python application with files, validation, OOP, tests, and documentation.",
  ),

  "c-programming": roadmap(
    "60 days",
    [
      chapter(
        "C Toolchain & Syntax",
        ["Compiler workflow", "Program structure", "Variables, types, and formatted I/O"],
        "Compile and debug a typed console calculator.",
      ),
      chapter(
        "Control Flow & Functions",
        ["Conditions and loops", "Functions and headers", "Scope and storage basics"],
        "Create a modular menu-driven utility with separate header and source files.",
      ),
      chapter(
        "Arrays, Strings & Algorithms",
        ["One- and two-dimensional arrays", "C strings", "Searching and sorting basics"],
        "Analyze and sort a collection of numeric or text records.",
      ),
      chapter(
        "Pointers & Memory",
        ["Addresses and pointers", "Pointer arithmetic", "Dynamic allocation and safe cleanup"],
        "Build a dynamically sized record collection without memory leaks.",
      ),
      chapter(
        "Structures & Data Organization",
        ["struct, enum, and typedef", "Arrays of structures", "Passing structures to functions"],
        "Model student, product, or employee records with structured data.",
      ),
      chapter(
        "Files & Defensive Programming",
        [
          "Text and binary files",
          "Error codes and validation",
          "Debugging and modular project layout",
        ],
        "Persist, reload, and validate a set of structured records.",
      ),
    ],
    "Build a file-based student, inventory, or library management system in C.",
  ),

  cpp: roadmap(
    "60 days",
    [
      chapter(
        "C++ Foundations",
        [
          "Compiler and program structure",
          "Types, references, and namespaces",
          "Control flow and functions",
        ],
        "Build a modular console utility using references and clear namespaces.",
      ),
      chapter(
        "Classes & Encapsulation",
        [
          "Classes and objects",
          "Constructors and destructors",
          "Access control and const correctness",
        ],
        "Model a small account or product domain with validated state.",
      ),
      chapter(
        "Inheritance & Polymorphism",
        ["Inheritance", "Virtual methods", "Abstract interfaces and composition"],
        "Implement interchangeable domain behaviors through an abstract interface.",
      ),
      chapter(
        "STL Containers & Algorithms",
        ["vector, map, and set", "Iterators", "Standard algorithms and lambdas"],
        "Process and rank a realistic record collection using STL algorithms.",
      ),
      chapter(
        "Templates, Exceptions & Smart Pointers",
        ["Function and class templates", "Exception safety", "RAII and smart pointers"],
        "Create a reusable generic component with safe ownership.",
      ),
      chapter(
        "Files, Build & Testing",
        ["File streams", "Multi-file projects", "Unit-testing and build-tool awareness"],
        "Separate, test, and persist a complete feature across multiple files.",
      ),
    ],
    "Build a modern C++ inventory or library application using OOP, STL, RAII, and file persistence.",
  ),

  java: roadmap(
    "60 days",
    [
      chapter(
        "Java & JVM Foundations",
        ["JDK, JVM, and compilation", "Types and operators", "Control flow and methods"],
        "Build and package a validated console utility.",
      ),
      chapter(
        "Object-Oriented Java",
        [
          "Classes and constructors",
          "Encapsulation and inheritance",
          "Interfaces and polymorphism",
        ],
        "Model a service domain with interfaces and multiple implementations.",
      ),
      chapter(
        "Collections & Generics",
        ["List, Set, and Map", "Generics", "Comparators and iteration"],
        "Store, filter, and rank a collection of domain objects.",
      ),
      chapter(
        "Exceptions & File I/O",
        [
          "Checked and unchecked exceptions",
          "Files and streams",
          "Serialization formats awareness",
        ],
        "Create a reliable import/export workflow with meaningful errors.",
      ),
      chapter(
        "Functional Java",
        ["Lambdas", "Streams", "Optional and method references"],
        "Produce a reporting pipeline with filters, grouping, and summaries.",
      ),
      chapter(
        "Testing & Project Structure",
        ["Packages and build tools", "Unit-testing fundamentals", "Logging and configuration"],
        "Test a service layer and prepare a reproducible project build.",
      ),
    ],
    "Build a tested Java management application using OOP, collections, streams, files, and clean packages.",
  ),

  oop: roadmap(
    "45 days",
    [
      chapter(
        "Objects, Classes & State",
        ["Object modeling", "Constructors", "Instance and class state"],
        "Translate a real-world workflow into classes with clear responsibilities.",
      ),
      chapter(
        "Encapsulation & Interfaces",
        ["Public and non-public state", "Properties and validation", "Interfaces and contracts"],
        "Protect invariants and expose a safe public API for a domain object.",
      ),
      chapter(
        "Inheritance & Polymorphism",
        [
          "Inheritance hierarchy",
          "Method overriding",
          "Duck typing or interface-based substitution",
        ],
        "Implement interchangeable behaviors and compare inheritance with composition.",
      ),
      chapter(
        "Composition & SOLID Thinking",
        ["Has-a relationships", "Dependency inversion", "Single responsibility and extensibility"],
        "Refactor a tightly coupled design into collaborating components.",
      ),
      chapter(
        "Object Protocols & Design Quality",
        ["String representation and equality", "Collections of objects", "Testing object behavior"],
        "Add value semantics, readable output, and behavior-focused tests.",
      ),
    ],
    "Build a complete library, banking, or school-management domain model with tested object collaboration.",
  ),

  dsa: roadmap(
    "60 days",
    [
      chapter(
        "Complexity & Problem-Solving Method",
        ["Big-O time and space", "Tracing and invariants", "Choosing a data structure"],
        "Analyze and compare two solutions to the same problem.",
      ),
      chapter(
        "Arrays, Strings & Hashing",
        ["Two-pointer and sliding-window patterns", "Prefix calculations", "Hash maps and sets"],
        "Solve a small set of lookup, frequency, and window problems.",
      ),
      chapter(
        "Linked Structures, Stacks & Queues",
        ["Linked lists", "Stack applications", "Queues and deques"],
        "Implement the structures and apply them to parsing or scheduling.",
      ),
      chapter(
        "Trees, Heaps & Priority",
        ["Binary trees and traversal", "Binary search trees", "Heaps and priority queues"],
        "Build traversal utilities and a priority-based scheduler.",
      ),
      chapter(
        "Sorting, Searching & Recursion",
        ["Binary search", "Comparison sorting", "Recursion and divide-and-conquer"],
        "Implement, test, and benchmark core search and sort algorithms.",
      ),
      chapter(
        "Graphs & Applied Algorithms",
        ["Graph representations", "BFS and DFS", "Shortest-path and dynamic-programming awareness"],
        "Model and traverse a route, dependency, or social network graph.",
      ),
    ],
    "Create a documented algorithm toolkit and solve a multi-stage route or scheduling problem.",
  ),

  "git-github": roadmap(
    "30 days",
    [
      chapter(
        "Git Foundations",
        [
          "Repository, working tree, and staging",
          "Commits and history",
          "Undoing safe local changes",
        ],
        "Create a clean repository with meaningful atomic commits.",
      ),
      chapter(
        "Branches & Merging",
        ["Branch workflows", "Merge and rebase concepts", "Conflict resolution"],
        "Develop a feature branch and resolve a controlled conflict.",
      ),
      chapter(
        "GitHub Collaboration",
        ["Remotes", "Pull requests and reviews", "Issues and project tracking"],
        "Open, review, revise, and merge a pull request.",
      ),
      chapter(
        "Release & Repository Quality",
        ["README and contribution docs", "Tags and releases", "Licensing and repository hygiene"],
        "Prepare a portfolio-ready repository release.",
      ),
      chapter(
        "Automation Foundations",
        ["GitHub Actions concepts", "Lint/test workflow", "Branch protection awareness"],
        "Add a CI workflow that checks every pull request.",
      ),
    ],
    "Run a complete team-style repository workflow from issue to protected pull request and tagged release.",
  ),

  "database-fundamentals": roadmap(
    "30 days",
    [
      chapter(
        "DBMS & Data Models",
        [
          "Why databases",
          "Relational and document models",
          "Tables, documents, keys, and constraints",
        ],
        "Compare storage models for a real business scenario.",
      ),
      chapter(
        "Requirements & ER Modeling",
        ["Entities and attributes", "Relationships and cardinality", "Business rules"],
        "Draw an ER diagram from a written case study.",
      ),
      chapter(
        "Relational Schema Design",
        ["Primary and foreign keys", "Junction tables", "Integrity constraints"],
        "Convert an ER diagram into a complete relational schema.",
      ),
      chapter(
        "Normalization",
        ["Functional dependencies", "1NF, 2NF, and 3NF", "Update anomalies"],
        "Normalize a flawed spreadsheet-style design to 3NF.",
      ),
      chapter(
        "Transactions, Indexes & Security",
        [
          "ACID and transactions",
          "Index purpose and trade-offs",
          "Roles, backups, and privacy basics",
        ],
        "Document transaction boundaries, indexes, and access roles for the schema.",
      ),
    ],
    "Design and document a normalized database for an academy, clinic, store, or service platform.",
  ),

  sql: roadmap(
    "45 days",
    [
      chapter(
        "Relational Query Foundations",
        ["SELECT and aliases", "WHERE and operators", "ORDER BY and LIMIT"],
        "Answer a set of filtered business questions from one table.",
      ),
      chapter(
        "Aggregation & Grouping",
        ["Aggregate functions", "GROUP BY", "HAVING and conditional aggregation"],
        "Produce a KPI summary by category, month, or customer segment.",
      ),
      chapter(
        "Multi-Table Queries",
        ["INNER and OUTER JOINs", "Self and many-to-many joins", "NULL-safe reasoning"],
        "Combine a normalized sales or admissions dataset into one report.",
      ),
      chapter(
        "Subqueries, CTEs & Set Operations",
        [
          "Scalar and correlated subqueries",
          "Common table expressions",
          "UNION, INTERSECT, and EXCEPT",
        ],
        "Refactor a complex report into readable CTE steps.",
      ),
      chapter(
        "Window Functions",
        ["ROW_NUMBER and RANK", "Running totals", "Partitioned comparisons"],
        "Build customer ranking and period-over-period analysis queries.",
      ),
      chapter(
        "Data Definition & Transactions",
        ["CREATE and ALTER", "INSERT, UPDATE, and DELETE", "Constraints and transaction control"],
        "Create a small schema and execute a safe multi-step update transaction.",
      ),
    ],
    "Complete an e-commerce or academy SQL case study with schema, analytical queries, and a business findings report.",
  ),

  postgresql: roadmap(
    "45 days",
    [
      chapter(
        "PostgreSQL Setup & Schema Design",
        ["Server and client tools", "Schemas and data types", "Keys and constraints"],
        "Create a typed, constrained schema from an ER model.",
      ),
      chapter(
        "Querying & Relationships",
        ["Joins and aggregations", "CTEs and windows", "Views"],
        "Build reusable reporting views across related tables.",
      ),
      chapter(
        "Indexes & Query Plans",
        ["B-tree and composite indexes", "EXPLAIN and EXPLAIN ANALYZE", "Query tuning basics"],
        "Diagnose and improve a deliberately slow query.",
      ),
      chapter(
        "PostgreSQL Data Features",
        ["JSONB", "Arrays and useful extensions", "Full-text search awareness"],
        "Model and query a feature that combines relational and JSONB data.",
      ),
      chapter(
        "Transactions & Server Logic",
        ["Isolation and locking", "Functions and triggers", "Integrity under concurrent changes"],
        "Protect a multi-step business operation with a transaction and constraint.",
      ),
      chapter(
        "Roles, Backup & Operations",
        ["Users and privileges", "Backup and restore", "Monitoring and maintenance awareness"],
        "Create least-privilege roles and verify a backup/restore workflow.",
      ),
    ],
    "Build and tune a production-style PostgreSQL database with roles, JSONB, reports, and recovery documentation.",
  ),

  mysql: roadmap(
    "45 days",
    [
      chapter(
        "MySQL Setup & Relational Schema",
        ["Server and Workbench", "Data types and tables", "Keys, constraints, and InnoDB"],
        "Create a constrained business schema in MySQL.",
      ),
      chapter(
        "Queries, Joins & Aggregation",
        ["Filtering and sorting", "Multi-table joins", "Grouped business metrics"],
        "Produce a multi-table sales or admissions report.",
      ),
      chapter(
        "Subqueries, CTEs & Windows",
        ["Nested queries", "Common table expressions", "Ranking and running totals"],
        "Build an analytical report with readable staged SQL.",
      ),
      chapter(
        "Indexes & Performance",
        ["Index design", "EXPLAIN", "Avoiding common query anti-patterns"],
        "Compare query plans before and after adding an appropriate index.",
      ),
      chapter(
        "Transactions & Database Objects",
        ["Transactions and locks", "Views", "Stored procedures and triggers awareness"],
        "Implement a safe stock or payment update workflow.",
      ),
      chapter(
        "Security & Recovery",
        ["Users and privileges", "Backup and restore", "Configuration and monitoring basics"],
        "Create a least-privilege application user and recovery checklist.",
      ),
    ],
    "Build an e-commerce MySQL database with analytical queries, indexes, roles, and backup evidence.",
  ),

  mongodb: roadmap(
    "45 days",
    [
      chapter(
        "Document Database Foundations",
        ["Documents and collections", "BSON data types", "Embedding vs referencing"],
        "Model a product, content, or student domain as documents.",
      ),
      chapter(
        "CRUD & Query Operators",
        [
          "Insert, find, update, and delete",
          "Projection and sorting",
          "Array and nested-field operators",
        ],
        "Build a complete CRUD query workbook for the domain.",
      ),
      chapter(
        "Schema Design & Validation",
        ["Access-pattern design", "Schema validation", "Handling one-to-many relationships"],
        "Compare embedded and referenced designs against real queries.",
      ),
      chapter(
        "Indexes & Performance",
        ["Single and compound indexes", "Unique and text indexes", "Explain plans"],
        "Diagnose and optimize a slow filtered query.",
      ),
      chapter(
        "Aggregation Framework",
        ["Match, project, and group", "Unwind and lookup", "Pipelines for reporting"],
        "Create a multi-stage analytics pipeline for business KPIs.",
      ),
      chapter(
        "Reliability & Application Use",
        [
          "Transactions awareness",
          "Drivers and connection patterns",
          "Backup, security, and deployment basics",
        ],
        "Connect an application script and document operational safeguards.",
      ),
    ],
    "Build a MongoDB-backed catalogue or content system with validated documents, indexes, and analytics pipelines.",
  ),

  numpy: roadmap(
    "30 days",
    [
      chapter(
        "Arrays, Shapes & Data Types",
        ["ndarray creation", "Dimensions, shapes, and axes", "Data types and memory basics"],
        "Convert raw numeric records into correctly typed arrays.",
      ),
      chapter(
        "Indexing, Slicing & Reshaping",
        ["Basic and boolean indexing", "Views vs copies", "reshape, transpose, and stacking"],
        "Extract and reorganize a multi-dimensional dataset without loops.",
      ),
      chapter(
        "Vectorization & Broadcasting",
        ["Element-wise operations", "Broadcasting rules", "Universal functions"],
        "Replace a loop-based calculation with a vectorized pipeline.",
      ),
      chapter(
        "Aggregation & Missing Data",
        ["Axis-based summaries", "Sorting and searching", "NaN-aware operations"],
        "Create a statistical summary across rows, columns, and groups.",
      ),
      chapter(
        "Random Data & Linear Algebra",
        ["Random generators", "Simulation", "Vectors, matrices, and linear algebra basics"],
        "Run a reproducible simulation and interpret its numerical results.",
      ),
    ],
    "Complete a numerical analysis or simulation project with a vectorized, reproducible NumPy notebook.",
  ),

  pandas: roadmap(
    "45 days",
    [
      chapter(
        "Series, DataFrames & Data Import",
        [
          "Core structures and indexes",
          "CSV, Excel, JSON, and SQL input",
          "Inspection and data types",
        ],
        "Load and profile a supplied multi-column dataset.",
      ),
      chapter(
        "Cleaning & Validation",
        ["Missing values", "Duplicates", "Type conversion, dates, and text cleanup"],
        "Create a repeatable cleaning checklist with before/after evidence.",
      ),
      chapter(
        "Selection, Transformation & Grouping",
        ["loc and iloc", "Vectorized transformations", "groupby and aggregation"],
        "Answer a set of business questions from clean tabular data.",
      ),
      chapter(
        "Merging & Reshaping",
        ["merge, join, and concat", "Pivot tables", "Melt and tidy-data patterns"],
        "Combine related tables into an analysis-ready dataset.",
      ),
      chapter(
        "Time Series & Exploratory Analysis",
        ["Datetime indexes", "Resampling and rolling summaries", "Outliers and descriptive EDA"],
        "Analyze trends and anomalies across a dated dataset.",
      ),
      chapter(
        "Reporting & Export",
        ["Charts and summaries", "Styled tables awareness", "Exporting clean data and findings"],
        "Deliver a clean dataset plus a concise reproducible analysis report.",
      ),
    ],
    "Complete a customer or sales EDA project from raw files to validated findings and exportable reports.",
  ),

  matplotlib: roadmap(
    "30 days",
    [
      chapter(
        "Figure & Axes Foundations",
        ["Figure, axes, and plot anatomy", "Line and marker control", "Labels, legends, and grids"],
        "Reproduce a correctly labeled trend chart from supplied data.",
      ),
      chapter(
        "Comparison & Relationship Charts",
        ["Bar charts", "Scatter plots", "Choosing honest encodings"],
        "Select and build the right chart for three business questions.",
      ),
      chapter(
        "Distributions & Statistical Views",
        ["Histograms", "Box plots", "Error bars and uncertainty basics"],
        "Visualize and explain the distribution and outliers of a metric.",
      ),
      chapter(
        "Subplots & Layouts",
        ["Multiple axes", "Shared scales", "Annotations and reference lines"],
        "Create a compact multi-panel analytical figure.",
      ),
      chapter(
        "Styling, Export & Storytelling",
        [
          "Themes and reusable style settings",
          "Accessible color and typography",
          "High-resolution export",
        ],
        "Polish and export a publication-ready chart with a written takeaway.",
      ),
    ],
    "Create an executive or research chart pack that tells one coherent data story.",
  ),

  "statistics-for-data": roadmap(
    "45 days",
    [
      chapter(
        "Descriptive Statistics",
        ["Center and spread", "Percentiles and shape", "Robust summaries"],
        "Profile and compare two real groups using appropriate statistics.",
      ),
      chapter(
        "Probability & Distributions",
        [
          "Events and conditional probability",
          "Common discrete and continuous distributions",
          "Expected value",
        ],
        "Model and simulate a simple uncertain business process.",
      ),
      chapter(
        "Sampling & Estimation",
        ["Sampling bias", "Standard error", "Confidence intervals"],
        "Estimate a population measure and clearly state uncertainty.",
      ),
      chapter(
        "Hypothesis Testing",
        [
          "Null and alternative hypotheses",
          "p-values and effect size",
          "t-tests, chi-square, and ANOVA awareness",
        ],
        "Run and interpret a suitable test for a supplied question.",
      ),
      chapter(
        "Correlation & Regression Thinking",
        ["Association vs causation", "Correlation", "Simple regression interpretation"],
        "Analyze a relationship while documenting limitations and confounders.",
      ),
      chapter(
        "KPIs & Evidence Communication",
        ["Metric design", "Experiment interpretation", "Ethical and clear statistical reporting"],
        "Write a decision memo supported by transparent statistical evidence.",
      ),
    ],
    "Complete a KPI or experiment-analysis case with uncertainty, interpretation, and an executive recommendation.",
  ),

  "data-analysis-foundations": roadmap(
    "60 days",
    [
      chapter(
        "Business Questions & Analytical Plans",
        ["Problem framing", "KPIs and success criteria", "Data requirements and limitations"],
        "Turn a vague business request into a measurable analysis plan.",
      ),
      chapter(
        "Data Collection & Quality",
        [
          "CSV, Excel, SQL, and API sources",
          "Data dictionaries",
          "Validation and privacy awareness",
        ],
        "Create a data-quality report for a raw dataset.",
      ),
      chapter(
        "Cleaning & Transformation",
        ["Missing values and duplicates", "Dates and categories", "Merging and reshaping"],
        "Produce an analysis-ready dataset through a repeatable workflow.",
      ),
      chapter(
        "SQL & Tabular Analysis",
        ["Filtering and aggregation", "Joins", "CTEs and window functions"],
        "Answer operational questions from multiple related tables.",
      ),
      chapter(
        "EDA, Statistics & Visualization",
        [
          "Descriptive analysis",
          "Relationships and uncertainty",
          "Chart selection and anomaly review",
        ],
        "Build an exploratory notebook with validated charts and findings.",
      ),
      chapter(
        "Reporting & Recommendations",
        ["Dashboard structure", "Narrative and limitations", "Reproducible delivery with GitHub"],
        "Present a concise recommendation backed by a documented analysis trail.",
      ),
    ],
    "Deliver an end-to-end business analysis with clean data, SQL evidence, a dashboard, and actionable recommendations.",
  ),

  "data-science-foundations": roadmap(
    "60 days",
    [
      chapter(
        "Data Science Lifecycle",
        ["Problem framing", "Target and feature definition", "Experiment boundaries and ethics"],
        "Write a reproducible project brief with success metrics.",
      ),
      chapter(
        "Python Data Stack",
        ["NumPy and Pandas workflow", "Data cleaning", "SQL extraction"],
        "Build an analysis-ready feature table from multiple sources.",
      ),
      chapter(
        "Statistics & Exploratory Analysis",
        ["Distributions and sampling", "Hypothesis testing", "Visualization and leakage checks"],
        "Complete EDA with documented assumptions and risks.",
      ),
      chapter(
        "Feature Engineering",
        ["Encoding and scaling", "Missing values and outliers", "Train/validation/test separation"],
        "Create a reusable preprocessing pipeline without leakage.",
      ),
      chapter(
        "Supervised Learning",
        ["Regression", "Classification", "Metrics and cross-validation"],
        "Compare baseline supervised models using suitable metrics.",
      ),
      chapter(
        "Unsupervised Learning & Communication",
        ["Clustering", "Dimensionality reduction awareness", "Model limitations and reporting"],
        "Segment a dataset and present defensible insights.",
      ),
    ],
    "Complete a reproducible data-science project from raw data to evaluated model and stakeholder report.",
  ),

  "ai-ml-foundations": roadmap(
    "60 days",
    [
      chapter(
        "AI/ML Problem Framing",
        [
          "AI, ML, and rule-based systems",
          "Supervised vs unsupervised learning",
          "Targets, features, and baselines",
        ],
        "Classify realistic problems and define an honest ML objective.",
      ),
      chapter(
        "Data Preparation",
        ["Cleaning and validation", "Encoding and scaling", "Splits and leakage prevention"],
        "Build a safe preprocessing pipeline for mixed data.",
      ),
      chapter(
        "Regression Models",
        ["Linear regression", "Regularization awareness", "MAE, RMSE, and R²"],
        "Train and compare regression baselines with residual review.",
      ),
      chapter(
        "Classification Models",
        [
          "Logistic regression",
          "Decision trees and ensemble intuition",
          "Precision, recall, F1, and ROC-AUC",
        ],
        "Build a classifier and justify the selected decision threshold.",
      ),
      chapter(
        "Clustering & Model Selection",
        ["K-Means", "Cross-validation", "Hyperparameter search"],
        "Tune a model or create defensible customer segments.",
      ),
      chapter(
        "Responsible Delivery",
        ["Bias and limitations", "Model persistence", "Inference API and monitoring concepts"],
        "Write a model card and expose a local prediction endpoint.",
      ),
    ],
    "Build an evaluated machine-learning pipeline with a reproducible notebook, model card, and inference demonstration.",
  ),

  "scikit-learn": roadmap(
    "45 days",
    [
      chapter(
        "Estimator API & Preprocessing",
        ["fit, transform, and predict", "Imputation, encoding, and scaling", "ColumnTransformer"],
        "Create a reusable preprocessing transformer for mixed columns.",
      ),
      chapter(
        "Pipelines & Data Splits",
        ["Pipeline", "Train/test splits", "Leakage prevention and baselines"],
        "Combine preprocessing and a baseline estimator in one pipeline.",
      ),
      chapter(
        "Regression Workflows",
        ["Linear and tree-based regressors", "MAE, RMSE, and R²", "Residual analysis"],
        "Compare two regressors using cross-validated evidence.",
      ),
      chapter(
        "Classification Workflows",
        [
          "Logistic regression and trees",
          "Confusion matrix and classification metrics",
          "Threshold awareness",
        ],
        "Evaluate a classifier beyond accuracy and explain errors.",
      ),
      chapter(
        "Cross-Validation & Tuning",
        [
          "Cross-validation strategies",
          "GridSearchCV and RandomizedSearchCV",
          "Learning curves awareness",
        ],
        "Tune a pipeline without using the final test set.",
      ),
      chapter(
        "Persistence & Reproducibility",
        [
          "Model serialization",
          "Feature-name and version discipline",
          "Inference and monitoring awareness",
        ],
        "Save, reload, and validate predictions from a trained pipeline.",
      ),
    ],
    "Train, tune, persist, and demonstrate a complete scikit-learn prediction pipeline on a real dataset.",
  ),
};

export function getCourseRoadmap(slug: string): CourseRoadmap | undefined {
  return courseRoadmaps[slug];
}
