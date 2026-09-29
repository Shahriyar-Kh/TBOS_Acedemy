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
        "Learn about TechBuilt Open School — a premium international online academy delivering live tutoring and technical courses to students from Grade 5 to MS worldwide.",
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
    desc: "To make premium, personalised education accessible to every ambitious student — wherever they are in the world.",
  },
  {
    icon: Eye,
    title: "Our vision",
    desc: "To be the most trusted international online academy, known for results, integrity and genuine care for every learner.",
  },
  {
    icon: Heart,
    title: "Our values",
    desc: "Excellence, honesty, respect and dedication guide everything we do — for students and parents alike.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About TechBuilt"
        title="A premium academy without borders"
        description="We bring world-class tutoring and modern technical education to students from Grade 5 to MS — across Pakistan and around the globe."
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
              Built by educators who care
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              TechBuilt Open School was founded on a simple belief: every student deserves access
              to outstanding teaching, regardless of where they live. We saw talented learners held
              back by distance, cost or crowded classrooms — and set out to change that.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Today we support learners across Pakistan and worldwide with live,
              one-to-one and small-group classes. From core academic tutoring to in-demand technical
              skills, our instructors deliver a premium, personalised experience that builds both
              conceptual depth and confidence.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Curriculum-aligned academic tutoring",
                "Career-focused technical specializations",
                "Transparent progress reports for parents",
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
