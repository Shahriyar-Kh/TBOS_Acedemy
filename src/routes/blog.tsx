import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, GraduationCap, Lightbulb, Map, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/sections/CtaSection";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: buildMeta({
      title: "Resources & Learning Guides | TechBuilt Open School",
      description:
        "Free learning guides and resources on coding, study skills, exam preparation and choosing the right online course or tutor. Helping students learn smarter.",
      keywords: ["learning resources", "study guides", "how to learn coding", "exam preparation tips"],
    }),
    links: [{ rel: "canonical", href: "/blog" }],
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
    title: "How to start learning to code in 2026",
    excerpt:
      "A beginner's roadmap covering which language to learn first, how to practise, and how to stay motivated on your coding journey.",
    to: "/python-course-online",
  },
  {
    icon: Map,
    tag: "Career",
    title: "Web developer roadmap: from beginner to job-ready",
    excerpt:
      "The exact skills, projects and milestones that take you from your first webpage to a professional web development career.",
    to: "/web-development-course-online",
  },
  {
    icon: Target,
    tag: "Study skills",
    title: "Smart exam preparation strategies that actually work",
    excerpt:
      "Proven, science-backed study techniques to revise effectively, manage time and walk into exams with confidence.",
    to: "/maths-tutor",
  },
  {
    icon: GraduationCap,
    tag: "Parents",
    title: "Choosing the right online tutor for your child",
    excerpt:
      "What to look for in an online tutor, the questions to ask, and how to set your child up for success in online classes.",
    to: "/online-tutor-service-pakistan",
  },
  {
    icon: Lightbulb,
    tag: "Maths",
    title: "Making maths simple: building real understanding",
    excerpt:
      "Why so many students fear maths — and the step-by-step approach our tutors use to turn confusion into confidence.",
    to: "/maths-tutor",
  },
  {
    icon: BookOpen,
    tag: "Physics",
    title: "Understanding physics instead of memorising it",
    excerpt:
      "How connecting physics to the real world helps students master concepts and solve numericals with ease.",
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
                  Read & explore
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
