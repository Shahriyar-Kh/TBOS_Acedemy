import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FolderCheck,
  HeartHandshake,
  MessageCircleQuestion,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  familySupportSteps,
  minorLearnerReadiness,
  parentDecisionPoints,
  parentQuestions,
  parentTransparencyNotes,
} from "@/data/parentGuide";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/for-parents")({
  head: () => ({
    meta: buildMeta({
      title: "Parent Guide to Live Online Learning | TechBuilt Open School",
      description:
        "A clear guide for parents and guardians comparing TechBuilt Open School roadmaps, live-class formats, schedules, practice, projects, recordings and admissions confirmation.",
      keywords: [
        "online learning guide for parents",
        "live coding classes for children",
        "parent guide online academy",
      ],
      path: "/for-parents",
    }),
    links: [{ rel: "canonical", href: `${site.url}/for-parents` }],
  }),
  component: ForParentsPage,
});

const decisionIcons = [
  UserRoundCheck,
  BookOpenCheck,
  HeartHandshake,
  CalendarCheck2,
  FolderCheck,
  ClipboardCheck,
];

function ForParentsPage() {
  return (
    <div data-phase14-parent-guide>
      <PageHeader
        eyebrow="Parent & guardian guide"
        title="See the learning plan before you commit"
        description="Compare the roadmap, format, schedule, practice expectations and projects with confidence. The published curriculum explains what is taught; admissions confirms the current delivery details separately."
        breadcrumb={[{ label: "For parents" }]}
      />

      <section
        aria-labelledby="parent-decisions-heading"
        className="mx-auto max-w-7xl container-px py-16 sm:py-24"
      >
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
            Before enrolment
          </span>
          <h2
            id="parent-decisions-heading"
            className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl"
          >
            Six decisions to make with the learner
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            These checks turn a broad course interest into a learning plan that is specific enough
            for the family, learner and admissions team to review.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {parentDecisionPoints.map((point, index) => {
            const DecisionIcon = decisionIcons[index];
            return (
              <Reveal key={point.number} delay={(index % 3) * 70} className="h-full">
                <article
                  data-parent-decision={point.number}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-cyan/45 hover:shadow-card"
                >
                  <span className="absolute right-6 top-5 font-display text-3xl font-extrabold text-accent transition-colors group-hover:text-cyan/35">
                    {point.number}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                    <DecisionIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 pr-8 text-xl font-extrabold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                  <div className="mt-5 rounded-2xl bg-accent/75 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-primary">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> Confirm this
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {point.confirm}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="family-support-heading"
        className="relative overflow-hidden bg-gradient-hero"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-tech-grid opacity-40"
        />
        <div className="relative mx-auto max-w-7xl container-px py-16 sm:py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Support without taking over
            </span>
            <h2
              id="family-support-heading"
              className="mt-3 text-3xl font-extrabold text-primary-foreground sm:text-4xl"
            >
              Help progress become visible between classes
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              The most useful family support protects consistency and encourages the learner to
              explain, practise and improve their own work.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-6 lg:grid-cols-4">
            {familySupportSteps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 80} className="h-full">
                <article data-parent-support className="glass relative h-full rounded-3xl p-6">
                  <span className="absolute right-5 top-4 font-display text-3xl font-extrabold text-primary-foreground/15">
                    0{index + 1}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/10 text-cyan">
                    <HeartHandshake className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-primary-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                    {step.description}
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
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
            Readiness for learners under 18
          </h2>
          <ul className="mt-6 space-y-4">
            {minorLearnerReadiness.map((item) => (
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
            <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
            What the website does—and does not confirm
          </h2>
          <ul className="mt-6 space-y-4">
            {parentTransparencyNotes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section aria-labelledby="parent-faq-heading" className="bg-gradient-soft">
        <div className="mx-auto max-w-4xl container-px py-16 sm:py-24">
          <Reveal className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
              Parent questions
            </span>
            <h2
              id="parent-faq-heading"
              className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              Clear answers before the next step
            </h2>
          </Reveal>
          <div className="mt-10 space-y-4">
            {parentQuestions.map((item, index) => (
              <Reveal key={item.question} delay={(index % 3) * 60}>
                <details
                  data-parent-question
                  className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-soft open:border-cyan/35"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-foreground">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-4 border-t border-border pt-4 leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-24">
        <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-hero px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-tech-grid opacity-35"
          />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
              <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden="true" /> Ask before you
              commit
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              Compare the roadmap, then evaluate the teaching
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              Review the full admissions journey and request a demo with the learner's current
              level, goal and preferred schedule.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl" className="group">
                <Link to="/free-demo">
                  Request a free demo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="xl">
                <Link to="/how-it-works">See how admissions works</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
