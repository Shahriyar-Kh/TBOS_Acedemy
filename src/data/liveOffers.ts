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
    title: "Python for Data Analysis, Research & AI/ML Foundations",
    shortTitle: "Data Analysis & AI Foundations",
    status: "active",
    audience: "BS, MS, MPhil, PhD scholars, working professionals & data learners",
    ageOrEducationLevel: "University Students, Researchers & Professionals",
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
    tagline: "Scientific computing, exploratory data analysis & applied AI/ML foundations",
    summary:
      "A 6-month intensive live cohort designed for university students, researchers, and professionals to master data wrangling, visualization, research statistics, and applied machine learning foundations using Python.",
    description:
      "Python for Data Analysis, Research & AI/ML Foundations is a rigorous live group program designed for BS, MS, MPhil, and PhD scholars, quantitative researchers, and industry professionals working with data. Meeting 4 times per week (1 hour per session), learners gain hands-on proficiency with Python's core data ecosystem — NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn. The curriculum emphasizes exploratory data analysis, data cleaning, statistical modeling, research dataset processing, and essential machine learning algorithms with realistic boundaries (focused on applied statistical ML foundations, without unsupported claims of deep learning engineering).",
    highlights: [
      "6-month intensive cohort: 4 classes per week, 1 hour per session",
      "Tailored for BS, MS, MPhil, PhD scholars and quantitative professionals",
      "Deep dive into NumPy arrays, vectorization & high-performance computing",
      "Pandas data wrangling: filtering, imputation, aggregation, and grouping",
      "Publication-ready data visualization using Matplotlib and Seaborn",
      "Applied statistical foundations & hypothesis testing on research datasets",
      "Supervised machine learning foundations & model evaluation with Scikit-Learn",
      "Free Demo trial session available before enrollment",
    ],
    roadmap: [
      {
        phase: "Phase 1",
        title: "Python Essentials for Scientific Computing",
        topics: [
          "Jupyter Lab & scientific Python development environments",
          "NumPy n-dimensional arrays vs Python lists",
          "Array indexing, slicing, reshaping, and broadcasting rules",
          "Vectorized mathematical operations & universal functions (ufuncs)",
          "Random sampling, linear algebra basics & performance comparisons",
        ],
        outcome: "Perform fast numerical calculations and vectorized data transformations.",
      },
      {
        phase: "Phase 2",
        title: "Data Manipulation & Wrangling with Pandas",
        topics: [
          "Pandas Series and DataFrame structures & index alignment",
          "Importing data: CSV, Excel, SQL, and API endpoints",
          "Data cleaning: missing values imputation, duplicates & type casting",
          "Filtering, sorting, conditional selection & boolean indexing",
          "Split-Apply-Combine patterns using groupby, pivot tables & melt",
        ],
        outcome: "Clean, transform, and reshape messy real-world datasets.",
      },
      {
        phase: "Phase 3",
        title: "Exploratory Data Analysis & Visualization",
        topics: [
          "Principles of effective scientific data visualization",
          "Matplotlib architecture: figures, subplots, axes & styling",
          "Distribution plots: histograms, KDE, box plots & violin plots",
          "Relationship plots: scatter plots, regression lines & heatmaps with Seaborn",
          "Interactive exploratory workflows & identifying anomalies/outliers",
        ],
        outcome: "Generate publication-grade visualizations and extract analytical insights.",
      },
      {
        phase: "Phase 4",
        title: "Applied Statistics for Research & Analysis",
        topics: [
          "Descriptive statistics: central tendency, dispersion & skewness",
          "Probability distributions: Normal, Binomial, and Poisson",
          "Inferential statistics: Central Limit Theorem, confidence intervals",
          "Hypothesis testing: t-tests, ANOVA, and Chi-square tests",
          "Correlation vs causation, p-values & interpreting research metrics",
        ],
        outcome: "Formulate statistical hypotheses and validate research questions quantitatively.",
      },
      {
        phase: "Phase 5",
        title: "Applied Machine Learning Foundations",
        topics: [
          "Overview of machine learning paradigms: supervised vs unsupervised",
          "Feature engineering: scaling, encoding categorical variables & normalization",
          "Train/test splitting, cross-validation & data leakage prevention",
          "Linear regression & polynomial regression with Scikit-Learn",
          "Logistic regression for binary and multi-class classification",
        ],
        outcome: "Prepare features and train baseline predictive regression/classification models.",
      },
      {
        phase: "Phase 6",
        title: "Classification, Clustering & Research Capstone",
        topics: [
          "Decision trees and ensemble intuition (Random Forests overview)",
          "Model evaluation: accuracy, precision, recall, F1-score & ROC-AUC",
          "Unsupervised learning: K-Means clustering for customer/data segmentation",
          "Model tuning, parameter grids & validation curves",
          "Capstone: End-to-end exploratory research or data analysis project",
        ],
        outcome: "Complete and present an end-to-end data analysis and ML capstone project.",
      },
    ],
    prerequisites: [
      "Basic familiarity with programming or mathematics/statistics",
      "Comfort with arithmetic and basic algebra",
      "Laptop/computer capable of running Python and Jupyter Notebooks",
    ],
    idealFor: [
      "BS, MS, MPhil, and PhD research scholars analyzing thesis or survey data",
      "Professionals in engineering, finance, biological sciences, or social sciences",
      "Learners seeking honest, practical data analysis and AI foundations",
    ],
    icon: "Database",
    featured: true,
    keywords: [
      "Python data analysis course",
      "Python for research scholars",
      "live data analysis classes Pakistan",
      "machine learning foundations Python",
      "online data analytics cohort",
    ],
  },
];

export const activeLiveOffers = liveOffers.filter((o) => o.status === "active");

export function getLiveOffer(slug: string): LiveOffer | undefined {
  return liveOffers.find((o) => o.slug === slug);
}
