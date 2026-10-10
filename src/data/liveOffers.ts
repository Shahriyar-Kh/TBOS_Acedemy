export interface OfferRoadmapPhase {
  phase: string;
  title: string;
  topics: string[];
  outcome?: string;
}

export interface LiveOffer {
  slug: string;
  title: string;
  shortTitle: string;
  status: "active" | "upcoming" | "archived";
  audience: string;
  ageOrEducationLevel: string;
  duration: string;
  classesPerWeek?: string;
  sessionDuration?: string;
  format: string;
  regularFee: number;
  offerFee: number;
  currency: string;
  billingPeriod: string;
  freeDemo: boolean;
  freeDemoNote: string;
  paidNote: string;
  scheduleNote: string;
  tagline: string;
  summary: string;
  description: string;
  highlights: string[];
  roadmap: OfferRoadmapPhase[];
  prerequisites: string[];
  idealFor: string[];
  icon: string;
  featured?: boolean;
  keywords: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export const liveOffers: LiveOffer[] = [
  {
    slug: "python-young-developers",
    title: "Python Young Developers",
    shortTitle: "Young Developers",
    status: "active",
    audience: "Students in Grades 5–10",
    ageOrEducationLevel: "Approximate age 10–16 (Grades 5–10)",
    duration: "6 months",
    classesPerWeek: "2–3 classes/week",
    sessionDuration: "1 hour per session",
    format: "Live Online Interactive Cohort",
    regularFee: 10000,
    offerFee: 5000,
    currency: "PKR",
    billingPeriod: "month",
    freeDemo: true,
    freeDemoNote: "Free trial demo session available before enrollment",
    paidNote: "Full 6-month program is paid monthly at the group offer rate",
    scheduleNote: "Contact admissions for next confirmed batch schedule",
    tagline: "Real programming foundations for young learners before university",
    summary:
      "An engaging, parent-friendly 6-month live online Python course designed for students in Grades 5–10 to master computational thinking, problem solving, and genuine software projects.",
    description:
      "Python Young Developers is an instructor-led live group program created specifically for school students in Grades 5–10 (approximate age 10–16). Instead of superficial drag-and-drop toys, students learn genuine text-based Python programming with step-by-step guidance. The curriculum builds computational logic from variables and conditions to loops, functions, data collections, interactive mini-games, and desktop GUI applications — cultivating confident problem solvers with strong foundations for future STEM and computer science studies.",
    highlights: [
      "Designed specifically for young learners ages 10–16 (Grades 5–10)",
      "Live instructor-led online sessions with interactive screen sharing",
      "Step-by-step logic building & computational thinking exercises",
      "Interactive mini-games, algorithmic puzzles & GUI desktop mini-apps",
      "Safe, supervised online classroom with attentive, patient mentoring",
      "Free Demo trial session available before committing to enrollment",
    ],
    roadmap: [
      {
        phase: "Phase 1",
        title: "Programming & Python Foundations",
        topics: [
          "Python installation & IDE setup",
          "Printing output & receiving user input",
          "Variables, strings, and numeric data types",
          "Arithmetic operators & math expressions",
          "Building interactive command-line conversations",
        ],
        outcome: "Write and run independent Python programs with user input.",
      },
      {
        phase: "Phase 2",
        title: "Decisions & Branching Logic",
        topics: [
          "Boolean expressions & comparison operators",
          "If, elif, and else decision trees",
          "Logical operators (and, or, not)",
          "Handling invalid input gracefully",
          "Building a text-based adventure game",
        ],
        outcome: "Construct multi-path logic and interactive decision flows.",
      },
      {
        phase: "Phase 3",
        title: "Loops & Algorithmic Patterns",
        topics: [
          "While loops for repetitive conditions",
          "For loops with the range() function",
          "Loop control: break and continue",
          "Nested loops & pattern printing",
          "Guessing games & mathematical challenge programs",
        ],
        outcome: "Automate repetitive tasks and write algorithmic logic.",
      },
      {
        phase: "Phase 4",
        title: "Functions & Modular Code",
        topics: [
          "Defining custom functions with def",
          "Parameters, arguments & default values",
          "Return statements and variable scope",
          "Breaking large problems into smaller reusable parts",
          "Building a modular student grade calculator",
        ],
        outcome: "Organize clean, reusable code structures.",
      },
      {
        phase: "Phase 5",
        title: "Data Collections & Problem Solving",
        topics: [
          "Python lists: indexing, slicing, appending, and removing",
          "Iterating over collections with loops",
          "Tuples & basic immutable collections",
          "Dictionaries: key-value data models",
          "Building a student quiz system and digital inventory",
        ],
        outcome: "Store, query, and manipulate real multi-item data.",
      },
      {
        phase: "Phase 6",
        title: "Desktop Mini-Apps, Beginner OOP & Capstone",
        topics: [
          "Beginner object-oriented concepts (objects & methods)",
          "Introduction to Python GUI libraries (Tkinter basics)",
          "Buttons, labels, entry fields & event binding",
          "Debugging and error handling techniques",
          "Capstone project: Interactive Desktop Application",
        ],
        outcome: "Showcase a complete GUI project built entirely by the student.",
      },
    ],
    prerequisites: [
      "Basic computer literacy (typing, opening browser, managing files)",
      "Curiosity and excitement to learn coding",
      "No prior programming experience required — starts from scratch",
    ],
    idealFor: [
      "School students in Grades 5–10 seeking a head start in programming",
      "Parents looking for disciplined, productive STEM enrichment",
      "Young minds who want to build real software rather than just consume games",
    ],
    icon: "Terminal",
    featured: true,
    keywords: [
      "Python Young Developers",
      "Python classes for kids",
      "online coding for school students",
      "coding classes Grade 5 to 10",
      "live Python classes Pakistan",
    ],
  },
  {
    slug: "100-days-complete-python",
    title: "100 Days Complete Python",
    shortTitle: "100 Days Python",
    status: "active",
    audience: "Beginners, university students & career transitioners",
    ageOrEducationLevel: "Beginner to Advanced Core Python",
    duration: "100 days",
    classesPerWeek: "3–4 classes/week",
    sessionDuration: "1–1.5 hours per session",
    format: "Live Online Structured Series",
    regularFee: 8000,
    offerFee: 5000,
    currency: "PKR",
    billingPeriod: "month",
    freeDemo: true,
    freeDemoNote: "Free trial session available before enrollment",
    paidNote: "Structured 100-day series paid monthly (37 live lectures across 6 phases)",
    scheduleNote: "Contact admissions for next confirmed batch schedule",
    tagline: "3 Learning Levels • 1 Complete Python Series (37 Live Lectures)",
    summary:
      "A structured 100-day intensive program delivering 37 comprehensive live lectures across 6 progressive phases — taking you from absolute fundamentals to advanced Python engineering.",
    description:
      "100 Days Complete Python is a comprehensive, mentor-led live group series engineered to take learners from day-one fundamentals to fluent, professional-grade Core Python code. Positioned as '3 Learning Levels • 1 Complete Python Series' spanning 37 structured lectures, the curriculum guides students step-by-step through computational thinking, algorithmic problem solving, deep data structures, modular file systems, full object-oriented programming, and advanced language internals. Every lecture combines conceptual clarity with live coding, rigorous exercises, and structured milestone projects.",
    highlights: [
      "3 Learning Levels • 1 Complete Python Series (single unified program)",
      "37 structured live lectures with live instructor coding & screen sharing",
      "6 progressive phases covering syntax, OOP, files, and language internals",
      "Regular algorithmic challenges, homework reviews, and milestone projects",
      "Dedicated live Q&A in every class to resolve student doubts",
      "Free Demo trial session available before paid commitment",
    ],
    roadmap: [
      {
        phase: "Phase 1",
        title: "Programming & Python Foundations",
        topics: [
          "Python interpreter architecture & runtime execution model",
          "Variables, memory references, dynamic typing & standard types",
          "Expressions, operators & operator precedence",
          "Conditional branching & complex decision structures",
          "Iteration patterns: while and for loops with control statements",
        ],
        outcome: "Fluency in foundational syntax, control flow, and command-line scripts.",
      },
      {
        phase: "Phase 2",
        title: "Functions & Problem Solving",
        topics: [
          "Function signatures, positional vs keyword arguments, and defaults",
          "Arbitrary arguments (*args, **kwargs) and tuple unpacking",
          "Scope resolution: LEGB rule (Local, Enclosing, Global, Built-in)",
          "First-class functions, lambdas, and functional utilities (map, filter)",
          "Algorithmic problem-solving patterns & recursion fundamentals",
        ],
        outcome: "Write modular, decomposed, and reusable functional code.",
      },
      {
        phase: "Phase 3",
        title: "Complete Python Data Structures",
        topics: [
          "Lists: internal arrays, time complexity, slicing & sorting algorithms",
          "Tuples: immutability, hashing & tuple packing/unpacking",
          "Sets: hashing, uniqueness & mathematical set operations",
          "Dictionaries: hash tables, lookup efficiency, nested data & merging",
          "List, set, and dictionary comprehensions with conditional filtering",
        ],
        outcome: "Select, manipulate, and optimize complex data structures correctly.",
      },
      {
        phase: "Phase 4",
        title: "Modules, Files & Reliable Programs",
        topics: [
          "File system operations: reading, writing, seeking & buffering",
          "Structured data persistence: JSON, CSV, and text streams",
          "Context managers & the with statement pattern",
          "Exception handling hierarchy: try, except, else, finally, custom errors",
          "Modular architecture: creating packages, namespaces & __init__.py",
        ],
        outcome: "Build robust, fault-tolerant Python applications with file I/O.",
      },
      {
        phase: "Phase 5",
        title: "Complete Object-Oriented Python",
        topics: [
          "Classes, instances, self reference & constructor initialization",
          "Encapsulation: public, protected, and private attribute conventions",
          "Inheritance models: single, multilevel, and multiple inheritance (MRO)",
          "Polymorphism, method overriding & duck typing principles",
          "Class methods (@classmethod), static methods (@staticmethod) & properties",
          "Dunder (magic) methods: __str__, __repr__, __len__, __eq__, operator overloading",
        ],
        outcome: "Design production-quality object-oriented software architectures.",
      },
      {
        phase: "Phase 6",
        title: "Advanced Python Language",
        topics: [
          "Iterators protocol (__iter__, __next__) & custom iterables",
          "Generators, yield expressions & memory-efficient stream processing",
          "Function & method decorators with parameter wrapping",
          "Regular expressions (re module) for pattern validation",
          "Type annotations, type hinting (mypy fundamentals) & documentation",
          "Capstone Project: Multi-module Object-Oriented Python System",
        ],
        outcome: "Master idiomatic advanced Python idioms and deliver a complete capstone.",
      },
    ],
    prerequisites: [
      "Basic computer literacy (navigating files, installing software)",
      "Commitment to write code and complete assignments consistently",
      "No prior programming background required — taught from fundamental principles",
    ],
    idealFor: [
      "Beginners wanting a structured, disciplined pathway to master Core Python",
      "University students preparing for data structures, algorithms, or lab projects",
      "Professionals and hobbyists seeking deep language comprehension without gaps",
    ],
    icon: "Code2",
    featured: true,
    keywords: [
      "100 Days Complete Python",
      "Python 37 lectures live",
      "core Python live batch",
      "Python OOP online course",
      "learn Python Pakistan",
    ],
  },
  {
    slug: "python-data-analysis-research-ai",
    title: "Data Analyst Professional Program",
    shortTitle: "Data Analyst Program",
    status: "active",
    audience: "Students, graduates, professionals & career transitioners",
    ageOrEducationLevel: "Beginner to Job-Ready Data Analysis Foundation",
    duration: "6 months",
    classesPerWeek: "4 classes/week",
    sessionDuration: "1 hour per session",
    format: "Live Online Hands-On Group Cohort",
    regularFee: 20000,
    offerFee: 10000,
    currency: "PKR",
    billingPeriod: "month",
    freeDemo: true,
    freeDemoNote: "Free trial session available before enrollment",
    paidNote: "Comprehensive 6-month program paid monthly at the special group offer rate",
    scheduleNote: "Contact admissions for next confirmed cohort schedule",
    tagline: "Python • MySQL • Statistics • Power BI • 6 Portfolio Projects",
    summary:
      "A structured 6-month, 24-week, 96-class live program covering Python data work, MySQL, statistics, Power BI, and six portfolio checkpoints.",
    description:
      "The Data Analyst Professional Program follows an instructor-approved business-analysis pathway. Learners progress from Python, NumPy, Pandas, cleaning, and exploratory analysis to MySQL business queries, statistics, Power BI reporting, and an integrated capstone. The focus is business-ready analysis: turning a real question and raw data into validated insight, an interactive dashboard, and a responsible recommendation.",
    highlights: [
      "6 months • 24 weeks • 96 live classes",
      "Python, NumPy, Pandas, cleaning, validation, EDA & visualization",
      "MySQL business SQL: JOINs, subqueries, CTEs & window functions",
      "Statistics, sampling, uncertainty, hypothesis tests & KPI design",
      "Power Query, star schema, DAX, KPIs & interactive Power BI dashboards",
      "Six project checkpoints including a documented end-to-end capstone",
      "Free Demo trial session available before enrollment",
    ],
    roadmap: [
      {
        phase: "Phase 1",
        title: "Python Foundations",
        topics: [
          "Python syntax, types, loops & functions",
          "Jupyter / Colab workflow",
          "NumPy & Pandas basics",
          "Load, inspect & summarize data",
          "Project checkpoint: Python mini-analysis",
        ],
        outcome: "Load data, inspect it, and produce correct summary findings.",
      },
      {
        phase: "Phase 2",
        title: "Python Cleaning & EDA",
        topics: [
          "Missing values, duplicates, dates & types",
          "Merges & reshaping",
          "Validation checks",
          "Exploratory data analysis & charts",
          "Project 1: Customer / Sales EDA",
        ],
        outcome: "Create a repeatable clean-data and exploratory-analysis workflow.",
      },
      {
        phase: "Phase 3",
        title: "MySQL & Business SQL",
        topics: [
          "SELECT, filters & ordering",
          "Aggregation & business KPIs",
          "Multi-table JOINs",
          "Subqueries, CTEs & window functions",
          "Project 2: E-commerce SQL analysis",
        ],
        outcome: "Answer business questions from related relational tables.",
      },
      {
        phase: "Phase 4",
        title: "Statistics & Analytical Thinking",
        topics: [
          "Distributions, sampling & uncertainty",
          "Confidence intervals",
          "Hypothesis-testing workflow",
          "Correlation, limitations & KPI design",
          "Project 3: Statistics / KPI / experiment case",
        ],
        outcome: "Interpret quantitative evidence and communicate its limitations.",
      },
      {
        phase: "Phase 5",
        title: "Power BI & Reporting",
        topics: [
          "Power Query cleaning",
          "Relationships & star schema",
          "DAX measures",
          "KPIs & interactive reports",
          "Project 4: Executive dashboard",
        ],
        outcome: "Deliver a validated interactive business dashboard.",
      },
      {
        phase: "Phase 6",
        title: "Integration & Capstone",
        topics: [
          "Python + MySQL + Power BI workflow",
          "GitHub documentation",
          "Privacy & responsible reporting",
          "Data storytelling & interview practice",
          "Projects 5–6: Marketing case + end-to-end capstone",
        ],
        outcome: "Present a documented end-to-end analysis and recommendation.",
      },
    ],
    prerequisites: [
      "Basic computer literacy and spreadsheet familiarity",
      "Comfort with arithmetic and willingness to practise analytical thinking",
      "Laptop capable of running Python, MySQL, and Power BI",
    ],
    idealFor: [
      "Students and graduates starting a structured Data Analyst pathway",
      "Professionals who need Python, SQL, statistics, and dashboard skills",
      "Career transitioners building an evidence-based analytics portfolio",
    ],
    icon: "Database",
    featured: true,
    keywords: [
      "Data Analyst live course",
      "Python MySQL Power BI course",
      "data analysis classes Pakistan",
      "business analytics roadmap",
      "online data analyst cohort",
    ],
  },
];

export const activeLiveOffers = liveOffers.filter((o) => o.status === "active");

export function getLiveOffer(slug: string): LiveOffer | undefined {
  return liveOffers.find((o) => o.slug === slug);
}
