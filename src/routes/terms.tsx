import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: buildMeta({
      title: "Terms & Conditions | TechBuilt Open School",
      description:
        "The terms and conditions governing use of the TechBuilt Open School website, online courses, tutoring services and enrolment.",
    }),
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

const sections = [
  { h: "1. Acceptance of terms", p: "By accessing this website and using our services, you agree to these Terms & Conditions. If you do not agree, please do not use our website or services." },
  { h: "2. Our services", p: "We provide live online tutoring and technical courses for students from Grade 5 to MS level. Course content, schedules and tutors may be adjusted to best meet learning needs." },
  { h: "3. Enrolment & applications", p: "Submitting an application does not guarantee enrolment. Our team will contact you to confirm availability, schedule, tutor and plan. Enrolment is confirmed once arrangements and any applicable fees are agreed." },
  { h: "4. Fees & payments", p: "Fees, plans and any scholarships are communicated during the admissions process. Payment terms will be shared before classes begin. Fees are subject to the plan you select." },
  { h: "5. Cancellations & rescheduling", p: "We aim to be flexible. Reasonable notice is appreciated for rescheduling or cancelling classes. Specific policies will be shared at enrolment." },
  { h: "6. Code of conduct", p: "Students and guardians agree to engage respectfully with tutors and staff. We reserve the right to discontinue services in cases of misconduct." },
  { h: "7. Intellectual property", p: "All course materials, content and resources provided remain the property of TechBuilt Open School and may not be redistributed without permission." },
  { h: "8. Limitation of liability", p: "We deliver our services with care and professionalism but do not guarantee specific outcomes. We are not liable for indirect or incidental damages arising from use of our services." },
  { h: "9. Changes to these terms", p: "We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms." },
  { h: "10. Contact", p: `For any questions about these terms, contact us at ${site.email}.` },
];

function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" breadcrumb={[{ label: "Terms & Conditions" }]} />
      <section className="mx-auto max-w-3xl container-px py-16 sm:py-20">
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
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
