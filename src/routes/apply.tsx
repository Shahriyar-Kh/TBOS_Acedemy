import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Clock, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { buildMeta } from "@/lib/seo";
import { courseTypeOptions, type FormType } from "@/lib/forms";

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
        "Apply for online courses, specializations or tutoring at TechBuilt Open School. Quick application — our team responds within 24 hours.",
      keywords: ["apply online academy", "enrol online course", "book online tutor"],
    }),
    links: [{ rel: "canonical", href: "/apply" }],
  }),
  component: ApplyPage,
});

const assurances = [
  { icon: Clock, title: "24-hour response", desc: "Our admissions team replies within one working day." },
  { icon: GraduationCap, title: "Expert tutor match", desc: "We pair you with the ideal specialist for your goals." },
  { icon: ShieldCheck, title: "No obligation", desc: "Apply freely — there's no commitment to enrol." },
  { icon: HeartHandshake, title: "Scholarships", desc: "Flexible plans and scholarships for deserving students." },
];

function ApplyPage() {
  const { type, selected } = Route.useSearch();
  const validType = courseTypeOptions.includes(type as (typeof courseTypeOptions)[number]);
  const courseType = validType ? (type as string) : "Single Course";
  const formType: FormType = validType ? (type as FormType) : "Other Inquiry";

  return (
    <>
      <PageHeader
        eyebrow="Enrolment"
        title="Apply Now"
        description="Tell us about your learning goals and we'll match you with the perfect tutor, schedule and plan."
        breadcrumb={[{ label: "Apply" }]}
      />

      <section className="mx-auto max-w-6xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-bold text-foreground">Start in minutes</h2>
            <p className="mt-3 text-muted-foreground">
              Complete the form and our team will be in touch via email or WhatsApp to finalise
              everything.
            </p>
            <ul className="mt-8 space-y-5">
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
          </Reveal>

          <Reveal delay={100}>
            <ApplyForm
              sourcePage="Apply Page"
              defaultCourseType={courseType}
              defaultSelected={selected ?? ""}
              formType={formType}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
