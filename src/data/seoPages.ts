// SEO-focused landing pages targeting key search terms.
// Each renders through a shared, conversion-focused template.

export type SeoPage = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  bullets: string[];
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
  ctaCourseType: string;
  ctaSelected: string;
  keywords: string[];
};

export const seoPages: SeoPage[] = [
  {
    slug: "online-tutor-service-pakistan",
    h1: "Online Tutor Service in Pakistan",
    title: "Online Tutor Service in Pakistan | TechBuilt Open School",
    description:
      "Premium online tutor service in Pakistan for Grade 5 to MS. Live one-to-one tutoring in maths, physics, computer science and technical skills. Apply today.",
    eyebrow: "Trusted across Pakistan",
    intro:
      "Get expert, affordable online tutoring from the comfort of your home — anywhere in Pakistan. Our qualified tutors deliver live, personalised lessons that improve grades and build real skills.",
    bullets: [
      "Live one-to-one and group classes",
      "Qualified Pakistani and international tutors",
      "Flexible timing for every city and schedule",
      "Affordable plans with scholarships available",
    ],
    sections: [
      {
        heading: "Tutoring that fits every Pakistani student",
        body: "From Karachi to Lahore, Islamabad to Peshawar — our online tutor service reaches students in every city. We follow Federal, Punjab, Sindh, Cambridge and university curricula, so lessons always match what your child is studying at school or college.",
      },
      {
        heading: "Subjects and skills we cover",
        body: "Our tutors specialise in mathematics, physics, computer science and a wide range of technical courses including Python, JavaScript and web development. Whether you need exam preparation or career skills, we have the right tutor for you.",
      },
      {
        heading: "Why parents across Pakistan trust us",
        body: "We combine premium teaching with transparent progress reports, safe online classrooms and dedicated support. Parents stay informed every step of the way while students enjoy engaging, confidence-building lessons.",
      },
    ],
    faqs: [
      {
        question: "Is online tutoring effective for Pakistani students?",
        answer:
          "Yes. Our live, interactive lessons with one-to-one attention often produce faster results than crowded classrooms, with the convenience of learning from home.",
      },
      {
        question: "Which curricula do you support?",
        answer:
          "We support Federal, Punjab, Sindh, Cambridge (O/A Levels), and university curricula across Pakistan.",
      },
    ],
    ctaCourseType: "Tutor Service",
    ctaSelected: "Online Tutoring in Pakistan",
    keywords: ["online tutor service pakistan", "online tutor pakistan", "home tutor online"],
  },
  {
    slug: "international-online-academy",
    h1: "International Online Academy",
    title: "International Online Academy | TechBuilt Open School",
    description:
      "A premium international online academy offering live tutoring and technical courses for students worldwide, from Grade 5 to MS level. Enrol today.",
    eyebrow: "Global Online Academy",
    intro:
      "TechBuilt Open School is a premium international online academy bringing world-class tutoring and technical education to students across the globe, with flexible scheduling for every time zone.",
    bullets: [
      "Live online classes from anywhere in the world",
      "Flexible scheduling across all time zones",
      "International and academic curricula supported",
      "Premium, trusted learning experience",
    ],
    sections: [
      {
        heading: "Learn from anywhere in the world",
        body: "Whether your family is in the UK, UAE, USA, Saudi Arabia or beyond, our international online academy delivers the same premium learning experience. All you need is an internet connection.",
      },
      {
        heading: "Academic and technical excellence",
        body: "From core school subjects to in-demand technical skills like full stack and Python development, our specialised tutors prepare students for academic success and modern careers.",
      },
      {
        heading: "A trusted, premium experience",
        body: "We are built around quality, safety and results — with vetted tutors, structured curricula, and constant communication with parents and students.",
      },
    ],
    faqs: [
      {
        question: "Can students outside Pakistan join?",
        answer:
          "Absolutely. We serve students worldwide with flexible scheduling across time zones and curricula tailored to each learner.",
      },
      {
        question: "What time zones do you teach in?",
        answer:
          "All of them. We arrange class times that suit your local schedule, wherever you are based.",
      },
    ],
    ctaCourseType: "Other Inquiry",
    ctaSelected: "International Online Academy",
    keywords: ["international online academy", "online academy", "global online school"],
  },
  {
    slug: "online-classes-for-students",
    h1: "Online Classes for Students",
    title: "Online Classes for Students | TechBuilt Open School",
    description:
      "Live, interactive online classes for school, college and university students. Academic tutoring and technical courses from Grade 5 to MS. Join today.",
    eyebrow: "Live & interactive",
    intro:
      "Engaging, live online classes designed for real learning — not pre-recorded videos. Our students get genuine interaction, instant feedback, and personalised attention from expert tutors.",
    bullets: [
      "100% live, interactive lessons",
      "One-to-one or small group classes",
      "Academic subjects and technical skills",
      "Recordings and notes for revision",
    ],
    sections: [
      {
        heading: "Real classes, real teachers, real results",
        body: "Our online classes recreate the best of a premium classroom online. Students ask questions, get instant feedback and stay fully engaged throughout each session.",
      },
      {
        heading: "Built around each student",
        body: "We assess every student's level and goals, then tailor lessons accordingly. This personalised approach helps students learn faster and retain more.",
      },
      {
        heading: "For every grade and subject",
        body: "From Grade 5 fundamentals to MS-level specialisation, and from maths and physics to coding and web development — we have classes for every student.",
      },
    ],
    faqs: [
      {
        question: "Are classes live or recorded?",
        answer:
          "All classes are live and interactive. We also provide recordings and notes so students can revise anytime.",
      },
      {
        question: "What do students need to join?",
        answer:
          "Just a laptop, tablet or smartphone with an internet connection.",
      },
    ],
    ctaCourseType: "Other Inquiry",
    ctaSelected: "Online Classes for Students",
    keywords: ["online classes for students", "live online classes", "online learning"],
  },
  {
    slug: "grade-5-to-ms-online-learning",
    h1: "Grade 5 to MS Online Learning",
    title: "Grade 5 to MS Online Learning | TechBuilt Open School",
    description:
      "Continuous online learning from Grade 5 to MS level. Academic tutoring and technical courses tailored to every stage of education. Apply now.",
    eyebrow: "Every stage of learning",
    intro:
      "From early school years to advanced Master's-level study, TechBuilt Open School supports students at every stage with personalised online tutoring and technical courses.",
    bullets: [
      "School support (Grade 5 onwards)",
      "College and intermediate tutoring",
      "University and MS-level guidance",
      "Career-focused technical specializations",
    ],
    sections: [
      {
        heading: "A learning partner for the whole journey",
        body: "Education is a journey. We support students from Grade 5 through MS level, adapting our teaching as students grow — building strong foundations early and advanced expertise later.",
      },
      {
        heading: "Academic and technical pathways",
        body: "Younger students benefit from subject tutoring and concept building, while older students can pursue technical specializations that prepare them for university and careers.",
      },
      {
        heading: "Personalised at every level",
        body: "Each student gets a learning plan matched to their grade, curriculum and goals — ensuring meaningful progress at every stage.",
      },
    ],
    faqs: [
      {
        question: "Do you teach younger school students?",
        answer:
          "Yes, we support students from Grade 5 upwards with age-appropriate, engaging tutoring.",
      },
      {
        question: "Can MS-level students get support?",
        answer:
          "Yes, we provide advanced guidance and technical specializations suitable for university and MS-level students.",
      },
    ],
    ctaCourseType: "Academic Subject",
    ctaSelected: "Grade 5 to MS Online Learning",
    keywords: ["grade 5 to ms online learning", "online learning all grades"],
  },
  {
    slug: "computer-science-tutoring",
    h1: "Computer Science Tutoring",
    title: "Computer Science Tutoring Online | TechBuilt Open School",
    description:
      "Expert online computer science tutoring for school, college and university students. Concept-clear lessons, exam prep and coding support. Apply today.",
    eyebrow: "Concept-clear CS",
    intro:
      "Master computer science with patient, expert tutors. We make programming, algorithms, databases and theory genuinely clear — for every grade and curriculum.",
    bullets: [
      "Curriculum-aligned CS tutoring",
      "Programming and theory made simple",
      "Exam and assignment support",
      "School to university level",
    ],
    sections: [
      {
        heading: "Computer science, finally clear",
        body: "Many students find CS abstract. Our tutors break concepts into clear, practical steps with real coding examples, so students truly understand — not just memorise.",
      },
      {
        heading: "Exam and assignment ready",
        body: "We align tutoring to your exact syllabus and prepare students for exams, assignments and practicals with focused, personalised practice.",
      },
      {
        heading: "From basics to advanced",
        body: "Whether you're starting with programming basics or tackling advanced algorithms and databases, we have a specialist tutor for you.",
      },
    ],
    faqs: [
      {
        question: "Do you cover programming and theory?",
        answer:
          "Yes — we teach both practical programming and computer science theory, aligned to your curriculum.",
      },
      {
        question: "Which level do you teach?",
        answer:
          "From school (Grade 5+) to university and MS level.",
      },
    ],
    ctaCourseType: "Academic Subject",
    ctaSelected: "Computer Science",
    keywords: ["computer science tutoring", "cs tutor online", "computer science tutor"],
  },
  {
    slug: "maths-tutor",
    h1: "Maths Tutor Online",
    title: "Maths Tutor Online | TechBuilt Open School",
    description:
      "Qualified online maths tutors for Grade 5 to university level. Build confidence and top grades with personalised, exam-focused tutoring. Apply now.",
    eyebrow: "Top grades in maths",
    intro:
      "Turn maths from a struggle into a strength. Our expert online maths tutors deliver clear, step-by-step teaching and exam-focused practice for every level.",
    bullets: [
      "One-to-one online maths tutoring",
      "Grade 5 to university level",
      "Exam and board preparation",
      "Clear, confidence-building teaching",
    ],
    sections: [
      {
        heading: "Maths made simple",
        body: "Our tutors break down difficult topics into clear steps, building strong fundamentals so students can tackle any problem with confidence.",
      },
      {
        heading: "Results that show",
        body: "With personalised plans and regular practice, our students consistently improve their grades and exam performance.",
      },
      {
        heading: "Every topic, every level",
        body: "From arithmetic and algebra to calculus and statistics, we cover the full maths curriculum from Grade 5 to university.",
      },
    ],
    faqs: [
      {
        question: "Can you help with exam preparation?",
        answer:
          "Yes — we provide focused past-paper practice and exam strategies tailored to your board or curriculum.",
      },
      {
        question: "Do you offer one-to-one maths tutoring?",
        answer:
          "Yes, one-to-one is our most popular option for maximum personalised attention.",
      },
    ],
    ctaCourseType: "Academic Subject",
    ctaSelected: "Mathematics",
    keywords: ["maths tutor online", "math tutor", "online maths tuition"],
  },
  {
    slug: "physics-tutor",
    h1: "Physics Tutor Online",
    title: "Physics Tutor Online | TechBuilt Open School",
    description:
      "Expert online physics tutoring that makes concepts clear. Numerical practice, exam prep and curriculum-aligned lessons for Grade 8 to MS. Apply now.",
    eyebrow: "Understand physics",
    intro:
      "Learn physics by understanding, not memorising. Our tutors use real examples, clear diagrams and numerical practice to make every concept click.",
    bullets: [
      "Concept-focused physics tutoring",
      "Numerical and problem-solving practice",
      "Board and entrance exam preparation",
      "Curriculum-aligned, personalised lessons",
    ],
    sections: [
      {
        heading: "Physics that finally makes sense",
        body: "From mechanics to modern physics, our tutors connect theory to the real world so students genuinely understand the why behind every formula.",
      },
      {
        heading: "Strong on numericals",
        body: "We build confident problem solvers through structured numerical practice and exam-style questions.",
      },
      {
        heading: "Exam-ready preparation",
        body: "Lessons are aligned to your syllabus and focused on the topics and question types that matter most for your exams.",
      },
    ],
    faqs: [
      {
        question: "Do you help with physics numericals?",
        answer:
          "Yes — numerical problem solving is a core part of our physics tutoring.",
      },
      {
        question: "Which levels do you teach?",
        answer:
          "From Grade 8 up to university and MS level.",
      },
    ],
    ctaCourseType: "Academic Subject",
    ctaSelected: "Physics",
    keywords: ["physics tutor online", "physics tuition", "online physics tutor"],
  },
  {
    slug: "python-course-online",
    h1: "Python Course Online",
    title: "Python Course Online | TechBuilt Open School",
    description:
      "Learn Python online with live, expert-led classes. From fundamentals to real projects, automation and data. Beginner-friendly. Enrol today.",
    eyebrow: "Beginner friendly",
    intro:
      "Start your coding journey with the world's most popular language. Our live, online Python course takes you from complete beginner to building real projects.",
    bullets: [
      "Live, expert-led Python classes",
      "Beginner to advanced path",
      "Real projects and automation",
      "One-to-one or group learning",
    ],
    sections: [
      {
        heading: "The perfect first language",
        body: "Python's clean, readable syntax makes it ideal for beginners — while its power makes it essential for automation, data and AI.",
      },
      {
        heading: "Learn by building",
        body: "Every concept is reinforced with hands-on projects, so you learn practical, portfolio-ready skills from day one.",
      },
      {
        heading: "Career-ready foundations",
        body: "Python opens doors to web development, automation, data science and more. Our course builds the strong foundation you need.",
      },
    ],
    faqs: [
      {
        question: "Do I need prior experience?",
        answer:
          "No — our Python course is designed for complete beginners as well as those who want to advance.",
      },
      {
        question: "Will I build real projects?",
        answer:
          "Yes, you'll build practical projects throughout the course and a capstone project at the end.",
      },
    ],
    ctaCourseType: "Single Course",
    ctaSelected: "Python Programming",
    keywords: ["python course online", "learn python online", "python classes"],
  },
  {
    slug: "web-development-course-online",
    h1: "Web Development Course Online",
    title: "Web Development Course Online | TechBuilt Open School",
    description:
      "Learn web development online with live classes. Build responsive, modern websites with HTML, CSS, JavaScript and more. Portfolio-ready. Enrol today.",
    eyebrow: "Build real websites",
    intro:
      "Become a web developer with our live, project-based online course. Learn to build modern, responsive websites and launch a professional portfolio.",
    bullets: [
      "HTML, CSS, JavaScript and frameworks",
      "Responsive, modern web design",
      "Live, project-based learning",
      "Portfolio-ready by the end",
    ],
    sections: [
      {
        heading: "From beginner to builder",
        body: "Start with the fundamentals and progress to building complete, responsive websites and web applications with modern tools.",
      },
      {
        heading: "Project-based and practical",
        body: "You'll build real projects throughout the course, ending with a portfolio that showcases your skills to employers and clients.",
      },
      {
        heading: "A path to freelancing or a career",
        body: "Web development is one of the most in-demand and flexible skills today — perfect for careers and freelance work.",
      },
    ],
    faqs: [
      {
        question: "Is this course suitable for beginners?",
        answer:
          "Yes — we start from the basics and build up to professional skills step by step.",
      },
      {
        question: "Will I have a portfolio at the end?",
        answer:
          "Yes, you'll finish with real projects and a portfolio to showcase your abilities.",
      },
    ],
    ctaCourseType: "Single Course",
    ctaSelected: "Web Development",
    keywords: ["web development course online", "learn web development", "web design course"],
  },
];

export const getSeoPage = (slug: string) => seoPages.find((p) => p.slug === slug);
