import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, Eye, Heart, CheckCircle2 } from "lucide-react";
import studentsLearning from "@/assets/students-learning.jpg";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { CtaSection } from "@/components/sections/CtaSection";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: buildMeta({
      title: "About Us | TechBuilt Open School International Online Academy",
      description:
        "Learn how TechBuilt Open School structures live online technical education, tutoring, admissions, trial sessions, and learner support for students in Pakistan and abroad.",
      keywords: ["about online academy", "international online school", "online tutoring company"],
    }),
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Target,
    title: "Our mission",
    desc: "To make structured, live online education easier to access for learners who need technical training or guided tutoring.",
  },
  {
    icon: Eye,
    title: "Our vision",
    desc: "To grow into a trusted online academy known for clear learning pathways, responsible communication and practical teaching.",
  },
  {
    icon: Heart,
    title: "Our values",
    desc: "Clear expectations, respectful teaching, responsible claims and learner-focused support guide how we build the academy.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About TechBuilt"
        title="A premium academy without borders"
        description="We deliver live online technical education and tutoring with clear admissions, one-session trial demos, and learning pathways designed around the learner's level and goals."
        breadcrumb={[{ label: "About" }]}
      />

      <StatsStrip />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={studentsLearning}
                alt="Diverse group of students learning together online"
                width={1200}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
              Our story
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Built around clear, practical learning
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              TechBuilt Open School was created to make structured live online learning easier to
              access for students who want technical skills, academic support, or guided tutoring
              without being limited by location.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We are building a growing online academy with live technical programs, one-to-one
              tutoring, small-group options, and a public course catalog. Admissions confirms the
              learner's program fit, schedule, tutor availability, and applicable fee before paid
              classes begin.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Technical courses, specializations and live cohorts",
                "Academic, Quran and Islamic Studies tutoring options",
                "Clear admissions, fee and scheduling confirmation before enrollment",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8">
              <Link to="/apply">
                Join the academy <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <CtaSection />
    </>
  );
}
