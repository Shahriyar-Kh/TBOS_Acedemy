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
    tagline: "Become a complete, job-ready developer.",
    summary:
      "Master both front-end and back-end development and build complete, production-grade web applications end to end.",
    description:
      "Our flagship specialization makes you a complete developer. You will learn front-end interfaces, back-end logic, databases, APIs, authentication and deployment — building real, full-scale projects mentored by industry tutors. Designed to take you from fundamentals to a strong professional portfolio.",
    duration: "6 months",
    level: "Beginner to Job-ready",
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
      "Become job-ready for developer roles",
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
    level: "Beginner to Professional",
    modules: [
      "HTML5 & semantic structure",
      "Modern CSS & responsive layouts",
      "JavaScript essentials",
      "Working with frameworks",
      "Version control with Git",
      "Hosting & deployment",
      "Portfolio capstone",
    ],
    outcomes: [
      "Build responsive, modern websites",
      "Work confidently with JavaScript",
      "Deploy live projects",
      "Launch a freelance or career portfolio",
    ],
    careers: ["Web Developer", "Freelance Developer", "UI Developer"],
    icon: "Globe",
    keywords: ["web development course online", "learn web development"],
    featured: true,
  },
  {
    slug: "frontend-development",
    title: "Frontend Development",
    tagline: "Craft beautiful, interactive user interfaces.",
    summary:
      "Specialise in modern front-end engineering with React, responsive design, and polished, accessible interfaces.",
    description:
      "Front-end developers bring products to life. This specialization focuses on modern UI engineering — HTML, CSS, JavaScript and React — with a strong emphasis on responsive design, accessibility, performance and real-world component architecture.",
    duration: "4 months",
    level: "Beginner to Professional",
    modules: [
      "HTML & advanced CSS",
      "JavaScript for the UI",
      "React & component architecture",
      "State management",
      "Responsive & accessible design",
      "Performance & best practices",
      "Capstone front-end app",
    ],
    outcomes: [
      "Build modern interfaces with React",
      "Create responsive, accessible UIs",
      "Master component-driven development",
      "Ship a polished front-end portfolio",
    ],
    careers: ["Frontend Developer", "React Developer", "UI Engineer"],
    icon: "MonitorSmartphone",
    keywords: ["frontend development course", "react course online"],
    featured: true,
  },
  {
    slug: "backend-development",
    title: "Backend Development",
    tagline: "Power applications with robust server-side logic.",
    summary:
      "Learn to build secure, scalable back-end systems, APIs and databases that power real applications.",
    description:
      "Behind every great app is a strong back-end. This specialization teaches server-side programming, REST APIs, database design, authentication and security best practices — preparing you to build scalable systems that power modern applications.",
    duration: "4 months",
    level: "Intermediate",
    modules: [
      "Server-side programming",
      "REST API design",
      "Relational databases & SQL",
      "Authentication & security",
      "Caching & performance",
      "Testing & deployment",
      "Capstone back-end project",
    ],
    outcomes: [
      "Design and build secure APIs",
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
    level: "Beginner to Professional",
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
  {
    slug: "academic-support",
    title: "Academic Support",
    tagline: "Personalised tutoring for school, college and university.",
    summary:
      "Comprehensive academic tutoring across subjects and grades — from Grade 5 to MS level — with exam-focused mentoring.",
    description:
      "Our Academic Support track provides personalised, curriculum-aligned tutoring across maths, physics, computer science and more. With one-to-one attention, regular assessments and exam-focused mentoring, we help students from Grade 5 to MS level achieve consistent academic success.",
    duration: "Ongoing · per term",
    level: "Grade 5 – MS",
    modules: [
      "Personalised learning plan",
      "Core subject tutoring",
      "Homework & assignment help",
      "Regular assessments",
      "Exam & board preparation",
      "Progress reports for parents",
    ],
    outcomes: [
      "Improved grades and confidence",
      "Curriculum-aligned learning",
      "Strong exam preparation",
      "Consistent academic progress",
    ],
    careers: ["Academic excellence", "University readiness", "Scholarship readiness"],
    icon: "GraduationCap",
    keywords: ["academic tutoring online", "online tutor service"],
    featured: true,
  },
];

export const getSpecialization = (slug: string) =>
  specializations.find((s) => s.slug === slug);
export const featuredSpecializations = specializations.filter((s) => s.featured);
