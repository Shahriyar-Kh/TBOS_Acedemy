import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CourseCard } from "@/components/CourseCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { academicCourses, technicalCourses } from "@/data/courses";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: buildMeta({
      title: "Online Courses | Academic & Technical | TechBuilt Open School",
      description:
        "Explore live online courses in maths, physics, computer science, Python, JavaScript, web development and more. Expert tutors, flexible plans, Grade 5 to MS.",
      keywords: [
        "online courses",
        "python course online",
        "web development course",
        "maths physics computer science",
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
        eyebrow="Our courses"
        title="Live online courses for every learner"
        description="Choose from academic subject tutoring and in-demand technical skills — all taught live by expert tutors, one-to-one or in small groups."
        breadcrumb={[{ label: "Courses" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          align="left"
          eyebrow="Academic"
          title="Academic subject tutoring"
          description="Curriculum-aligned tutoring that builds clear concepts, confidence and top grades — from Grade 5 to MS."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {academicCourses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 70}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading
            align="left"
            eyebrow="Technical"
            title="Technical & coding courses"
            description="Practical, project-based courses that build real, career-ready skills in programming and web development."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technicalCourses.map((c, i) => (
              <Reveal key={c.slug} delay={i * 70}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Not sure which course is right for you?" description="Apply or message us and our team will recommend the perfect course and plan for your goals." />
    </>
  );
}
