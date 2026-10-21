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
  capstoneLabel = "Final Integrated Capstone",
  eyebrow = "COURSE-BY-COURSE ROADMAP",
  title = "Courses, Chapters & Projects",
  description = "Each course follows a clear chapter sequence and ends with a practical project before the final integrated capstone.",
  sourceNote,
}: {
  courses: ProgramCourseCard[];
  capstoneProject: string;
  capstoneLabel?: string;
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

      <div className="relative mt-8 space-y-6 before:absolute before:bottom-8 before:left-6 before:top-8 before:hidden before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-cyan/40 before:to-gold/50 sm:before:block">
        {courses.map((course, index) => (
          <Reveal key={`${course.title}-${index}`} delay={index * 35}>
            <article
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none sm:ml-12"
              data-program-course
            >
              <span className="absolute -left-[3.8rem] top-5 z-10 hidden h-8 w-8 place-items-center rounded-full border-4 border-background bg-primary font-mono text-[10px] font-bold text-primary-foreground shadow-soft sm:grid">
                {String(index + 1).padStart(2, "0")}
              </span>
              <header className="relative flex flex-col gap-3 border-b border-border/70 bg-gradient-to-r from-muted/60 via-muted/25 to-transparent p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <span
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-cyan"
                  aria-hidden="true"
                />
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
                  <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-accent/70 to-background p-4 transition-colors duration-300 group-hover:border-primary/25 motion-reduce:transition-none">
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
          className="relative mt-7 overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-br from-gold/15 via-gold/5 to-card p-5 shadow-soft sm:p-7"
          data-program-capstone
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                {capstoneLabel}
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
