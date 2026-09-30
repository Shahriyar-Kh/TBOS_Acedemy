import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, UserRound, Users, Globe2, BookOpen, Sparkles } from "lucide-react";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { academicTutoring, quranTutoring } from "@/data/tutoring";
import { faqs } from "@/data/faqs";
import { buildMeta, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/tutoring/")({
  head: () => ({
    meta: buildMeta({
      title: "Online Tutoring Service | Academic & Quran Tutoring | TechBuilt Open School",
      description:
        "Personalized online tutoring for Grade 5 to MS level. Live 1-on-1 and small group classes in Mathematics, Physics, Chemistry, Computer Science, and Quran & Tajweed.",
      keywords: [
        "online tutoring service",
        "online tutor pakistan",
        "maths tutor online",
        "physics tutor online",
        "quran tutor online",
        "tajweed classes",
      ],
    }),
    links: [{ rel: "canonical", href: "/tutoring" }],
    scripts: [faqJsonLd(faqs.slice(0, 6))],
  }),
  component: TutoringPage,
});

const tutorModes = [
  { icon: UserRound, title: "One-to-one tutoring", desc: "Fully personalised lessons with the tutor's complete attention on your progress and syllabus." },
  { icon: Users, title: "Small group classes", desc: "Affordable, collaborative learning in carefully matched small groups." },
  { icon: Globe2, title: "International scheduling", desc: "Flexible class times that work across time zones in Pakistan, the Middle East, UK, and worldwide." },
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
        eyebrow="Online Tutoring Service"
        title="Live Online Tutoring, Tailored to You"
        description="Expert 1-on-1 and small-group tutoring for students from Grade 5 to University level — covering core academic subjects and Quran & Islamic Studies."
        breadcrumb={[{ label: "Tutoring" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-foreground">
              Personalised Learning
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              Match with an expert tutor who fits your curriculum & goals
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Whether preparing for board exams, university entrance tests, mastering difficult formulas, or seeking fluent Quranic recitation, our experienced tutors deliver structured, patient guidance.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Personalised lesson plans based on your syllabus",
                "Regular assessments and feedback for students and parents",
                "Flexible timing across Pakistan and international time zones",
                "Free Demo session before committing to full classes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/apply" search={{ type: "One-to-One Learning" }}>
                  Request a Tutor <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/free-demo" search={{ type: "Academic Tutoring" }}>
                  <Sparkles className="h-4 w-4 text-gold-foreground" /> Book a Free Demo
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={tutorTeaching}
                alt="Teacher conducting live online tutoring"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tutorModes.map((m, i) => (
            <Reveal
              key={m.title}
              delay={i * 80}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                <m.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Academic Subjects */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl container-px">
          <SectionHeading
            align="left"
            eyebrow="Academic Excellence"
            title="School, College & University Subjects"
            description="From Grade 5 foundational skills to advanced university coursework, our tutors help students master concepts and score top marks."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {academicTutoring.map((subject, i) => (
              <Reveal
                key={subject.slug}
                delay={i * 60}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                    <BookOpen className="h-3.5 w-3.5" /> {subject.level}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">{subject.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subject.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {subject.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link to="/free-demo" search={{ type: "Academic Tutoring", selected: subject.title }}>
                      Free Demo
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="hero" className="text-xs">
                    <Link to="/apply" search={{ type: "Academic Tutoring", selected: subject.title }}>
                      Request Tutor <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quran & Islamic Studies */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl container-px">
          <SectionHeading
            align="left"
            eyebrow="Spiritual & Moral Growth"
            title="Quran & Islamic Studies Tutoring"
            description="Qualified, patient instructors offering foundational Qaida, Nazra with translation, Tajweed rules, and essential Islamic character building."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quranTutoring.map((subject, i) => (
              <Reveal
                key={subject.slug}
                delay={i * 60}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> {subject.level}
                </span>
                <h3 className="mt-4 text-lg font-bold text-foreground">{subject.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subject.summary}</p>
                <div className="mt-6 pt-4 border-t border-border mt-auto grid grid-cols-2 gap-2">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link to="/free-demo" search={{ type: "Quran & Islamic Studies", selected: subject.title }}>
                      Free Demo
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="hero" className="text-xs">
                    <Link to="/apply" search={{ type: "Quran & Islamic Studies", selected: subject.title }}>
                      Enrol
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tutoring Pages */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl container-px">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Explore Popular Tutoring Programs
          </h3>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {popular.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSection limit={3} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
