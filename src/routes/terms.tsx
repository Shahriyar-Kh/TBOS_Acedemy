import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: buildMeta({
      title: "Terms & Conditions | TechBuilt Open School",
      description:
        "The terms governing use of TechBuilt Open School's website, applications, Free Demo trial sessions, live courses, tutoring services and enrollment.",
      path: "/terms",
    }),
    links: [{ rel: "canonical", href: `${site.url}/terms` }],
  }),
  component: TermsPage,
});

const sections = [
  {
    h: "1. Acceptance of terms",
    p: "By accessing this website or using our services, you agree to these Terms & Conditions. If you do not agree, please do not use the website or submit an application.",
  },
  {
    h: "2. Our services",
    p: "We provide live online technical education and tutoring services. Available programs, tutor assignments, schedules, class formats and curriculum details may vary by offering and are confirmed during admissions.",
  },
  {
    h: "3. Applications & enrollment",
    p: "Submitting an application, contact form or Free Demo request records your interest but does not guarantee admission, tutor availability, a cohort place, or immediate enrollment. Enrollment is confirmed only after admissions communicates the applicable arrangement.",
  },
  {
    h: "4. Free Demo trial session",
    p: "A Free Demo is one live trial session only. It may be used to discuss goals, assess teaching fit or review the proposed learning path. It is not the complete course, tutoring package or a promise of continued free classes.",
  },
  {
    h: "5. Fees & payments",
    p: "Applicable fees, payment timing and any current offer are communicated before paid classes begin. Fees vary by program, tutoring format or cohort and may change for future enrollments.",
  },
  {
    h: "6. Scheduling, cancellations & rescheduling",
    p: "Recurring schedules are confirmed based on learner, tutor or cohort availability. Reasonable notice is expected for rescheduling or cancellation. Any program-specific policy communicated at enrollment also applies.",
  },
  {
    h: "7. Learning outcomes",
    p: "We provide instruction and learning support but do not guarantee grades, examination results, employment, earnings, university admission, certification outcomes or any other specific result. Progress depends on factors including starting level, attendance, practice and individual effort.",
  },
  {
    h: "8. Code of conduct",
    p: "Students, guardians, tutors and staff are expected to communicate respectfully and use online classes appropriately. We may suspend or discontinue services where conduct materially disrupts learning or safety.",
  },
  {
    h: "9. Intellectual property",
    p: "Course materials, learning resources, branding and original content provided by TechBuilt Open School may not be copied, republished or redistributed without permission, except where a resource is explicitly offered for public use.",
  },
  {
    h: "10. Website & service availability",
    p: "We aim to keep the website and online services available, but temporary interruptions may occur because of maintenance, third-party services, internet connectivity or technical issues.",
  },
  {
    h: "11. Changes to these terms",
    p: "We may update these terms when our services or operational requirements change. The latest version published on this page applies from its stated update date.",
  },
  {
    h: "12. Contact",
    p: `For questions about these terms, contact us at ${site.email}.`,
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Clear expectations for website use, applications, trial sessions, enrollment and online learning services."
        breadcrumb={[{ label: "Terms & Conditions" }]}
      />
      <section className="mx-auto max-w-3xl container-px py-16 sm:py-20">
        <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-xl font-bold text-foreground">{s.h}</h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
