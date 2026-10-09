// SEO-focused landing pages targeting key search terms.
// Each renders through a shared, conversion-focused template.
// Copy must stay evidence-based: admissions confirms availability, schedule, tutor/cohort fit and fees.

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
      "Live online tutoring options in Pakistan for school, college and university learners. One-to-one and small-group formats are available subject to tutor scheduling.",
    eyebrow: "Online Tutoring in Pakistan",
    intro:
      "Explore live online tutoring from home with subject, level and schedule reviewed through admissions before enrollment.",
    bullets: [
      "One-to-one tutoring available",
      "Small-group options when scheduled",
      "Subject and level reviewed before tutor matching",
      "Schedule and applicable fee confirmed before enrollment",
    ],
    sections: [
      {
        heading: "Tutoring built around the learner's current needs",
        body: "Share the learner's grade, syllabus, goals and preferred timing. Admissions reviews the request and confirms whether a suitable tutoring option and schedule are currently available.",
      },
      {
        heading: "Academic and technical learning options",
        body: "The public catalog includes academic subjects, computer science, Quran and Islamic Studies tutoring, alongside separate technical courses and specializations. Exact subject coverage is confirmed against the learner's request.",
      },
      {
        heading: "Clear next steps before paid continuation",
        body: "Tutor availability, class format, recurring timetable and the applicable fee are confirmed before paid classes begin. A Free Demo is one trial session only and may be used to assess teaching fit.",
      },
    ],
    faqs: [
      {
        question: "Can students in Pakistan request online tutoring?",
        answer:
          "Yes. Submit the learner's subject, level and preferred timing. Admissions will confirm current tutor availability and the proposed schedule before enrollment.",
      },
      {
        question: "Which curricula do you support?",
        answer:
          "Curriculum coverage varies by subject and tutor availability. Share your board, syllabus or course details in the application so admissions can confirm the fit before enrollment.",
      },
    ],
    ctaCourseType: "Academic Tutoring",
    ctaSelected: "Online Tutoring in Pakistan",
    keywords: ["online tutor service pakistan", "online tutor pakistan", "home tutor online"],
  },
  {
    slug: "international-online-academy",
    h1: "International Online Academy",
    title: "International Online Academy | TechBuilt Open School",
    description:
      "Live online technical programs and tutoring for learners in Pakistan and abroad, with scheduling and program availability confirmed through admissions.",
    eyebrow: "Learn Online from Anywhere",
    intro:
      "TechBuilt Open School delivers live online technical education and tutoring. Learners outside Pakistan may apply, with timing and availability confirmed before enrollment.",
    bullets: [
      "Live online learning",
      "Applications accepted from Pakistan and abroad",
      "Technical courses and tutoring pathways",
      "Schedule and availability confirmed by admissions",
    ],
    sections: [
      {
        heading: "Online access beyond one location",
        body: "Because classes are delivered online, learners can apply from different countries. Final timing depends on the learner's time zone and the availability of the relevant tutor, instructor or cohort.",
      },
      {
        heading: "Technical and tutoring pathways",
        body: "Learners can explore technical courses, structured specializations, scheduled live cohorts, academic tutoring, and Quran or Islamic Studies tutoring through the public catalog.",
      },
      {
        heading: "Clear enrollment expectations",
        body: "Admissions confirms the selected learning option, class format, schedule and applicable fee before paid continuation. We do not guarantee grades, jobs, earnings or other specific outcomes.",
      },
    ],
    faqs: [
      {
        question: "Can learners outside Pakistan apply?",
        answer:
          "Yes. Online applications are open to learners abroad. Admissions confirms whether a suitable schedule and learning option are currently available.",
      },
      {
        question: "How are international class times arranged?",
        answer:
          "Share your local time zone and preferred timing when applying. Admissions confirms a workable schedule based on tutor, instructor or cohort availability.",
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
      "Live online learning options for school, college, university and adult learners, including technical courses and tutoring subject to current scheduling.",
    eyebrow: "Live Online Learning",
    intro:
      "Explore live online classes with instructor interaction, guided practice and structured learning paths. The exact class format depends on the selected program.",
    bullets: [
      "Live online instruction",
      "One-to-one and small-group formats where available",
      "Technical courses and tutoring options",
      "Program fit and schedule confirmed before enrollment",
    ],
    sections: [
      {
        heading: "Structured live learning",
        body: "Available programs are delivered live online with opportunities to ask questions and work through guided examples. Course and tutoring formats vary by offering.",
      },
      {
        heading: "Choose the right learning path",
        body: "Admissions reviews the learner's level, selected subject or program, and preferred schedule before confirming the most suitable available option.",
      },
      {
        heading: "Options across different learning stages",
        body: "The catalog includes school-level tutoring, university-level support, technical courses and structured specializations. Exact eligibility and coverage are confirmed for each request.",
      },
    ],
    faqs: [
      {
        question: "Are classes live or recorded?",
        answer:
          "The programs advertised on this site are centered on live online instruction. Any recordings or additional resources depend on the specific program and are confirmed separately.",
      },
      {
        question: "What does a learner need to join?",
        answer:
          "A reliable internet connection and a device suitable for the selected class are required. Technical courses may have additional software or computer requirements.",
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
      "Explore online tutoring and technical learning options across school, college and university levels, with exact coverage confirmed through admissions.",
    eyebrow: "Different Stages of Learning",
    intro:
      "The TBOS catalog includes learning options for younger students, college learners, university students and adults. The suitable path depends on the learner's current level and goal.",
    bullets: [
      "School-level tutoring options",
      "College and intermediate support",
      "University-level subject support where available",
      "Technical courses and specializations",
    ],
    sections: [
      {
        heading: "Learning options for different stages",
        body: "Younger learners may use tutoring for subject foundations, while older learners can also explore technical courses and structured specializations. Availability varies by subject and program.",
      },
      {
        heading: "Academic and technical pathways",
        body: "The academy separates academic tutoring from technical courses so learners can choose a pathway that matches their immediate goal.",
      },
      {
        heading: "Fit confirmed before enrollment",
        body: "Admissions reviews the learner's current level, selected subject or program and schedule before confirming availability and the applicable fee.",
      },
    ],
    faqs: [
      {
        question: "Do you offer options for school students?",
        answer:
          "Yes. The tutoring catalog includes options for school learners. Exact subject, grade and tutor availability are confirmed before enrollment.",
      },
      {
        question: "Can university or MS-level learners apply?",
        answer:
          "Yes. Some tutoring and technical learning options are suitable for university-level learners. Submit your requirements so admissions can confirm the current fit.",
      },
    ],
    ctaCourseType: "Academic Tutoring",
    ctaSelected: "Grade 5 to MS Online Learning",
    keywords: ["grade 5 to ms online learning", "online learning all grades"],
  },
  {
    slug: "computer-science-tutoring",
    h1: "Computer Science Tutoring",
    title: "Computer Science Tutoring Online | TechBuilt Open School",
    description:
      "Live online computer science tutoring for school, college and university learners, with syllabus coverage and tutor availability confirmed before enrollment.",
    eyebrow: "Computer Science Support",
    intro:
      "Request computer science tutoring for programming concepts, theory, databases, algorithms or syllabus support. Admissions confirms the available tutor and scope.",
    bullets: [
      "Live online tutoring",
      "Programming and theory support",
      "Syllabus and assignment guidance",
      "Tutor match confirmed before enrollment",
    ],
    sections: [
      {
        heading: "Computer science concepts with guided practice",
        body: "Tutoring can cover theory and practical programming depending on the learner's syllabus, current level and the available tutor's subject coverage.",
      },
      {
        heading: "Support aligned to your syllabus",
        body: "Share the relevant curriculum, assignment topics or exam areas when applying so the proposed tutoring plan can be matched to the actual requirement.",
      },
      {
        heading: "From foundations to advanced topics",
        body: "The public tutoring catalog covers multiple learner levels. Exact advanced-topic coverage is confirmed before the recurring schedule is agreed.",
      },
    ],
    faqs: [
      {
        question: "Can tutoring include both programming and theory?",
        answer:
          "Yes, where the available tutor covers both. Share the required topics in your application so admissions can confirm the scope.",
      },
      {
        question: "Which levels can apply?",
        answer:
          "School, college and university learners may apply. The suitable tutoring level is confirmed from the learner's current syllabus and goals.",
      },
    ],
    ctaCourseType: "Academic Tutoring",
    ctaSelected: "Computer Science",
    keywords: ["computer science tutoring", "cs tutor online", "computer science tutor"],
  },
  {
    slug: "maths-tutor",
    h1: "Maths Tutor Online",
    title: "Maths Tutor Online | TechBuilt Open School",
    description:
      "Live online mathematics tutoring with one-to-one and small-group options subject to tutor availability, syllabus fit and scheduling.",
    eyebrow: "Mathematics Tutoring",
    intro:
      "Request structured mathematics support based on the learner's current syllabus, level and goals. Admissions confirms tutor availability and scheduling before enrollment.",
    bullets: [
      "One-to-one tutoring available",
      "Topic and syllabus-based support",
      "Exam-preparation practice where requested",
      "Schedule and fee confirmed before enrollment",
    ],
    sections: [
      {
        heading: "Build understanding step by step",
        body: "Tutoring focuses on the learner's current topics and areas of difficulty, using guided explanation and practice appropriate to the confirmed level.",
      },
      {
        heading: "Practice for the learner's actual goals",
        body: "Share the relevant board, syllabus, exam or assignment requirements so tutoring can be planned around the learner's real priorities.",
      },
      {
        heading: "Coverage confirmed before classes begin",
        body: "Mathematics spans many levels and topics. Admissions confirms whether the requested coverage and recurring schedule can be supported before paid continuation.",
      },
    ],
    faqs: [
      {
        question: "Can I request maths exam preparation?",
        answer:
          "Yes. Include the exam, board or syllabus in your request. Admissions will confirm whether a suitable tutor and schedule are available.",
      },
      {
        question: "Do you offer one-to-one maths tutoring?",
        answer:
          "One-to-one tutoring is an available format, subject to tutor scheduling and confirmation by admissions.",
      },
    ],
    ctaCourseType: "Academic Tutoring",
    ctaSelected: "Mathematics",
    keywords: ["maths tutor online", "math tutor", "online maths tuition"],
  },
  {
    slug: "physics-tutor",
    h1: "Physics Tutor Online",
    title: "Physics Tutor Online | TechBuilt Open School",
    description:
      "Live online physics tutoring for concept review, numerical practice and syllabus support, subject to tutor availability and scheduling.",
    eyebrow: "Physics Tutoring",
    intro:
      "Request physics tutoring for concept review, numerical practice and syllabus-based support. The proposed scope is confirmed before enrollment.",
    bullets: [
      "Concept-focused explanations",
      "Numerical and problem-solving practice",
      "Syllabus and exam support where requested",
      "Tutor availability confirmed before enrollment",
    ],
    sections: [
      {
        heading: "Understand concepts before applying formulas",
        body: "Tutoring can combine explanation, worked examples and numerical practice based on the learner's current syllabus and starting level.",
      },
      {
        heading: "Structured numerical practice",
        body: "Where relevant to the learner's goals, sessions can include guided problem solving and exam-style practice matched to the confirmed subject coverage.",
      },
      {
        heading: "Support matched to the learner's syllabus",
        body: "Share the required topics, board or course outline when applying. Admissions confirms whether the requested level and schedule are currently supported.",
      },
    ],
    faqs: [
      {
        question: "Can tutoring include physics numericals?",
        answer:
          "Yes, where numerical problem solving is part of the confirmed tutoring scope.",
      },
      {
        question: "Which physics levels can apply?",
        answer:
          "Learners at different school, college and university levels may apply. Exact coverage depends on the requested topics and tutor availability.",
      },
    ],
    ctaCourseType: "Academic Tutoring",
    ctaSelected: "Physics",
    keywords: ["physics tutor online", "physics tuition", "online physics tutor"],
  },
  {
    slug: "python-course-online",
    h1: "Python Course Online",
    title: "Python Course Online | TechBuilt Open School",
    description:
      "Learn Python through live online instruction, structured practice and project work, with the available course format and schedule confirmed before enrollment.",
    eyebrow: "Python Learning Path",
    intro:
      "Build Python foundations through live instruction, guided exercises and practical project work. Choose a catalog course or active live cohort based on your learning goal.",
    bullets: [
      "Live online instruction",
      "Beginner-friendly foundations available",
      "Practical exercises and project work",
      "One-to-one or scheduled cohort options",
    ],
    sections: [
      {
        heading: "Start with clear Python foundations",
        body: "Python learning options cover core syntax, problem solving and practical programming. The exact syllabus depends on the selected catalog course or live cohort.",
      },
      {
        heading: "Practice by building",
        body: "Project work is included where specified in the selected curriculum so learners can apply concepts beyond isolated examples.",
      },
      {
        heading: "Continue into related technical paths",
        body: "Python can lead into web development, automation, data analysis and AI foundations. TBOS lists these as separate courses or specializations so learners can continue through a structured path.",
      },
    ],
    faqs: [
      {
        question: "Can beginners apply for Python learning?",
        answer:
          "Yes. Beginner-friendly Python options are available in the catalog. Admissions can help identify the appropriate starting point.",
      },
      {
        question: "Will the course include projects?",
        answer:
          "Project work depends on the selected Python course or live program. Review the published curriculum or ask admissions to confirm the project scope.",
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
      "Learn web development through live online instruction and practical project work across HTML, CSS, JavaScript and related tools.",
    eyebrow: "Web Development Learning",
    intro:
      "Explore a structured web development path with live instruction, guided practice and practical projects. The exact stack depends on the selected course or specialization.",
    bullets: [
      "HTML, CSS and JavaScript foundations",
      "Responsive web development practice",
      "Live online instruction",
      "Project work defined by the selected curriculum",
    ],
    sections: [
      {
        heading: "Progress from foundations to complete interfaces",
        body: "Web development options begin with core browser technologies and can continue into frontend, backend or full-stack learning through the relevant courses and specializations.",
      },
      {
        heading: "Use projects to apply the concepts",
        body: "Practical assignments and project work are included where listed in the selected curriculum, helping learners connect technical concepts to implementation.",
      },
      {
        heading: "Choose the path that matches your goal",
        body: "Learners can start with a single technology course or follow a broader specialization. Admissions can clarify the available format, schedule and fee before enrollment.",
      },
    ],
    faqs: [
      {
        question: "Are beginner web development options available?",
        answer:
          "Yes. The catalog includes foundational web development courses. Review the prerequisites on the selected course page before applying.",
      },
      {
        question: "Will I build projects?",
        answer:
          "Project work depends on the selected course or specialization and is described in its published curriculum.",
      },
    ],
    ctaCourseType: "Single Course",
    ctaSelected: "Web Development",
    keywords: ["web development course online", "learn web development", "web design course"],
  },
];

export const getSeoPage = (slug: string) => seoPages.find((p) => p.slug === slug);
