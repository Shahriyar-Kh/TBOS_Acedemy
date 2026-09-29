import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, UserRound, Users, Globe2 } from "lucide-react";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/CourseCard";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { academicCourses } from "@/data/courses";
import { faqs } from "@/data/faqs";
import { buildMeta, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/tutoring/")({
  head: () => ({
    meta: buildMeta({
      title: "Online Tutoring Service | One-to-One Live Tutors | TechBuilt Open School",
      description:
        "Premium online tutoring for Grade 5 to MS. Live one-to-one and group classes in maths, physics, computer science and more. Trusted tutors in Pakistan & worldwide.",
      keywords: [
        "online tutoring service",
        "online tutor pakistan",
        "one to one tutor online",
        "maths physics tutor",
      ],
    }),
    links: [{ rel: "canonical", href: "/tutoring" }],
    scripts: [faqJsonLd(faqs.slice(0, 6))],
  }),
  component: TutoringPage,
});

const tutorModes = [
  { icon: UserRound, title: "One-to-one tutoring", desc: "Fully personalised lessons with the tutor's complete attention on your child's progress." },
  { icon: Users, title: "Small group classes", desc: "Affordable, collaborative learning in carefully matched small groups." },
  { icon: Globe2, title: "International scheduling", desc: "Flexible class times that work across every time zone, anywhere in the world." },
];

const popular = [
  { label: "Online Tutor Service in Pakistan", to: "/online-tutor-service-pakistan" },
  { label: "Computer Science Tutoring", to: "/computer-science-tutoring" },
  { label: "Maths Tutor Online", to: "/maths-tutor" },
  { label: "Physics Tutor Online", to: "/physics-tutor" },
  { label: "Online Classes for Students", to: "/online-classes-for-students" },
  { label: "Grade 5 to MS Online Learning", to: "/grade-5-to-ms-online-learning" },
];

function TutoringPage() {
  return (
    <>
      <PageHeader
        eyebrow="Online tutor service"
        title="Live online tutoring, tailored to you"
        description="Expert, one-to-one and small-group tutoring for students from Grade 5 to MS — across academic subjects and technical skills."
        breadcrumb={[{ label: "Tutoring" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={tutorTeaching}
                alt="Online tutor teaching a live class to students"
                width={1200}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Personalised tutoring that delivers results
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our tutor service connects every student with a qualified, caring specialist who
              adapts to their level, curriculum and goals. Whether you need help catching up,
              exam preparation, or to get ahead, we make learning clear and confidence-building.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Curriculum-aligned, exam-focused lessons",
                "Live, interactive classes — not recordings",
                "Regular progress reports for parents",
                "Affordable plans with scholarships",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="hero" size="lg" className="mt-8">
              <Link to="/apply" search={{ type: "Tutor Service", selected: "Online Tutoring" }}>
                Book a tutor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <SectionHeading
            eyebrow="Flexible options"
            title="Tutoring that fits your needs"
            description="Choose the format that works best for your child and schedule."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tutorModes.map((m, i) => (
              <Reveal key={m.title} delay={i * 80} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold text-gold-foreground">
                  <m.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-foreground">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Academic subjects"
          title="Subject tutoring we offer"
          description="Concept-clear, curriculum-aligned tutoring in core academic subjects."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {academicCourses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 70}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-7 shadow-soft">
          <h3 className="text-lg font-bold text-foreground">Popular tutoring searches</h3>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {popular.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="rounded-full border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSection limit={3} />
      <FaqSection faqs={faqs.slice(0, 6)} />
      <CtaSection />
    </>
  );
}
