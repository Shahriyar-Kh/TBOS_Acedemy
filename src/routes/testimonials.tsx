import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CircleDollarSign, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { Button } from "@/components/ui/button";
import { buildMeta } from "@/lib/seo";
import { site } from "@/data/site";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: buildMeta({
      title: "Academy Standards & Quality Commitments | TechBuilt Open School",
      description:
        "Review TechBuilt Open School's standards for live instruction, transparent admissions, Free Demo scope, tutor matching, fees, and responsible learning claims.",
      keywords: [
        "academy standards",
        "learning methodology",
        "online tutoring quality",
        "learning commitments",
      ],
      path: "/testimonials",
    }),
    links: [{ rel: "canonical", href: `${site.url}/testimonials` }],
  }),
  component: TestimonialsPage,
});

const trustPrinciples = [
  {
    icon: BadgeCheck,
    title: "What we commit to",
    desc: "Clear program information, live instructor-led delivery where scheduled, respectful communication, and admissions guidance based on the learner's stated needs.",
  },
  {
    icon: CircleDollarSign,
    title: "What is confirmed before payment",
    desc: "Applicable fee, recurring schedule, program or tutoring format, and tutor or cohort availability are confirmed through admissions before paid continuation.",
  },
  {
    icon: ShieldCheck,
    title: "What we do not promise",
    desc: "We do not guarantee grades, jobs, earnings, admissions outcomes, or instant enrollment. Learning results depend on attendance, practice, prior level, and individual effort.",
  },
];

function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Standards"
        title="Academy Standards & Commitments"
        description="The practical standards we use for live teaching, admissions, trial sessions, learner communication, and responsible claims."
        breadcrumb={[{ label: "Standards & Commitments" }]}
      />

      <StatsStrip />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {trustPrinciples.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 80}
              className="rounded-3xl border border-border/80 bg-card p-7 shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
                <item.icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 rounded-3xl border border-primary/15 bg-accent/40 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Before you enroll
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                Use the trial and admissions process to check fit
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                The Free Demo is one trial session only. It can help you assess the teaching approach
                and discuss the learner&apos;s level before deciding on paid continuation.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/free-demo">Request Free Demo</Link>
              </Button>
              <Button asChild>
                <Link to="/contact">
                  Ask admissions <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
