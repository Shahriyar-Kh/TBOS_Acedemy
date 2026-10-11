import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderGit2,
  Laptop,
  ListChecks,
  MessageCircleQuestion,
  MonitorCheck,
  Route as RouteIcon,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { learningFormats, studentCommitments, studentReadiness } from "@/data/studentJourney";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/for-students")({
  head: () => ({
    meta: buildMeta({
      title: "Student Guide to Live Online Learning | TechBuilt Open School",
      description:
        "Compare TechBuilt Open School courses, specializations, live batches and tutoring; understand class expectations, study readiness, guided tasks and project-based learning.",
      keywords: [
        "online learning guide for students",
        "live coding classes student guide",
        "online course study requirements",
      ],
      path: "/for-students",
    }),
    links: [{ rel: "canonical", href: `${site.url}/for-students` }],
  }),
  component: ForStudentsPage,
});

const formatIcons = [Clock3, RouteIcon, Users, MonitorCheck];

const learningLoop = [
  {
    icon: Laptop,
    title: "Attend the live explanation",
    description:
      "Follow the chapter objective, ask questions and work through examples with the instructor.",
  },
  {
    icon: ListChecks,
    title: "Complete the guided task",
    description:
      "Practise the same skill independently using the chapter task and its completion steps.",
  },
  {
    icon: FolderGit2,
    title: "Connect skills in a project",
    description:
      "Use multiple chapters together in mini projects and the course or pathway capstone.",
  },
  {
    icon: CheckCircle2,
    title: "Apply feedback and improve",
    description:
      "Review mistakes, refine the work and carry the stronger foundation into the next chapter.",
  },
];

function ForStudentsPage() {
  return (
    <div data-phase14-student-guide>
      <PageHeader
        eyebrow="Student guide"
        title="Choose a learning format you can sustain"
        description="Understand the roadmap, live-class rhythm, practice expectations and project work before you apply. The right path should fit both your goal and the time you can give it each week."
        breadcrumb={[{ label: "For students" }]}
      />

      <section
        aria-labelledby="formats-heading"
        className="mx-auto max-w-7xl container-px py-16 sm:py-24"
      >
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
            Compare the formats
          </span>
          <h2
            id="formats-heading"
            className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl"
          >
            Four ways to learn, each with a different purpose
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Published roadmaps explain the academic path. Your exact start date, schedule and any
            applicable fee are confirmed separately before paid classes begin.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {learningFormats.map((format, index) => {
            const FormatIcon = formatIcons[index];
            return (
              <Reveal key={format.title} delay={index * 70} className="h-full">
                <article
                  data-learning-format
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-cyan/45 hover:shadow-card"
                >
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                    <FormatIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-2xl font-extrabold text-foreground">{format.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
                    {format.description}
                  </p>
                  <Link
                    to={format.href}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-cyan-foreground"
                  >
                    {format.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="learning-loop-heading"
        className="relative overflow-hidden bg-gradient-hero"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-tech-grid opacity-40"
        />
        <div className="relative mx-auto max-w-7xl container-px py-16 sm:py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              The learning loop
            </span>
            <h2
              id="learning-loop-heading"
              className="mt-3 text-3xl font-extrabold text-primary-foreground sm:text-4xl"
            >
              Learn it, practise it, build it, improve it
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              Course chapters are designed to lead into guided work and then into larger projects,
              so progress is visible in what you can produce and explain.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-6 lg:grid-cols-4">
            {learningLoop.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 80} className="h-full">
                <article className="glass relative h-full rounded-3xl p-6">
                  <span className="absolute right-5 top-4 font-display text-3xl font-extrabold text-primary-foreground/15">
                    0{index + 1}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/10 text-cyan">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-primary-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 container-px py-16 sm:py-24 lg:grid-cols-2">
        <Reveal className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
            <MonitorCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
            Be ready before class starts
          </h2>
          <ul className="mt-6 space-y-4">
            {studentReadiness.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={100}
          className="rounded-3xl border border-border bg-gradient-soft p-7 shadow-soft sm:p-9"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold text-gold-foreground">
            <ListChecks className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
            What good participation looks like
          </h2>
          <ul className="mt-6 space-y-4">
            {studentCommitments.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl container-px pb-16 sm:pb-24">
        <Reveal className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-soft px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Ready to compare your next step?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Review the full admissions journey, then request a demo with the course or subject you
              want to evaluate.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="group">
                <Link to="/how-it-works">
                  See how it works
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/free-demo">
                  <MessageCircleQuestion className="h-5 w-5" /> Request a free demo
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
