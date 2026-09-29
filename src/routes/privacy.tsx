import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/data/site";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: buildMeta({
      title: "Privacy Policy | TechBuilt Open School",
      description:
        "Read how TechBuilt Open School collects, uses and protects your personal information when you use our online academy and submit application or contact forms.",
    }),
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    h: "1. Information we collect",
    p: "When you submit an application or contact form, we collect the details you provide — such as your name, parent/guardian name, email address, WhatsApp number, country, city, grade/level, selected course or subject, and your message. We may also collect basic technical information such as your browser type for security and quality purposes.",
  },
  {
    h: "2. How we use your information",
    p: "We use your information to respond to your enquiry, process your application, match you with a suitable tutor and plan, arrange classes, and communicate with you about your learning. We may contact you by email or WhatsApp regarding your request.",
  },
  {
    h: "3. Storage of form submissions",
    p: "Form submissions are securely recorded (for example, in a managed spreadsheet) and trigger an internal email notification to our admissions team so we can respond promptly. Access is limited to authorised staff.",
  },
  {
    h: "4. Sharing your information",
    p: "We do not sell your personal information. We only share it with the tutors and team members directly involved in delivering your requested service, and where required by law.",
  },
  {
    h: "5. Data retention",
    p: "We retain your information for as long as necessary to provide our services and meet legal or administrative requirements. You may request deletion of your data at any time.",
  },
  {
    h: "6. Your rights",
    p: "You may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us using the details below.",
  },
  {
    h: "7. Cookies",
    p: "Our website may use essential cookies and similar technologies to ensure the site functions correctly and to understand how it is used so we can improve it.",
  },
  {
    h: "8. Contact us",
    p: `If you have any questions about this Privacy Policy, please contact us at ${site.email}.`,
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" breadcrumb={[{ label: "Privacy Policy" }]} />
      <section className="mx-auto max-w-3xl container-px py-16 sm:py-20">
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          At {site.fullName}, we are committed to protecting your privacy. This policy explains
          what information we collect, how we use it, and your rights.
        </p>
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
