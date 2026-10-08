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
    links: [{ rel: "canonical", href: `${site.url}/privacy` }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    h: "1. Information we collect",
    p: "When you submit an application, Free Demo request, or contact form, we collect the details you provide — such as your name, parent/guardian details where applicable, email address, WhatsApp number, country, city, age or grade/level, selected program or subject, scheduling preferences, and your message. The website may also process limited technical metadata needed for security, analytics, or service operation.",
  },
  {
    h: "2. How we use your information",
    p: "We use submitted information to respond to your enquiry, process admissions or trial-session requests, review program or tutor fit, arrange scheduling, and communicate about the requested learning service. We may contact you by email or WhatsApp regarding that request.",
  },
  {
    h: "3. Storage of form submissions",
    p: "Form submissions are recorded in our managed admissions systems, including our production database and operational notification or reporting tools. Access is limited to authorised staff who need the information to handle admissions and support.",
  },
  {
    h: "4. Sharing your information",
    p: "We do not sell personal information. Access is limited to authorised team members and service providers used to operate admissions, communications, analytics, or learning delivery, and to disclosures required by law.",
  },
  {
    h: "5. Data retention",
    p: "We retain admissions and enquiry information only for as long as reasonably needed for service delivery, follow-up, operational records, security, or legal and administrative requirements. You may contact us to request deletion or correction, subject to any records we are required to keep.",
  },
  {
    h: "6. Your rights",
    p: "You may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us using the details below.",
  },
  {
    h: "7. Cookies, analytics & advertising measurement",
    p: "Our website may use essential browser storage and, when enabled, advertising or measurement technologies such as Meta Pixel to understand campaign performance and actions such as viewing a program or submitting an enquiry. Campaign parameters such as UTM source, medium, campaign and content may be retained with an admissions submission for attribution. These measurement tools are secondary to the admissions record itself.",
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
        <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
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
