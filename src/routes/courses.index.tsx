import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CourseCard } from "@/components/CourseCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { courses } from "@/data/courses";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: buildMeta({
      title: "Programming & Technology Courses | TechBuilt Open School",
      description:
        "Explore live online technical courses in Python, JavaScript, HTML & CSS, PHP, Java, and software development. Live instructor-led, project-driven learning.",
      keywords: [
        "programming courses online",
        "python course online",
        "web development course",
        "learn javascript",
        "coding courses",
      ],
    }),
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Technology Catalog"
        title="Programming & Technology Courses"
        description="Master modern software development with live, instructor-led technical courses designed around practical projects and clean code."
        breadcrumb={[{ label: "Courses" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          align="left"
          eyebrow="Core Technologies"
          title="All Technical Courses"
          description="Instructor-led courses that build practical, portfolio-ready skills in programming and software development."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 70}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 rounded-2xl border border-border bg-muted/40 p-8 text-center sm:p-10">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" /> Academic & Islamic Tutoring
            </span>
            <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
              Looking for School Subjects or Quran Tutoring?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We provide dedicated 1-on-1 and small group academic tutoring in Mathematics, Physics, Chemistry, Biology, Computer Science, and Quran & Islamic Studies under our separate Tutoring service.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/tutoring">
                Explore Tutoring Services <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <CtaSection />
    </>
  );
}
