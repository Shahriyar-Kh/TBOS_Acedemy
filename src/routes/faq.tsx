import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { faqs } from "@/data/faqs";
import { site } from "@/data/site";
import { buildMeta, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: buildMeta({
      title: "FAQ | Frequently Asked Questions | TechBuilt Open School",
      description:
        "Answers to common questions about TechBuilt Open School's online courses, tutoring, fees, scheduling, enrolment and international learning.",
      keywords: ["online academy faq", "online tutoring questions", "how online classes work"],
    }),
    links: [{ rel: "canonical", href: `${site.url}/faq` }],
    scripts: [faqJsonLd(faqs)],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Everything parents and students need to know about learning with TechBuilt Open School."
        breadcrumb={[{ label: "FAQ" }]}
      />
      <FaqSection
        faqs={faqs}
        eyebrow="Answers"
        title="Your questions, answered"
        description="Still have a question? Reach out via WhatsApp or our contact form."
      />
      <CtaSection />
    </>
  );
}
