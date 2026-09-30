import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Clock, Sparkles, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { buildMeta } from "@/lib/seo";
import { courseTypeOptions, type FormType } from "@/lib/forms";
import { normalizeApplicationType } from "@/lib/programs";

type ApplySearch = { type?: string; selected?: string };

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>): ApplySearch => ({
    type: typeof search.type === "string" ? search.type : undefined,
    selected: typeof search.selected === "string" ? search.selected : undefined,
  }),
  head: () => ({
    meta: buildMeta({
      title: "Apply Now | TechBuilt Open School International Online Academy",
      description:
        "Apply for online courses, specializations, live cohorts, or academic tutoring at TechBuilt Open School. Submit your learning goals for personalized admissions guidance.",
      keywords: ["apply online academy", "enrol online course", "book online tutor", "techbuilt admissions"],
    }),
    links: [{ rel: "canonical", href: "/apply" }],
  }),
  component: ApplyPage,
});

const assurances = [
  {
    icon: Clock,
    title: "Personalized Review",
    desc: "Our admissions coordinator directly reviews your background and learning goals.",
  },
  {
    icon: GraduationCap,
    title: "Curriculum Alignment",
    desc: "We recommend the right live batch or 1-on-1 pace tailored to your experience.",
  },
  {
    icon: ShieldCheck,
    title: "No Obligation",
    desc: "Apply freely — review the syllabus, timetable, and tutor before making any commitment.",
  },
  {
    icon: Sparkles,
    title: "Free Demo Available",
    desc: "Want to try a class first? Request a 1-class live trial on our Free Demo page.",
  },
];

function ApplyPage() {
  const { type, selected } = Route.useSearch();
  const normalizedType = normalizeApplicationType(type);

  return (
    <>
      <PageHeader
        eyebrow="Enrolment"
        title="Admissions Application"
        description="Tell us about your learning goals and our admissions team will guide you to the right course, cohort, or 1-on-1 schedule."
        breadcrumb={[{ label: "Apply" }]}
      />

      <section className="mx-auto max-w-6xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">How Admissions Works</h2>
              <p className="mt-3 text-muted-foreground">
                Complete the application form. Our admissions coordinator will reach out via WhatsApp or email to discuss batch schedules, tutor availability, and next steps.
              </p>
            </div>

            <ul className="space-y-5">
              {assurances.map((a) => (
                <li key={a.title} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Trial Demo Alternative Card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Prefer a Trial First?</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                If you would like to test our interactive teaching methodology before submitting a full application, request a 1-class live Free Demo.
              </p>
              <Link
                to="/free-demo"
                search={selected ? { type: normalizedType, selected } : undefined}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Request Free Demo Session <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ApplyForm
              sourcePage="Apply Page"
              defaultApplicationType={normalizedType}
              defaultSelected={selected ?? ""}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
