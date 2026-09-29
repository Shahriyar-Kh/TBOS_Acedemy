export type CourseCategory =
  | "Programming"
  | "Web Development"
  | "Database"
  | "Data & AI"
  | "Computer Science";

export type Course = {
  slug: string;
  title: string;
  category: CourseCategory;
  level: string;
  duration: string;
  mode: string;
  tagline: string;
  summary: string;
  description: string;
  outcomes: string[];
  curriculum: string[];
  audience: string;
  priceNote: string;
  icon: string; // lucide icon name
  keywords: string[];
  featured?: boolean;
};

export const courses: Course[] = [
  {
    slug: "html-css",
    title: "HTML & CSS",
    category: "Web Development",
    level: "Beginner",
    duration: "6 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Build beautiful, responsive websites from scratch.",
    summary:
      "Master the building blocks of the web. Learn semantic HTML and modern CSS to create clean, responsive, professional layouts.",
    description:
      "This foundational course takes you from zero to confidently building responsive websites. You will learn semantic HTML structure, modern CSS including Flexbox and Grid, responsive design principles, and best practices used by professional front-end developers. Every lesson is hands-on with real projects guided by an expert tutor.",
    outcomes: [
      "Write clean, semantic, accessible HTML",
      "Style modern layouts with Flexbox and CSS Grid",
      "Build fully responsive, mobile-first websites",
      "Publish a personal portfolio project",
    ],
    curriculum: [
      "HTML fundamentals & document structure",
      "Forms, media and semantic elements",
      "CSS selectors, the box model & typography",
      "Flexbox & CSS Grid layouts",
      "Responsive design & media queries",
      "Capstone: responsive multi-page website",
    ],
    audience: "Students Grade 8+ and beginners starting their web journey.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Code2",
    keywords: ["html course online", "css course", "learn web design"],
    featured: true,
  },
  {
    slug: "javascript",
    title: "JavaScript",
    category: "Programming",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Add interactivity and logic to the web.",
    summary:
      "Learn modern JavaScript from core syntax to async programming, DOM manipulation and building interactive web apps.",
    description:
      "JavaScript powers the modern web. In this comprehensive course, you learn ES6+ JavaScript from variable scope and arrays to closures, async/await, API integration and event-driven programming. Build real browser games and interactive apps with live tutor support.",
    outcomes: [
      "Deep understanding of modern ES6+ JavaScript",
      "Manipulate the DOM and handle user events",
      "Work with APIs, fetch and asynchronous code",
      "Build interactive front-end web applications",
    ],
    curriculum: [
      "Variables, data types & operators",
      "Functions, scope & closures",
      "Arrays, objects & modern ES6 features",
      "DOM manipulation & event handling",
      "Async JavaScript, Promises & Fetch API",
      "Capstone: interactive web application",
    ],
    audience: "Learners who know basic HTML/CSS and want to add logic and programming.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "FileCode",
    keywords: ["javascript course online", "learn javascript"],
    featured: true,
  },
  {
    slug: "python",
    title: "Python",
    category: "Programming",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "The world's most versatile, beginner-friendly language.",
    summary:
      "Start coding with Python. Build strong foundations in logic, functions, data structures and object-oriented programming.",
    description:
      "Python is the ideal first language and an essential tool for web development, data analysis, automation and AI. This course teaches clean, pythonic code from scratch — focusing on problem-solving, real-world mini-projects and best programming practices.",
    outcomes: [
      "Write clean, idiomatic Python code",
      "Solve algorithmic problems with confidence",
      "Understand object-oriented programming (OOP)",
      "Build command-line tools and practical automation scripts",
    ],
    curriculum: [
      "Python setup, syntax & core data types",
      "Control flow, loops & conditionals",
      "Functions, modules & packages",
      "Data structures: lists, dicts, sets, tuples",
      "Object-oriented programming (OOP)",
      "Capstone: practical Python project",
    ],
    audience: "School/college students and professionals starting programming.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Terminal",
    keywords: ["python course online", "learn python pakistan", "python coding class"],
    featured: true,
  },
  {
    slug: "php",
    title: "PHP & Backend",
    category: "Web Development",
    level: "Intermediate",
    duration: "8 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Build dynamic, database-driven web applications.",
    summary:
      "Learn server-side programming with modern PHP. Work with MySQL databases, forms, authentication and MVC architecture.",
    description:
      "PHP runs a huge part of the web. This course takes you behind the scenes of websites to handle form submissions, query MySQL databases, manage user sessions and build secure dynamic web applications with clean architecture.",
    outcomes: [
      "Build dynamic server-side web applications",
      "Perform MySQL database CRUD operations",
      "Implement user authentication & sessions",
      "Understand MVC patterns and secure coding",
    ],
    curriculum: [
      "PHP syntax & server-side basics",
      "Working with forms & GET/POST data",
      "MySQL database design & PDO queries",
      "User authentication, sessions & security",
      "Object-oriented PHP & MVC fundamentals",
      "Capstone: dynamic database-driven app",
    ],
    audience: "Students with basic HTML/CSS/JS ready for backend development.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Server",
    keywords: ["php course online", "learn backend development"],
  },
  {
    slug: "java",
    title: "Java",
    category: "Programming",
    level: "Intermediate",
    duration: "10 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Master enterprise OOP and strong software fundamentals.",
    summary:
      "Build a rock-solid foundation in object-oriented programming, data structures, and enterprise software concepts using Java.",
    description:
      "Java is the backbone of university computer science programmes and enterprise software worldwide. This course teaches strict typing, classes, inheritance, interfaces, polymorphism, collections and clean code principles.",
    outcomes: [
      "Master core Java and object-oriented design",
      "Work with Java Collections and generics",
      "Write maintainable, robust code with unit tests",
      "Prepare for university CS coursework and tech roles",
    ],
    curriculum: [
      "Java syntax, types & control structures",
      "Classes, objects & constructors",
      "Inheritance, interfaces & polymorphism",
      "Collections & generics",
      "Exception handling",
      "Capstone project",
    ],
    audience: "Students preparing for CS degrees and software careers.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Coffee",
    keywords: ["java course online", "learn java"],
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const technicalCourses = courses;
export const allCourses = courses;
export const featuredCourses = courses.filter((c) => c.featured);
export const academicCourses: Course[] = []; // Deprecated: academic subjects moved to src/data/tutoring.ts