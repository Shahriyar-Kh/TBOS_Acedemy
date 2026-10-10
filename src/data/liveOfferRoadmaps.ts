export interface LiveOfferCoursePlan {
  course: string;
  title: string;
  duration: string;
  chapters: string[];
  project: string;
  outcome: string;
}

export interface LiveOfferCourseRoadmap {
  sourceNote: string;
  courses: LiveOfferCoursePlan[];
  capstoneProject: string;
}

/**
 * Curriculum-first live-batch roadmaps. These remain in source control so a
 * stale CMS marketing record cannot replace an approved teaching sequence.
 */
export const liveOfferCourseRoadmaps: Record<string, LiveOfferCourseRoadmap> = {
  "python-young-developers": {
    sourceNote: "Structured from the approved six-month young-developers teaching sequence.",
    courses: [
      {
        course: "Course 1",
        title: "Python Foundations & Logic",
        duration: "Approx. 2 months",
        chapters: [
          "Programming & Python environment",
          "Output, input, variables & data types",
          "Operators & expressions",
          "Conditions & branching logic",
          "Loops & algorithmic patterns",
          "Debugging beginner programs",
        ],
        project: "Build a menu-driven student result and quiz game.",
        outcome: "Write correct interactive programs using decisions and repetition.",
      },
      {
        course: "Course 2",
        title: "Functions & Data Collections",
        duration: "Approx. 2 months",
        chapters: [
          "Functions, parameters & return values",
          "Scope & reusable problem solving",
          "Lists & nested lists",
          "Tuples & sets",
          "Dictionaries & structured records",
          "Combining collections with functions",
        ],
        project: "Build a function-based student or inventory data manager.",
        outcome: "Organize reusable code and work confidently with multi-item data.",
      },
      {
        course: "Course 3",
        title: "Files, Beginner OOP & Desktop GUI",
        duration: "Approx. 2 months",
        chapters: [
          "Reading and writing files",
          "JSON data storage",
          "Errors & defensive input handling",
          "Classes, objects & methods",
          "Tkinter windows, widgets & layouts",
          "Events & multi-screen GUI flow",
        ],
        project: "Build a complete desktop study, quiz, or record-management application.",
        outcome: "Present a working GUI application created from the student's own code.",
      },
    ],
    capstoneProject:
      "Student-designed Python desktop application combining logic, functions, collections, saved data, beginner OOP, and a Tkinter interface.",
  },

  "100-days-complete-python": {
    sourceNote:
      "Aligned to the final 2026 100-Day Complete Core Python roadmap: 37 locked lectures across the approved 100-day learning journey.",
    courses: [
      {
        course: "Course 1",
        title: "Complete Python Fundamentals",
        duration: "Days 1–68 · Lectures 1–24",
        chapters: [
          "Programming, Python & Environment",
          "Python Syntax & Code Structure",
          "Variables, Assignment & Dynamic Typing",
          "Core Data Types & Numbers",
          "Input, Output & Formatting",
          "Operators & Expressions",
          "Strings & Text",
          "Conditions & Pattern Matching",
          "Loops & Repetition",
          "Functions - Beginner to Advanced",
          "Lists",
          "Tuples & Sequences",
          "Sets & Frozensets",
          "Dictionaries",
          "Comprehensions & Unpacking",
          "Built-in Functions & Advanced Looping",
          "Mutability, Identity, Hashing & Copying",
          "Modules & Imports",
          "Packages & Project Structure",
          "File Handling & pathlib",
          "Bytes, Binary Data, Encoding & Decoding",
          "JSON, CSV & Structured Data",
          "Errors & Exception Handling",
          "Virtual Environments & Dependencies",
        ],
        project: "Build a modular file-based expense, inventory, or student-data tracker.",
        outcome:
          "Write structured Python programs with functions, core collections, modules, persistent files, validation, and isolated dependencies.",
      },
      {
        course: "Course 2",
        title: "Complete Object-Oriented Python",
        duration: "Days 69–88 · Lectures 25–32",
        chapters: [
          "Classes & Objects",
          "Attributes, Methods & Object State",
          "Class Methods, Static Methods & Properties",
          "Inheritance, super() & MRO",
          "Encapsulation, Name Mangling & Composition",
          "Polymorphism & Duck Typing",
          "Special / Dunder Methods",
          "Modern Class Tools",
        ],
        project: "Build an OOP library, banking, or school-management system.",
        outcome:
          "Model real systems with clear object state, behavior, composition, inheritance, polymorphism, and Python object protocols.",
      },
      {
        course: "Course 3",
        title: "Advanced Python Language",
        duration: "Days 89–100 · Lectures 33–37",
        chapters: [
          "Iterables & Iterators",
          "Generators & Lazy Evaluation",
          "Decorators & functools",
          "Context Managers",
          "Advanced Python Object Model",
        ],
        project:
          "Build a lazy data-processing toolkit using custom iterators, generators, decorators, and safe resource management.",
        outcome:
          "Use advanced Python language mechanics correctly and understand their role in maintainable professional code.",
      },
    ],
    capstoneProject:
      "Deliver a documented multi-module Python system that combines persistent data, exception handling, OOP, iterators/generators, decorators, context management, and reproducible setup instructions.",
  },

  "python-data-analysis-research-ai": {
    sourceNote:
      "Replaced with the instructor-approved Data Analyst roadmap: 6 months, 24 weeks, 96 classes, and six portfolio checkpoints.",
    courses: [
      {
        course: "Course 1",
        title: "Python Foundations for Data Analysis",
        duration: "Month 1 · Weeks 1–4",
        chapters: [
          "Python syntax, types, conditions & loops",
          "Functions & reusable analysis logic",
          "Jupyter Notebook / Google Colab workflow",
          "NumPy foundations",
          "Pandas foundations",
          "Loading, inspecting & summarizing data",
        ],
        project: "Python mini-analysis checkpoint using a real tabular dataset.",
        outcome:
          "Load data, inspect its structure, calculate summaries, and document initial findings.",
      },
      {
        course: "Course 2",
        title: "Python Data Cleaning & Exploratory Data Analysis",
        duration: "Month 2 · Weeks 5–8",
        chapters: [
          "Missing values & imputation decisions",
          "Duplicate detection & removal",
          "Dates, types & text cleanup",
          "Merging & reshaping datasets",
          "Validation rules & quality checks",
          "EDA, charts, trends & anomalies",
        ],
        project: "Customer or sales data-cleaning and EDA portfolio case.",
        outcome: "Create a repeatable clean-data workflow and a defensible exploratory report.",
      },
      {
        course: "Course 3",
        title: "MySQL & Business SQL",
        duration: "Month 3 · Weeks 9–12",
        chapters: [
          "Relational tables, keys & data types",
          "SELECT, WHERE, ORDER BY & filtering",
          "Aggregation, GROUP BY & KPIs",
          "Multi-table JOINs",
          "Subqueries & common table expressions",
          "Window functions & business ranking",
        ],
        project: "E-commerce MySQL analysis with multi-table business questions.",
        outcome: "Answer business questions accurately from related relational tables.",
      },
      {
        course: "Course 4",
        title: "Statistics & Analytical Thinking",
        duration: "Month 4 · Weeks 13–16",
        chapters: [
          "Descriptive statistics & distributions",
          "Sampling, bias & uncertainty",
          "Confidence intervals",
          "Hypothesis-testing workflow",
          "Correlation, association & limitations",
          "KPI and experiment interpretation",
        ],
        project: "Statistics, KPI, or experiment-analysis case with a decision memo.",
        outcome:
          "Interpret evidence, uncertainty, effect, and limitations without overstating results.",
      },
      {
        course: "Course 5",
        title: "Power BI & Executive Reporting",
        duration: "Month 5 · Weeks 17–20",
        chapters: [
          "Power Query cleaning & transformation",
          "Relationships & star-schema design",
          "Date tables & model validation",
          "DAX measures & calculated columns",
          "KPIs, filters & drill-down interaction",
          "Dashboard design & publishing workflow",
        ],
        project: "Validated executive Power BI dashboard for a business dataset.",
        outcome:
          "Deliver an interactive dashboard with verified measures and a clear decision narrative.",
      },
      {
        course: "Course 6",
        title: "Integrated Analytics & Professional Practice",
        duration: "Month 6 · Weeks 21–24",
        chapters: [
          "Python + MySQL + Power BI workflow",
          "CSV/XLSX, APIs & JSON integration",
          "Git & GitHub project documentation",
          "Data privacy & responsible reporting",
          "Storytelling & stakeholder recommendations",
          "Portfolio and interview walkthrough",
        ],
        project: "Marketing-analysis portfolio case followed by the end-to-end capstone.",
        outcome:
          "Present a documented analysis from raw data to insight, dashboard, and recommendation.",
      },
    ],
    capstoneProject:
      "Complete an end-to-end Data Analyst portfolio project using Python, MySQL, statistics, and Power BI, with a clean GitHub repository, validated dashboard, and executive recommendations.",
  },
};

export function getLiveOfferCourseRoadmap(slug: string): LiveOfferCourseRoadmap | undefined {
  return liveOfferCourseRoadmaps[slug];
}
