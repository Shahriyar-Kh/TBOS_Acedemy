export type ParentDecisionPoint = {
  number: string;
  title: string;
  description: string;
  confirm: string;
};

export const parentDecisionPoints: ParentDecisionPoint[] = [
  {
    number: "01",
    title: "The learner's goal and starting level",
    description:
      "A suitable path begins with what the learner already knows, what they want to build and how much weekly study time they can sustain.",
    confirm:
      "Share the learner's age or study level, current skills, goal and weekly availability.",
  },
  {
    number: "02",
    title: "The published learning roadmap",
    description:
      "Review the real chapters, core topics, guided tasks and projects instead of choosing from a course title alone.",
    confirm:
      "Check prerequisites, chapter sequence, projects and the final capstone before applying.",
  },
  {
    number: "03",
    title: "The live-class format",
    description:
      "Single courses, specializations, announced batches and one-to-one tutoring have different structures and purposes.",
    confirm:
      "Confirm whether the selected option is group or one-to-one and how live participation works.",
  },
  {
    number: "04",
    title: "The exact schedule and frequency",
    description:
      "Published roadmaps describe the academic path, while the start date, class time and current availability require separate confirmation.",
    confirm:
      "Ask admissions to confirm the time zone, weekly frequency, start date and expected duration.",
  },
  {
    number: "05",
    title: "Practice and project expectations",
    description:
      "Live explanations work best when the learner also completes guided tasks and develops projects between classes.",
    confirm:
      "Plan realistic practice time and make sure the required device and software are available.",
  },
  {
    number: "06",
    title: "Fee, recordings and included support",
    description:
      "These operational details can differ by program and current delivery arrangement, so they should be agreed before paid classes begin.",
    confirm:
      "Review the applicable fee, recording availability, included support and contact channel in writing.",
  },
];

export const familySupportSteps = [
  {
    title: "Protect a consistent study window",
    description:
      "Help the learner reserve time for live attendance, independent practice and unfinished project work.",
  },
  {
    title: "Ask for an explanation, not only a score",
    description:
      "A learner who can describe the idea, choices and mistakes behind their work is building stronger understanding.",
  },
  {
    title: "Review visible work",
    description:
      "Use completed chapter tasks, code files and projects to discuss progress instead of relying on attendance alone.",
  },
  {
    title: "Raise concerns through the agreed channel",
    description:
      "Share scheduling, participation or learning concerns early through the contact method confirmed for the program.",
  },
];

export const minorLearnerReadiness = [
  "Provide accurate guardian contact details when the learner is under 18.",
  "Keep class links, recordings and other learners' information private.",
  "Prepare a suitable device, stable internet, microphone and a focused learning space.",
  "Agree on a realistic weekly routine for attendance, practice and project work.",
];

export const parentTransparencyNotes = [
  "Submitting an application starts an admissions review; it does not create automatic enrolment.",
  "Instructor or cohort availability, schedule and start date are confirmed separately.",
  "Recording access depends on the selected program and must be confirmed before classes begin.",
  "Published roadmaps explain the learning scope; they do not guarantee grades, jobs or other outcomes.",
];

export const parentQuestions = [
  {
    question: "How do I know which course or program fits the learner?",
    answer:
      "Compare the published roadmap with the learner's current level, goal and available study time. Include those details in the demo request or application so admissions can review the fit.",
  },
  {
    question: "Does an application confirm a seat or class time?",
    answer:
      "No. An application is reviewed first. Availability, schedule, delivery format, applicable fee and the next step are confirmed separately.",
  },
  {
    question: "Are class recordings always included?",
    answer:
      "Recording availability depends on the selected course, specialization, tutoring arrangement or live batch. Confirm it as part of the learning plan before paid classes begin.",
  },
  {
    question: "What should I use to review progress?",
    answer:
      "Look at completed guided tasks, the learner's ability to explain concepts, improvements after feedback and progress on mini projects or the capstone.",
  },
  {
    question: "Can learning outcomes be guaranteed?",
    answer:
      "No. Progress depends on attendance, practice, prior knowledge, project effort and how the learner responds to feedback. The academy publishes the learning scope without promising a particular grade, job or result.",
  },
];
