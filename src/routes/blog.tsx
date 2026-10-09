import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, GraduationCap, Lightbulb, Map, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/sections/CtaSection";
import { buildMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: buildMeta({
      title: "Resources & Learning Guides | TechBuilt Open School",
      description:
        "Free learning guides and resources on coding, study skills, exam preparation and choosing the right online course or tutor. Helping students learn smarter.",
      path: "/blog",
      keywords: ["learning resources", "study guides", "how to learn coding", "exam preparation tips"],
    }),
    links: [canonicalLink("/blog")],
  }),
  component: BlogPage,
});

type Resource = {
  icon: typeof BookOpen;
  tag: string;
  title: string;
  excerpt: string;
  to: string;
};

const resources: Resource[] = [
  {
    icon: Code2,
    tag: "Coding",
    title: "Explore a beginner Python learning path",
    excerpt:
      "Review the Python learning option, published curriculum direction, and next steps for beginners.",
    to: "/python-course-online",
  },
  {
    icon: Map,
    tag: "Career",
    title: "Explore the web development learning path",
    excerpt:
      "See how web fundamentals, responsive development and project work connect across the available learning options.",
    to: "/web-development-course-online",
  },
  {
    icon: Target,
    tag: "Study skills",
    title: "Mathematics tutoring for syllabus and exam support",
    excerpt:
      "Review the mathematics tutoring pathway and how syllabus or exam requirements can be shared with admissions.",
    to: "/maths-tutor",
  },
  {
    icon: GraduationCap,
    tag: "Parents",
    title: "How the online tutoring request process works",
    excerpt:
      "Understand tutor matching, scheduling, class formats, and what admissions confirms before paid continuation.",
    to: "/online-tutor-service-pakistan",
  },
  {
    icon: Lightbulb,
    tag: "Maths",
    title: "Mathematics topic support by learner level",
    excerpt:
      "Explore how learners can request topic-based mathematics support matched to their syllabus and current level.",
    to: "/maths-tutor",
  },
  {
    icon: BookOpen,
    tag: "Physics",
    title: "Physics concepts and numerical practice",
    excerpt:
      "Review the physics tutoring option for concept explanation, numerical practice, and syllabus-based support.",
    to: "/physics-tutor",
  },
];

function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Learning guides & resources"
        description="Free, practical guides to help students learn smarter — covering coding, study skills, exam prep and choosing the right course or tutor."
        breadcrumb={[{ label: "Resources" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <Reveal key={r.title} delay={i * 70}>
              <Link
                to={r.to}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                  <r.icon className="h-6 w-6" />
                </span>
                <span className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  {r.tag}
                </span>
                <h2 className="mt-2 text-lg font-bold text-foreground">{r.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-gold-foreground">
                  Explore related page
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
