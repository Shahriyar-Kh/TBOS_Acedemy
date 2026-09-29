export type Specialization = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  duration: string;
  level: string;
  modules: string[];
  outcomes: string[];
  careers: string[];
  icon: string;
  keywords: string[];
  featured?: boolean;
};

export const specializations: Specialization[] = [
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    tagline: "Master full-stack engineering with real-world projects.",
    summary:
      "Master both front-end and back-end development and build complete, production-grade web applications end to end.",
    description:
      "Our flagship specialization provides end-to-end software development training. You will learn front-end interfaces, back-end logic, databases, APIs, authentication and deployment — building real, full-scale projects mentored by industry tutors. Designed to take you from fundamentals to a strong professional portfolio.",
    duration: "6 months",
    level: "Beginner to Advanced",
    modules: [
      "HTML, CSS & responsive design",
      "JavaScript & modern front-end",
      "React fundamentals",
      "Back-end with Node / PHP",
      "Databases & APIs",
      "Authentication & security",
      "Deployment & DevOps basics",
      "Capstone full-stack project",
    ],
    outcomes: [
      "Build complete web applications end to end",
      "Master front-end and back-end engineering",
      "Create a professional project portfolio",
      "Build production-ready web applications",
    ],
    careers: ["Full Stack Developer", "Web Developer", "Software Engineer"],
    icon: "Layers",
    keywords: ["full stack development course", "full stack online"],
    featured: true,
  },
  {
    slug: "web-development",
    title: "Web Development",
    tagline: "Design and build modern, responsive websites.",
    summary:
      "A complete path to building professional, responsive websites and web applications using modern tools.",
    description:
      "This specialization covers everything you need to build modern websites — from clean HTML and CSS to JavaScript interactivity and deploying live projects. Perfect for beginners and freelancers who want practical, portfolio-ready web development skills.",
    duration: "4 months",
    level: "Beginner to Intermediate",
    modules: [
      "HTML5 & semantic structure",
      "CSS3, Flexbox & CSS Grid",
      "Responsive web design",
      "Modern JavaScript & DOM",
      "Working with web APIs",
      "Git, GitHub & deployment",
      "Capstone multi-page website",
    ],
    outcomes: [
      "Build modern responsive websites",
      "Write clean, accessible HTML/CSS/JS",
      "Deploy live websites to hosting platforms",
      "Create client-ready web projects",
    ],
    careers: ["Web Designer", "Front-End Developer", "Freelance Web Developer"],
    icon: "Globe",
    keywords: ["web development course", "learn web design"],
    featured: true,
  },
  {
    slug: "frontend-development",
    title: "Frontend Development",
    tagline: "Craft high-performance, interactive user interfaces.",
    summary:
      "Master modern UI development with JavaScript, React, Tailwind CSS, component architecture and responsive design.",
    description:
      "Focus deeply on what users see and interact with. Learn how to transform designs into fast, accessible, interactive web applications using React, state management, modern CSS and API integrations.",
    duration: "4 months",
    level: "Intermediate",
    modules: [
      "Advanced CSS & Tailwind",
      "Deep-dive JavaScript (ES6+)",
      "React fundamentals & hooks",
      "State management & routing",
      "Consuming REST APIs",
      "UI/UX best practices",
      "Capstone React application",
    ],
    outcomes: [
      "Build complex interactive UIs",
      "Master React and modern frontend workflows",
      "Integrate REST APIs seamlessly",
      "Ship performant web applications",
    ],
    careers: ["Front-End Engineer", "React Developer", "UI Developer"],
    icon: "Layout",
    keywords: ["frontend development course", "learn react"],
  },
  {
    slug: "backend-development",
    title: "Backend Development",
    tagline: "Power applications with secure servers, APIs and databases.",
    summary:
      "Build robust server-side systems, RESTful APIs, database architectures and authentication systems.",
    description:
      "Learn the engine behind modern applications. This track covers server architecture, database design (SQL), REST API design, authentication, caching and deploying production services.",
    duration: "4 months",
    level: "Intermediate",
    modules: [
      "Server-side programming",
      "Relational database design & SQL",
      "RESTful API design & testing",
      "Authentication, JWT & security",
      "Error handling & logging",
      "Deployment & container basics",
      "Capstone backend project",
    ],
    outcomes: [
      "Design robust RESTful APIs",
      "Model and query databases",
      "Implement authentication & security",
      "Deploy scalable back-end services",
    ],
    careers: ["Backend Developer", "API Engineer", "Software Engineer"],
    icon: "Server",
    keywords: ["backend development course", "api development"],
  },
  {
    slug: "python-development",
    title: "Python Development",
    tagline: "Build apps, automation and data foundations with Python.",
    summary:
      "Go from Python fundamentals to building real applications, automation scripts, and data-driven projects.",
    description:
      "Python opens doors to web, automation, data and AI. This specialization takes you from solid fundamentals to building real applications, automating tasks, and working with data — with mentorship and project-based learning at every stage.",
    duration: "5 months",
    level: "Beginner to Intermediate",
    modules: [
      "Python fundamentals",
      "Object-oriented Python",
      "Working with data & files",
      "APIs & web with Python",
      "Automation & scripting",
      "Intro to data analysis",
      "Capstone Python project",
    ],
    outcomes: [
      "Write professional Python code",
      "Build apps and automation tools",
      "Work with data and APIs",
      "Create a strong Python portfolio",
    ],
    careers: ["Python Developer", "Automation Engineer", "Data Analyst"],
    icon: "Terminal",
    keywords: ["python development course", "python online"],
    featured: true,
  },
];

export const getSpecialization = (slug: string) =>
  specializations.find((s) => s.slug === slug);
export const featuredSpecializations = specializations.filter((s) => s.featured);
