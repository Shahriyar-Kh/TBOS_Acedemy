import { Link } from "@tanstack/react-router";
import { Award, BookOpen, CheckCircle2, FolderKanban } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export interface ProgramCourseCard {
  title: string;
  duration: string;
  chapters: string[];
  project: string;
  course?: string;
  outcome?: string;
  courseSlug?: string;
}

export function ProgramCoursesRoadmap({
  courses,
  capstoneProject,
  eyebrow = "COURSE-BY-COURSE ROADMAP",
  title = "Courses, Chapters & Projects",
  description = "Each course follows a clear chapter sequence and ends with a practical project before the final integrated capstone.",
  sourceNote,
}: {
  courses: ProgramCourseCard[];
  capstoneProject: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  sourceNote?: string;
}) {
  return (
    <section
      aria-labelledby="program-roadmap-heading"
      className="py-12 sm:py-16"
      data-program-roadmap
    >
      <Reveal>
        <div className="border-b border-border/70 pb-5">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
          <h2
            id="program-roadmap-heading"
            className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {sourceNote && (
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-primary/80">{sourceNote}</p>
          )}
        </div>
      </Reveal>

      <div className="mt-8 space-y-6">
        {courses.map((course, index) => (
          <Reveal key={`${course.title}-${index}`} delay={index * 35}>
            <article
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft"
              data-program-course
            >
              <header className="flex flex-col gap-3 border-b border-border/70 bg-muted/35 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan">
                    {course.course ?? `Course ${index + 1}`}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-foreground">{course.title}</h3>
                </div>
                <span className="w-fit rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {course.duration}
                </span>
              </header>

              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.35fr_1fr]">
                <div>
                  <div className="flex items-center gap-2 text-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Core chapters
                    </p>
                  </div>
                  <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                    {course.chapters.map((chapter, chapterIndex) => (
                      <li
                        key={chapter}
                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent font-mono text-[9px] font-bold text-primary">
                          {chapterIndex + 1}
                        </span>
                        <span>{chapter}</span>
                      </li>
                    ))}
                  </ol>
                  {course.courseSlug && (
                    <Link
                      to="/courses/$slug"
                      params={{ slug: course.courseSlug }}
                      className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline"
                    >
                      View full course chapter roadmap
                    </Link>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-primary/15 bg-accent/45 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <FolderKanban className="h-4 w-4" />
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                        Course project
                      </p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/85">
                      {course.project}
                    </p>
                  </div>

                  {course.outcome && (
                    <div className="rounded-xl border border-border/70 bg-muted/35 p-4">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                          Course outcome
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {course.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div
          className="mt-7 rounded-2xl border border-gold/35 bg-gold/10 p-5 sm:p-7"
          data-program-capstone
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                Final Integrated Capstone
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {capstoneProject}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
