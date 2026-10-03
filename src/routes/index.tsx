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
      title: `${site.fullName} | Programming Courses & Academic Tutoring`,
      description: site.description,
      path: "/",
      image: "/images/home/hero-tech-learning.webp",
      keywords: [
        "international online academy",
        "online tutor service pakistan",
        "python course online",
        "web development course online",
        "maths physics tutor online",
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