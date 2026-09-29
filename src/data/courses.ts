export type Course = {
  slug: string;
  title: string;
  category: "Academic" | "Technical";
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
    category: "Technical",
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
    category: "Technical",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Add interactivity and logic to the web.",
    summary:
      "Learn the programming language of the web. From variables to DOM manipulation and APIs, build dynamic, interactive applications.",
    description:
      "JavaScript powers the modern web. In this course you will learn core programming concepts, work with the DOM, handle events, fetch data from APIs, and build interactive projects. Designed to take complete beginners to a confident, job-ready foundation in front-end programming.",
    outcomes: [
      "Understand core programming logic and data structures",
      "Manipulate the DOM and handle user events",
      "Work with APIs and asynchronous JavaScript",
      "Build interactive web applications",
    ],
    curriculum: [
      "Variables, data types & operators",
      "Functions, arrays & objects",
      "DOM manipulation & events",
      "ES6+ modern JavaScript",
      "Fetch, promises & async/await",
      "Capstone: interactive web app",
    ],
    audience: "Learners who know basic HTML/CSS and want to add interactivity.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Braces",
    keywords: ["javascript course online", "learn javascript"],
    featured: true,
  },
  {
    slug: "python",
    title: "Python Programming",
    category: "Technical",
    level: "Beginner to Advanced",
    duration: "10 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "The world's most popular language for beginners and pros.",
    summary:
      "Learn Python from fundamentals to real projects — perfect for programming beginners, automation, data, and AI foundations.",
    description:
      "Python is the ideal first language and a powerful tool for automation, data science, and AI. This course covers programming fundamentals, problem solving, working with files and data, and building practical projects. Taught with patient, one-to-one guidance for every level.",
    outcomes: [
      "Master Python syntax and programming logic",
      "Work with files, data and libraries",
      "Solve real problems with clean code",
      "Build a portfolio Python project",
    ],
    curriculum: [
      "Python basics & control flow",
      "Functions, modules & error handling",
      "Data structures: lists, dicts, sets",
      "Working with files & libraries",
      "Intro to automation & data",
      "Capstone project",
    ],
    audience: "Beginners and students preparing for development or data careers.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Terminal",
    keywords: ["python course online", "learn python"],
    featured: true,
  },
  {
    slug: "php",
    title: "PHP & MySQL",
    category: "Technical",
    level: "Intermediate",
    duration: "8 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Build dynamic, database-driven websites.",
    summary:
      "Learn server-side development with PHP and MySQL to build dynamic websites, login systems, and complete web applications.",
    description:
      "PHP powers a huge share of the web. This course teaches server-side programming, working with MySQL databases, building secure forms and authentication, and creating dynamic, data-driven web applications from the ground up.",
    outcomes: [
      "Write server-side PHP applications",
      "Design and query MySQL databases",
      "Build secure forms and authentication",
      "Deploy a dynamic web application",
    ],
    curriculum: [
      "PHP fundamentals & syntax",
      "Forms & request handling",
      "MySQL database design",
      "CRUD operations",
      "Sessions & authentication",
      "Capstone: dynamic web app",
    ],
    audience: "Learners comfortable with HTML who want back-end skills.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Database",
    keywords: ["php course online", "php mysql"],
  },
  {
    slug: "java",
    title: "Java Programming",
    category: "Technical",
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    mode: "Live online · 1-to-1 or group",
    tagline: "Master object-oriented programming with Java.",
    summary:
      "Learn Java and object-oriented programming — a strong foundation for software engineering, university courses, and careers.",
    description:
      "Java is a cornerstone of computer science education and enterprise software. This course builds a strong foundation in object-oriented programming, problem solving, and clean code — ideal for students preparing for university or a software engineering path.",
    outcomes: [
      "Understand object-oriented programming",
      "Write clean, structured Java code",
      "Solve algorithmic problems",
      "Build console and small app projects",
    ],
    curriculum: [
      "Java syntax & data types",
      "Control flow & methods",
      "Classes, objects & OOP",
      "Collections & generics",
      "Exception handling",
      "Capstone project",
    ],
    audience: "Students preparing for CS degrees and software careers.",
    priceNote: "Flexible monthly plans · Scholarships available",
    icon: "Coffee",
    keywords: ["java course online", "learn java"],
  },
  {
    slug: "computer-science",
    title: "Computer Science",
    category: "Academic",
    level: "Grade 5 – MS",
    duration: "Ongoing · per term",
    mode: "Live online tutoring",
    tagline: "Concept-clear computer science tutoring for every grade.",
    summary:
      "Personalised computer science tutoring covering school, college and university syllabi with clear concepts and exam preparation.",
    description:
      "Our computer science tutoring follows your school, college or university curriculum while building deep conceptual understanding. From programming basics to algorithms, databases and theory, our tutors prepare students for exams and real-world skills with one-to-one attention.",
    outcomes: [
      "Strong conceptual clarity in CS topics",
      "Improved grades and exam confidence",
      "Practical coding and problem-solving skills",
      "Curriculum-aligned, personalised lessons",
    ],
    curriculum: [
      "Programming fundamentals",
      "Data structures & algorithms",
      "Databases & SQL",
      "Computer systems & networks",
      "Exam-focused practice",
      "Project & assignment support",
    ],
    audience: "School, college and university students (Grade 5 to MS).",
    priceNote: "Per-term plans · Curriculum aligned",
    icon: "Cpu",
    keywords: ["computer science tutoring", "cs tutor online"],
    featured: true,
  },
  {
    slug: "maths",
    title: "Mathematics",
    category: "Academic",
    level: "Grade 5 – MS",
    duration: "Ongoing · per term",
    mode: "Live online tutoring",
    tagline: "Build confidence and top grades in maths.",
    summary:
      "Expert online maths tutoring from Grade 5 to university level — clear explanations, practice, and exam-focused preparation.",
    description:
      "Mathematics becomes simple with the right tutor. Our maths specialists teach from Grade 5 through university level, breaking down difficult topics into clear steps, building strong fundamentals, and preparing students for board, college and entrance exams.",
    outcomes: [
      "Master core and advanced maths topics",
      "Improve speed and accuracy",
      "Excel in school and entrance exams",
      "Develop strong problem-solving habits",
    ],
    curriculum: [
      "Arithmetic & algebra",
      "Geometry & trigonometry",
      "Calculus foundations",
      "Statistics & probability",
      "Past-paper & exam practice",
      "Homework & assignment support",
    ],
    audience: "Students from Grade 5 to MS level needing maths support.",
    priceNote: "Per-term plans · Curriculum aligned",
    icon: "Sigma",
    keywords: ["maths tutor online", "math tutoring pakistan"],
    featured: true,
  },
  {
    slug: "physics",
    title: "Physics",
    category: "Academic",
    level: "Grade 8 – MS",
    duration: "Ongoing · per term",
    mode: "Live online tutoring",
    tagline: "Understand physics, not just memorise it.",
    summary:
      "Engaging online physics tutoring that turns difficult concepts into clear understanding, with exam and numerical practice.",
    description:
      "Physics is best learned by understanding, not memorising. Our tutors use real-world examples, diagrams and numerical practice to make mechanics, electricity, waves and modern physics genuinely clear — preparing students for school, board and entrance exams.",
    outcomes: [
      "Deep understanding of physics concepts",
      "Confident numerical problem solving",
      "Strong board and entrance-exam preparation",
      "Curriculum-aligned, personalised lessons",
    ],
    curriculum: [
      "Mechanics & motion",
      "Electricity & magnetism",
      "Waves, light & sound",
      "Thermodynamics",
      "Modern physics",
      "Numerical & exam practice",
    ],
    audience: "Students from Grade 8 to MS level needing physics support.",
    priceNote: "Per-term plans · Curriculum aligned",
    icon: "Atom",
    keywords: ["physics tutor online", "physics tutoring"],
    featured: true,
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const academicCourses = courses.filter((c) => c.category === "Academic");
export const technicalCourses = courses.filter((c) => c.category === "Technical");
export const featuredCourses = courses.filter((c) => c.featured);
