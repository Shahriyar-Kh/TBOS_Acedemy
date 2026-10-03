import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Globe2, Sparkles } from "lucide-react";
import heroStudent from "@/assets/hero-student.jpg";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CourseCard } from "@/components/CourseCard";
import { LiveOfferCard } from "@/components/LiveOfferCard";
import { SpecializationCard } from "@/components/SpecializationCard";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { featuredCourses } from "@/data/courses";
import { featuredSpecializations } from "@/data/specializations";
import { activeLiveOffers } from "@/data/liveOffers";
import { faqs } from "@/data/faqs";
import { buildMeta, faqJsonLd } from "@/lib/seo";
import { site } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: buildMeta({
      title: `${site.fullName} | Programming Courses & Academic Tutoring`,
      description: site.description,
      path: "/",
      image: heroStudent,
      keywords: [
        "international online academy",
        "online tutor service pakistan",
        "python course online",
        "web development course online",
        "maths physics tutor online",
      ],
    }),
    links: [{ rel: "canonical", href: `${site.url}/` }],
    scripts: [faqJsonLd(faqs.slice(0, 6))],
  }),
  component: Home,
});

const trustPoints = [
  "Grade 5 to University level",
  "Live 1-on-1 & small batches",
  "Free Demo session available",
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 container-px py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <Sparkles className="h-3.5 w-3.5" /> International Online Academy
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] text-primary-foreground sm:text-5xl lg:text-6xl">
              Premium online learning for{" "}
              <span className="text-gradient-gold">ambitious students</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              Live online technical courses and personalized tutoring from Grade 5 to University
              level — across Pakistan and worldwide. Learn practical programming and academic
              subjects from expert instructors, your way.
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 text-sm font-medium text-primary-foreground/90"
                >
                  <CheckCircle2 className="h-5 w-5 text-gold" /> {p}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl">
                <Link to="/apply">
                  Apply Now <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="xl">
                <Link to="/courses">View Courses</Link>
              </Button>
            </div>

            <div className="mt-9 flex items-center gap-3 text-sm text-primary-foreground/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Free Demo Available
              </span>
              <span>Experience our live classroom before enrolling</span>
            </div>
          </div>

          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-primary-foreground/10 shadow-card">
              <img
                src={heroStudent}
                alt="Student smiling while learning online on a laptop"
                width={1280}
                height={1280}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-success/15 text-success">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Trusted & secure</p>
                <p className="text-xs text-muted-foreground">
                  Experienced instructors · Safe classrooms
                </p>
              </div>
            </div>
            <div className="absolute -right-4 top-6 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:flex">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <Globe2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Worldwide reach</p>
                <p className="text-xs text-muted-foreground">Flexible time zones</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <StatsStrip />

      {/* About preview */}
      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
              About the academy
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              World-class teaching, a personal touch
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              TechBuilt Open School is an international online academy on a mission to make
              high-quality education accessible to every ambitious student. We blend expert
              instruction, modern technology and genuine care to help learners excel — academically
              and professionally.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Curriculum-aligned tutoring for school, college and university",
                "Practical, project-based programming courses and specializations",
                "Dedicated support for parents and international families",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="default" size="lg" className="mt-8">
              <Link to="/about">
                Learn more about us <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={tutorTeaching}
                alt="Professional online tutor teaching a live class"
                width={1200}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Current Live Group Programs */}
      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-foreground">
              Scheduled Cohorts
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Current Live Group Programs
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Join active group cohorts with live interactive instruction, step-by-step milestones,
              and special group pricing. Every program includes a Free Demo trial session.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="shrink-0">
            <Link to="/live-batches">
              View All Batches <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activeLiveOffers.map((offer, i) => (
            <Reveal key={offer.slug} delay={i * 80} className="min-w-0">
              <LiveOfferCard offer={offer} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <SectionHeading
            eyebrow="Popular courses"
            title="Programming & Technology Courses"
            description="Explore practical, instructor-led online courses across Web Development, Programming, Computer Science, Database, and Data & AI."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((c, i) => (
              <Reveal key={c.slug} delay={i * 70}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/courses">
                View all courses <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Developer tracks"
          title="Professional Specializations"
          description="Structured, mentor-led learning paths that take you from fundamentals to practical software engineering mastery."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSpecializations.map((s, i) => (
            <Reveal key={s.slug} delay={i * 70}>
              <SpecializationCard spec={s} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/specializations">
              Explore all specializations <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />
      <TestimonialsSection limit={3} />
      <FaqSection faqs={faqs.slice(0, 6)} />
      <CtaSection />
    </>
  );
}
