export type TutoringCategory = "Academic" | "Quran & Islamic Studies";

export type TutoringSubject = {
  slug: string;
  title: string;
  category: TutoringCategory;
  level: string;
  summary: string;
  audience: string;
  topics: string[];
  icon: string;
  keywords: string[];
  featured?: boolean;
};

export const tutoringSubjects: TutoringSubject[] = [
  {
    slug: "mathematics",
    title: "Mathematics",
    category: "Academic",
    level: "Grade 5 to University",
    summary:
      "Expert one-to-one and small group maths tutoring from foundational school levels to advanced university calculus and statistics.",
    audience: "Students from Grade 5 to BS/MS level seeking strong mathematical problem solving.",
    topics: [
      "Arithmetic & Pre-Algebra",
      "Algebra & Linear Algebra",
      "Geometry & Trigonometry",
      "Calculus (Differentiation & Integration)",
      "Statistics & Probability",
      "Exam & Board Paper Practice",
    ],
    icon: "Sigma",
    keywords: ["maths tutor online", "online math tutoring", "math tutor pakistan"],
    featured: true,
  },
  {
    slug: "physics",
    title: "Physics",
    category: "Academic",
    level: "Grade 8 to University",
    summary:
      "Concept-clear physics tutoring focused on physical understanding, formula derivation, and numerical problem solving.",
    audience: "Matric, FSc, O/A Levels, and University students requiring physics mastery.",
    topics: [
      "Mechanics & Kinematics",
      "Work, Energy & Power",
      "Electricity & Magnetism",
      "Waves, Sound & Optics",
      "Thermodynamics",
      "Modern Physics & Electronics",
      "Numerical Problem Solving",
    ],
    icon: "Atom",
    keywords: ["physics tutor online", "physics tuition", "online physics tutor"],
    featured: true,
  },
  {
    slug: "computer-science-tutoring",
    title: "Computer Science Tutoring",
    category: "Academic",
    level: "Grade 5 to MS",
    summary:
      "Curriculum-aligned CS academic coaching covering school syllabi, board exams, and university coursework.",
    audience: "Students needing conceptual and syllabus tutoring for academic CS courses.",
    topics: [
      "Computer Science Theory & Architecture",
      "Algorithms & Flowcharts",
      "Data Structures & OOP Principles",
      "Database Systems & Basic SQL",
      "Board / University Syllabus Alignment",
      "Assignment & Lab Guidance",
    ],
    icon: "Cpu",
    keywords: ["computer science tutor", "cs academic tutoring", "o level cs tutor"],
    featured: true,
  },
  {
    slug: "chemistry",
    title: "Chemistry",
    category: "Academic",
    level: "Grade 8 to College",
    summary:
      "Comprehensive chemistry tutoring covering physical, organic, and inorganic chemistry with clear equation balancing and stoichiometry.",
    audience: "Middle school through college students preparing for board or international exams.",
    topics: [
      "Atomic Structure & Periodic Table",
      "Chemical Bonding & Reactions",
      "Stoichiometry & Mole Concept",
      "Organic Chemistry Foundations",
      "Acids, Bases & Salts",
      "Electrochemistry & Energetics",
    ],
    icon: "FlaskConical",
    keywords: ["chemistry tutor online", "online chemistry tuition"],
  },
  {
    slug: "biology",
    title: "Biology",
    category: "Academic",
    level: "Grade 8 to College",
    summary:
      "Visual and conceptual biology tutoring covering cell biology, genetics, human physiology, and ecology.",
    audience: "Students preparing for Matric, FSc, O/A Level, or pre-medical entrance exams.",
    topics: [
      "Cell Biology & Molecular Genetics",
      "Human Anatomy & Physiology",
      "Plant Physiology & Photosynthesis",
      "Genetics & Evolution",
      "Ecology & Biodiversity",
      "Diagram & Exam Preparation",
    ],
    icon: "Dna",
    keywords: ["biology tutor online", "pre-med biology tutoring"],
  },
  {
    slug: "general-school-support",
    title: "General School Support",
    category: "Academic",
    level: "Grades 5 – 8",
    summary:
      "All-subject homework help, daily study discipline, and foundational concept coaching for middle school students.",
    audience: "Younger learners needing patient daily tutoring across core subjects.",
    topics: [
      "Daily Homework Coaching",
      "English Reading & Grammar",
      "General Science & Mathematics",
      "Social Studies & History",
      "Study Habits & Exam Readiness",
    ],
    icon: "GraduationCap",
    keywords: ["middle school tutor", "school homework help"],
  },
  {
    slug: "college-support",
    title: "College Support (Matric / FSc / O & A Level)",
    category: "Academic",
    level: "Grades 9 – 12",
    summary:
      "Targeted exam preparation and syllabus coverage for Matric, Intermediate (FSc/ICS), and Cambridge O/A Levels.",
    audience: "Secondary and higher secondary students targeting top grades and university admissions.",
    topics: [
      "Federal & Provincial Board Past Papers",
      "Cambridge O & A Level Past Paper Drills",
      "Conceptual Exam Strategy",
      "Core Subject Deep Dives (Maths, Physics, Chem, CS)",
      "Time Management in Exams",
    ],
    icon: "BookOpen",
    keywords: ["fsc tutor online", "o level tutor", "a level online tutoring"],
    featured: true,
  },
  {
    slug: "university-support",
    title: "University Academic Support",
    category: "Academic",
    level: "BS / MS / University",
    summary:
      "Advanced academic guidance for university students tackling difficult semester subjects, labs, and research fundamentals.",
    audience: "Undergraduate and graduate students seeking higher-level academic coaching.",
    topics: [
      "Advanced Calculus & Differential Equations",
      "Linear Algebra & Numerical Computing",
      "Theoretical Computer Science",
      "Semester Project Guidance",
      "Academic Research Paper Structuring",
    ],
    icon: "Library",
    keywords: ["university tutor", "engineering math tutor", "bs cs tutoring"],
  },
  {
    slug: "quran-reading",
    title: "Quran Reading (Qaida / Beginner)",
    category: "Quran & Islamic Studies",
    level: "All Ages · Beginner",
    summary:
      "One-on-one Norani Qaida and Quran recitation classes for children and adults starting from the basics.",
    audience: "Beginners of all ages learning Arabic letters, pronunciation, and initial Quranic reading.",
    topics: [
      "Arabic Alphabet & Pronunciation Points (Makharij)",
      "Connecting Letters & Harakat",
      "Basic Word Formation & Rules",
      "Fluent Norani Qaida Completion",
      "Step-by-Step Transition to the Holy Quran",
    ],
    icon: "BookOpenCheck",
    keywords: ["online quran tutor", "learn norani qaida", "quran teacher"],
    featured: true,
  },
  {
    slug: "nazra-quran",
    title: "Nazra Quran with Translation",
    category: "Quran & Islamic Studies",
    level: "Intermediate",
    summary:
      "Fluent recitation of the Holy Quran paired with word-by-word Urdu or English translation and conceptual understanding.",
    audience: "Students wanting to read the Quran fluently while understanding its divine meanings.",
    topics: [
      "Fluent Daily Nazra Recitation",
      "Word-by-Word Translation",
      "Key Themes & Tafseer Summaries",
      "Daily Duas & Practical Supplications",
      "Spiritual Reflection & Ethics",
    ],
    icon: "Languages",
    keywords: ["nazra quran online", "quran with translation online"],
  },
  {
    slug: "tajweed-tarteel",
    title: "Tajweed & Tarteel",
    category: "Quran & Islamic Studies",
    level: "Intermediate to Advanced",
    summary:
      "Deep study and application of Tajweed rules to recite the Holy Quran with precision, melody, and reverence.",
    audience: "Learners seeking classical Quranic recitation with rigorous phonetics and rules.",
    topics: [
      "Makharij al-Huruf (Phonetic Articulation Points)",
      "Ahkam al-Noon Sakinah & Meem Sakinah",
      "Rules of Madd, Qalqalah & Ghunnah",
      "Stop & Pause Signs (Waqf Rules)",
      "Practical Recitation Drill & Certification",
    ],
    icon: "Sparkles",
    keywords: ["tajweed classes online", "learn tajweed rules"],
    featured: true,
  },
  {
    slug: "islamic-studies-fundamentals",
    title: "Islamic Studies Fundamentals",
    category: "Quran & Islamic Studies",
    level: "All Levels",
    summary:
      "Essential Islamic education covering Aqeedah, Fiqh of daily worship, Seerah of Prophet Muhammad (PBUH), and Akhlaq.",
    audience: "Children and adults seeking a solid foundation in Islamic beliefs, practices, and character.",
    topics: [
      "Pillars of Islam & Articles of Faith (Aqeedah)",
      "Salah (Prayer) Step-by-Step & Taharah Rules",
      "Seerah of Prophet Muhammad (PBUH)",
      "Stories of the Prophets",
      "Islamic Manners, Character & Daily Etiquette (Akhlaq)",
    ],
    icon: "HeartHandshake",
    keywords: ["online islamic studies", "islamic education for kids"],
  },
];

export const academicTutoring = tutoringSubjects.filter(
  (s) => s.category === "Academic",
);

export const quranTutoring = tutoringSubjects.filter(
  (s) => s.category === "Quran & Islamic Studies",
);

export const featuredTutoring = tutoringSubjects.filter((s) => s.featured);

export const getTutoringBySlug = (slug: string) =>
  tutoringSubjects.find((s) => s.slug === slug);