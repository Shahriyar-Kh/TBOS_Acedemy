import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { enrollmentStages } from "@/data/studentJourney";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: buildMeta({
      title: "How Online Learning Works | TechBuilt Open School",
      description:
        "Follow TechBuilt Open School's clear path from choosing a course and requesting a demo to admissions review, confirmed class details, live learning and project feedback.",
      keywords: [
        "how online classes work",
        "online course admissions process",
        "live online learning process",
      ],
      path: "/how-it-works",
    }),
    links: [{ rel: "canonical", href: `${site.url}/how-it-works` }],
  }),
  component: HowItWorksPage,
});

const decisionChecks = [
  {
    icon: BookOpenCheck,
    title: "Roadmap before registration",
    description:
      "Review chapters, core topics, guided work and projects before you submit an application.",
  },
  {
    icon: UserRoundCheck,
    title: "Fit checked by admissions",
    description:
      "Your submitted goal and current level are reviewed before a program is confirmed.",
  },
  {
    icon: CalendarCheck2,
    title: "Schedule confirmed separately",
    description:
      "A website application does not reserve a seat or class time; availability is confirmed with you.",
  },
  {
    icon: ShieldCheck,
    title: "Details before paid classes",
    description:
      "Program, frequency, schedule, applicable fee and inclusions are clarified before paid learning starts.",
  },
];

function HowItWorksPage() {
  return (
    <div data-phase14-journey>
      <PageHeader
        eyebrow="A clear start-to-learning path"
        title="How learning with TechBuilt works"
        description="Nine transparent stages take you from comparing roadmaps to live classes, projects and a practical next-step review. Applying starts a review; it does not create an automatic enrolment."
        breadcrumb={[{ label: "How it works" }]}
      />

      <section aria-labelledby="decision-heading" className="relative bg-gradient-soft">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
              Before you commit
            </span>
            <h2
              id="decision-heading"
              className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              Make the decision with the important details visible
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Published roadmaps help you compare the learning itself. Admissions then confirms the
              operational details that depend on current availability.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {decisionChecks.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className="h-full">
                <article className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="journey-heading"
        className="mx-auto max-w-6xl container-px py-16 sm:py-24"
      >
        <Reveal className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
            The complete journey
          </span>
          <h2
            id="journey-heading"
            className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl"
          >
            From first comparison to a clear next step
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Each stage has a learner action and an academy responsibility, so you know what happens
            next and what still needs confirmation.
          </p>
        </Reveal>

        <ol className="relative mt-12 space-y-6 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-gradient-to-b before:from-cyan before:via-primary/25 before:to-gold sm:before:left-8">
          {enrollmentStages.map((stage, index) => (
            <Reveal
              as="li"
              key={stage.number}
              delay={(index % 4) * 60}
              className="relative pl-16 sm:pl-24"
            >
              <span className="absolute left-0 top-6 z-10 grid h-12 w-12 place-items-center rounded-2xl border-4 border-background bg-gradient-hero font-display text-sm font-extrabold text-primary-foreground shadow-soft sm:h-16 sm:w-16 sm:text-base">
                {stage.number}
              </span>
              <article
                data-enrollment-stage={stage.number}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-cyan/45 hover:shadow-card"
              >
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-extrabold text-foreground sm:text-2xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
                    {stage.description}
                  </p>
                  <div className="mt-6 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-accent/75 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-primary">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Your part
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {stage.learnerAction}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cyan/20 bg-cyan/5 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-primary">
                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Our part
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {stage.academyAction}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="choose-heading"
        className="bg-gradient-hero text-primary-foreground"
      >
        <div className="mx-auto grid max-w-7xl gap-10 container-px py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Your next move
            </span>
            <h2 id="choose-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Not sure which path fits yet?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              Start by comparing the student formats. If you already have a shortlist, request a
              demo and tell us exactly what you want to evaluate.
            </p>
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild variant="hero" size="xl" className="group w-full">
              <Link to="/for-students">
                View the student guide
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="xl" className="w-full">
              <Link to="/free-demo">
                <MessageCircleQuestion className="h-5 w-5" /> Request a free demo
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
