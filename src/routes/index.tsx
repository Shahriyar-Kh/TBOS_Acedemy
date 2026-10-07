import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/home/HeroSection";
import {
  FinalCta,
  LearningJourney,
  TechStackSection,
  TrustStrip,
  WhySection,
} from "@/components/home/HomeSections";
import { LiveProgramsSection } from "@/components/home/LiveProgramsSection";
import { CoursesSection, SpecializationsSection } from "@/components/home/CatalogSections";
import { FaqSection } from "@/components/sections/FaqSection";
import { faqs } from "@/data/faqs";
import { buildMeta, faqJsonLd } from "@/lib/seo";
import { site } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: buildMeta({
      title: "TechBuilt Open School | Live Python, Web, Data & AI Programs",
      description:
        "Live, instructor-led online programs in Python, web development, data analysis and AI/ML foundations — practical project-driven roadmaps for learners across Pakistan and worldwide.",
      path: "/",
      image: "/images/og/tbos-technical-academy-1200x630.jpg",
      keywords: [
        "international online academy",
        "live python classes online",
        "web development course online",
        "data analysis python course",
        "ai ml foundations course",
        "online coding academy pakistan",
      ],
    }),
    links: [{ rel: "canonical", href: `${site.url}/` }],
    scripts: [faqJsonLd(faqs.slice(0, 6))],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <WhySection />
      <LiveProgramsSection />
      <SpecializationsSection />
      <CoursesSection />
      <LearningJourney />
      <TechStackSection />
      <FaqSection faqs={faqs.slice(0, 6)} />
      <FinalCta />
    </>
  );
}
