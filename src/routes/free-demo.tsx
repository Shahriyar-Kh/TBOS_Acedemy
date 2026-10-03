import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Video,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { DemoForm } from "@/components/forms/DemoForm";
import { buildMeta } from "@/lib/seo";
import { site } from "@/data/site";

type DemoSearch = {
  type?: string;
  selected?: string;
};

export const Route = createFileRoute("/free-demo")({
  validateSearch: (search: Record<string, unknown>): DemoSearch => ({
    type: typeof search.type === "string" ? search.type : undefined,
    selected: typeof search.selected === "string" ? search.selected : undefined,
  }),
  head: () => ({
    meta: buildMeta({
      title: "Request a Free Demo Class | TechBuilt Open School",
      description:
        "Request a 1-class live trial demo session at TechBuilt Open School. Experience our live interactive teaching style for programming courses, live batches, or academic tutoring.",
      keywords: [
        "free demo class",
        "free trial online course",
        "free programming demo",
        "online tutoring trial",
        "techbuilt open school demo",
      ],
      path: "/free-demo",
    }),
    links: [{ rel: "canonical", href: `${site.url}/free-demo` }],
  }),
  component: FreeDemoPage,
});

const steps = [
  {
    step: "01",
    title: "Select Program",
    desc: "Pick your technical course, live batch, or tutoring subject of interest.",
  },
  {
    step: "02",
    title: "Share Availability",
    desc: "Provide your preferred days and time windows for the trial class.",
  },
  {
    step: "03",
    title: "Coordinator Match",
    desc: "Our admissions coordinator connects with the instructor to find a matching slot.",
  },
  {
    step: "04",
    title: "Join Live Class",
    desc: "Receive your private class meeting link via WhatsApp and experience the session.",
  },
];

const faqs = [
  {
    q: "Is the demo session genuinely free?",
    a: "Yes. The introductory 1-class demo session is completely free with zero financial obligation. It allows students and parents to evaluate our curriculum, instructor teaching methodology, and online interactive platform before deciding to enrol in a full paid course.",
  },
  {
    q: "What equipment or software is needed for the demo?",
    a: "A computer (laptop or desktop) with an internet connection, Google Chrome or modern browser, working audio/microphone, and optionally Zoom or Google Meet. For programming courses, our instructor will help you get started with the development environment directly.",
  },
  {
    q: "Can parents attend the demo session?",
    a: "Absolutely. For school learners in Grades 5–10 or minors under 18, we actively encourage parents to join the first 10 minutes of the demo to meet the teacher and discuss goals directly.",
  },
  {
    q: "What happens after the Free Demo?",
    a: "If you are satisfied with the demo, our admissions team will share the complete syllabus breakdown, class schedule, and tuition payment details for the regular cohort or 1-on-1 tutoring plan.",
  },
];

function FreeDemoPage() {
  const { type, selected } = Route.useSearch();

  return (
    <>
      <PageHeader
        eyebrow="Trial Session"
        title="Request a Free Demo Class"
        description="Experience our live, instructor-led online learning firsthand. Request a 1-class trial session for any technical course, active batch, or academic tutoring subject."
        breadcrumb={[{ label: "Free Demo" }]}
      />

      <section className="mx-auto max-w-6xl container-px py-12 sm:py-16">
        {/* 4-Step Process Bar */}
        <div className="mb-12">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
            How The Demo Process Works
          </h2>
          <p className="mt-1 text-center text-lg font-bold text-foreground">
            4 Simple Steps to Your Free Trial Class
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40"
              >
                <span className="font-mono text-xs font-bold text-primary">
                  STEP {s.step}
                </span>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid: Form + Aside Info */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: The Form */}
          <Reveal>
            <DemoForm
              sourcePage="Free Demo Page"
              defaultType={type}
              defaultSelected={selected ?? ""}
            />
          </Reveal>

          {/* Right: Explanatory Context & Trust */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Transparent Pricing Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Transparent Trial Policy</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-foreground">
                No Commitment Required
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                We believe in providing an honest preview of our education quality. You do not need to enter credit card details or make upfront payments to attend a trial class.
              </p>
              <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Full Course Pricing:</strong> Regular batches and 1-on-1 tutoring are paid programs. Once you approve the demo, admissions coordinates enrollment and class schedules.
              </div>
            </div>

            {/* What to Expect Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-sm font-bold text-foreground">
                What You Get In The Demo:
              </h3>
              <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-foreground">Live 1-on-1 or Cohort Session:</strong> Direct real-time interaction with the instructor, not pre-recorded videos.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-foreground">Curriculum Walkthrough:</strong> Clear roadmap of projects, tools, and learning milestones.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-foreground">Skill Level Evaluation:</strong> Understand whether your current background aligns with the course level.
                  </span>
                </li>
              </ul>
            </div>

            {/* Alternative: Ready to Apply */}
            <div className="rounded-2xl border border-dashed border-border bg-background p-6">
              <h3 className="text-sm font-semibold text-foreground">
                Already know what you need?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Skip the trial and apply directly for admissions in a course, cohort, or 1-on-1 program.
              </p>
              <Link
                to="/apply"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Go to Universal Application <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mini FAQ Section */}
        <div className="mt-16 border-t border-border pt-12">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Frequently Asked Questions About Free Demos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about our trial classes before submitting.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {faq.q}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
