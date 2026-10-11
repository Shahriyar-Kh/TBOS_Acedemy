import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { CourseCurriculumSource } from "@/data/courseCurriculumSources";
import type { CourseRoadmap } from "@/data/courseRoadmaps";

export function CourseChapterRoadmap({
  roadmap,
  sources,
}: {
  roadmap: CourseRoadmap;
  sources: CourseCurriculumSource[];
}) {
  return (
    <section aria-labelledby="course-roadmap-heading" className="space-y-7" data-course-roadmap>
      <Reveal>
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              30–60 Day Structured Course
            </span>
            <h2
              id="course-roadmap-heading"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Chapters, Core Topics & Guided Tasks
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Every chapter closes with a guided implementation task. The complete course ends with
              one portfolio-ready capstone project.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {roadmap.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5">
              <Clock3 className="h-3.5 w-3.5" /> {roadmap.classesPerWeek}
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div
          className="rounded-2xl border border-primary/15 bg-accent/35 p-4 sm:p-5"
          data-curriculum-sources
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                Curriculum Validation Basis
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Core chapters are cross-checked against current official technology documentation
                and authoritative standards or academic references.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {source.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      <ol className="relative space-y-5 before:absolute before:bottom-8 before:left-6 before:top-8 before:hidden before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-cyan/40 before:to-gold/50 sm:before:block">
        {roadmap.chapters.map((chapter, index) => (
          <Reveal key={chapter.title} delay={index * 35}>
            <li
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none sm:ml-12"
              data-course-chapter
            >
              <span className="absolute -left-[3.8rem] top-5 z-10 hidden h-8 w-8 place-items-center rounded-full border-4 border-background bg-primary font-mono text-[10px] font-bold text-primary-foreground shadow-soft sm:grid">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative border-b border-border/70 bg-gradient-to-r from-muted/60 via-muted/25 to-transparent px-5 py-4 sm:px-6">
                <span
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-cyan"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan">
                  Chapter {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-base font-bold text-foreground sm:text-lg">
                  {chapter.title}
                </h3>
              </div>

              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.35fr_1fr]">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Core topics
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {chapter.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-accent/70 to-background p-4 transition-colors duration-300 group-hover:border-primary/25 motion-reduce:transition-none">
                  <div className="flex items-center gap-2 text-primary">
                    <ClipboardCheck className="h-4 w-4" />
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                      Guided chapter task
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/85">
                    {chapter.guidedTask}
                  </p>
                </div>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <div
          className="relative overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-br from-gold/15 via-gold/5 to-card p-5 shadow-soft sm:p-7"
          data-course-capstone
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                Complete Course Capstone
              </p>
              <h3 className="mt-1 text-base font-bold text-foreground sm:text-lg">
                Portfolio Project
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {roadmap.capstoneProject}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
