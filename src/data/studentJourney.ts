export type EnrollmentStage = {
  number: string;
  title: string;
  description: string;
  learnerAction: string;
  academyAction: string;
};

export const enrollmentStages: EnrollmentStage[] = [
  {
    number: "01",
    title: "Explore the learning paths",
    description:
      "Compare single courses, multi-course specializations, announced live batches and one-to-one tutoring before choosing a direction.",
    learnerAction: "Review the roadmap, prerequisites, projects and delivery format.",
    academyAction: "Keep every published option clear about its current availability.",
  },
  {
    number: "02",
    title: "Shortlist the right level",
    description:
      "Choose a starting point that matches your current knowledge, learning goal and weekly study time.",
    learnerAction: "Note your experience, goal and any schedule constraints.",
    academyAction: "Clarify the level and suggest a more suitable path when needed.",
  },
  {
    number: "03",
    title: "Request a free demo",
    description:
      "Use the trial request to evaluate teaching style, ask syllabus questions and discuss whether the format fits you.",
    learnerAction: "Share the topic you want covered and your preferred time zone.",
    academyAction: "Review the request and confirm an available trial slot separately.",
  },
  {
    number: "04",
    title: "Submit your application",
    description:
      "Tell admissions what you want to learn, your current level and whether you prefer a group or one-to-one format.",
    learnerAction: "Provide accurate contact, learning and scheduling information.",
    academyAction: "Treat the form as a request for review, not automatic enrolment.",
  },
  {
    number: "05",
    title: "Complete the admissions review",
    description:
      "Admissions checks program fit, schedule compatibility and current instructor or cohort availability.",
    learnerAction: "Answer any follow-up questions about prerequisites or timing.",
    academyAction: "Explain available options and any important limitations before commitment.",
  },
  {
    number: "06",
    title: "Confirm the learning plan",
    description:
      "The selected program, class frequency, schedule, applicable fee and included support are confirmed before paid classes begin.",
    learnerAction: "Review the confirmed details and ask questions before accepting.",
    academyAction: "Provide the agreed details without relying on unconfirmed website assumptions.",
  },
  {
    number: "07",
    title: "Prepare for your first class",
    description:
      "Set up the required device, internet connection and course tools using the joining instructions you receive.",
    learnerAction: "Test the meeting link and install any required software in advance.",
    academyAction: "Share class access and setup guidance through the confirmed contact channel.",
  },
  {
    number: "08",
    title: "Learn, practise and build",
    description:
      "Attend live classes, complete guided chapter tasks and combine your skills in course or specialization projects.",
    learnerAction: "Practise between sessions and bring questions to the instructor.",
    academyAction:
      "Teach the published roadmap and provide feedback during the agreed delivery period.",
  },
  {
    number: "09",
    title: "Review progress and next steps",
    description:
      "Use completed tasks and projects to identify strengths, gaps and the most useful next course or specialization stage.",
    learnerAction: "Keep your work organised and act on instructor feedback.",
    academyAction: "Discuss progress and next-step options without guaranteeing outcomes.",
  },
];

export const learningFormats = [
  {
    title: "Single courses",
    description:
      "Focused 30–60 day roadmaps, normally planned around 3–4 live classes per week, with core chapters, guided tasks and a capstone project.",
    href: "/courses" as const,
    action: "Browse single courses",
  },
  {
    title: "Specializations",
    description:
      "Multi-course professional pathways delivered through four live online classes per week, recorded sessions for review and multiple projects.",
    href: "/specializations" as const,
    action: "Compare specializations",
  },
  {
    title: "Announced live batches",
    description:
      "Time-bound cohorts with a published roadmap, schedule, instructor-led sessions and program-specific projects.",
    href: "/live-batches" as const,
    action: "See live batches",
  },
  {
    title: "One-to-one tutoring",
    description:
      "A personalised plan based on your subject, level, goals, instructor availability and agreed schedule.",
    href: "/tutoring" as const,
    action: "Explore tutoring",
  },
];

export const studentReadiness = [
  "A laptop or desktop suitable for the tools used in your selected program",
  "A stable internet connection, working microphone and a quiet place to participate",
  "Time outside class for practice, guided tasks and project work",
  "Your current level, learning goal and weekly availability written down clearly",
];

export const studentCommitments = [
  "Join live sessions on time and notify the academy when an absence is unavoidable.",
  "Attempt each guided task yourself before asking for the complete solution.",
  "Keep project files organised so feedback can be applied and progress can be reviewed.",
  "Use respectful communication and protect class links, recordings and other learners' privacy.",
];
