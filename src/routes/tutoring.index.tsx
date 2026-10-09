import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, UserRound, Users, Globe2, Sparkles } from "lucide-react";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { tutoringSubjects } from "@/data/tutoring";
import { getCmsTutoringFn } from "@/lib/cmsFunctions";
import { faqs } from "@/data/faqs";
import { buildMeta, faqJsonLd } from "@/lib/seo";
import { site } from "@/data/site";
import { TutoringCatalogCard } from "@/components/catalog/TutoringCatalogCard";

export const Route = createFileRoute("/tutoring/")({
  loader: async () => {
    try {
      const data = await getCmsTutoringFn();
      if (data && data.length > 0) return { tutoring: data };
    } catch {
      // Fallback
    }
    return { tutoring: tutoringSubjects };
  },
  head: () => ({
    meta: buildMeta({
      title: "Online Tutoring Service | Academic & Quran Tutoring | TechBuilt Open School",
      description:
        "Live online tutoring options for school, college, university, Quran and Islamic Studies learners. One-to-one and small-group formats are available subject to tutor scheduling.",
      path: "/tutoring",
      keywords: [
        "online tutoring service",
        "online tutor pakistan",
        "maths tutor online",
        "physics tutor online",
        "quran tutor online",
        "tajweed classes",
      ],
    }),
    links: [{ rel: "canonical", href: `${site.url}/tutoring` }],
    scripts: [faqJsonLd(faqs.slice(0, 6))],
  }),
  component: TutoringPage,
});

const tutorModes = [
  { icon: UserRound, title: "One-to-one tutoring", desc: "A focused format built around the learner's current level, syllabus and goals." },
  { icon: Users, title: "Small group classes", desc: "Collaborative learning when a suitable small group and schedule are available." },
  { icon: Globe2, title: "Online scheduling", desc: "Live online sessions with timing confirmed by admissions based on tutor and learner availability." },
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
  const { tutoring: loadedTutoring } = Route.useLoaderData();
  const allTutoring = loadedTutoring && loadedTutoring.length > 0 ? loadedTutoring : tutoringSubjects;
  const academicList = allTutoring.filter((s) => s.category === "Academic");
  const quranList = allTutoring.filter((s) => s.category === "Quran & Islamic Studies");

  return (
    <>
      <PageHeader
        eyebrow="Online Tutoring Service"
        title="Live Online Tutoring, Tailored to the Learner"
        description="Explore one-to-one and small-group tutoring options for school, college, university, Quran and Islamic Studies learners. Availability, tutor match and schedule are confirmed before enrollment."
        breadcrumb={[{ label: "Tutoring" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-foreground">
              Personalised Learning
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              Find a tutoring option that fits your curriculum and goals
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Whether the goal is syllabus support, exam preparation, difficult concepts, or Quranic learning, admissions helps match the request to an available tutoring option and suitable schedule.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Subject and level captured before tutor matching",
                "One-to-one and small-group formats where available",
                "Schedule and applicable fee confirmed before enrollment",
                "One Free Demo trial session available before paid continuation",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="default" size="lg">
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
            description="Tutoring options span school foundations through university-level academic support. Exact syllabus coverage is confirmed against the learner's level and goals."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {academicList.map((subject) => (
              <TutoringCatalogCard key={subject.slug} subject={subject} />
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
            description="Explore Qaida, Nazra, Tajweed and Islamic Studies options. Instructor availability, level fit and recurring schedule are confirmed before enrollment."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quranList.map((subject) => (
              <TutoringCatalogCard key={subject.slug} subject={subject} />
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
