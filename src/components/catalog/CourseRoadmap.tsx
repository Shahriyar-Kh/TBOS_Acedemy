import { ExternalLink, CheckCircle2, Award, BookOpen, ShieldCheck, Terminal, Layers } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import {
  getStructuredCourseChapters,
  getCourseValidationBasis,
} from "@/data/curriculumRoadmaps";
import type { Course } from "@/data/courses";
import { cn } from "@/lib/utils";

export function CourseRoadmap({
  course,
  className,
}: {
  course: Course;
  className?: string;
}) {
  const chapters = getStructuredCourseChapters(course);
  const validation = getCourseValidationBasis(course.slug);

  return (
    <div data-course-roadmap className={cn("space-y-8", className)}>
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            Progressive Syllabus & Roadmap
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground">
            {chapters.length} structured milestones
          </span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Chapters, Core Topics & Guided Tasks
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every chapter pairs theoretical understanding with instructor-guided coding exercises,
          hands-on tasks, and real codebase milestones.
        </p>
      </div>

      {/* Chapters Timeline List */}
      <ol className="relative space-y-5 border-l-2 border-border/80 pl-4 sm:pl-7 ml-3 sm:ml-4">
        {chapters.map((ch, index) => {
          const isCapstone = ch.isCapstone;
          const isProject = ch.isProject && !isCapstone;

          return (
            <Reveal key={`${ch.chapterNumber}-${index}`} delay={Math.min(index * 35, 300)}>
              <li
                data-chapter-card
                className={cn(
                  "relative group rounded-3xl border transition-all duration-300",
                  isCapstone
                    ? "border-gold/60 bg-gradient-to-br from-card via-card to-gold/5 p-5 sm:p-7 shadow-card hover:border-gold"
                    : isProject
                      ? "border-cyan/50 bg-gradient-to-br from-card via-card to-cyan/5 p-5 sm:p-6 shadow-soft hover:border-cyan"
                      : "border-border/80 bg-card p-5 sm:p-6 shadow-soft hover:border-border-strong hover:shadow-card",
                )}
              >
                {/* Connecting Node Icon on Left Border */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[27px] sm:-left-[39px] top-6 grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full border-2 border-background shadow-xs font-mono text-[10px] sm:text-xs font-bold transition-transform duration-300 group-hover:scale-110",
                    isCapstone
                      ? "bg-gold text-navy-deep ring-2 ring-gold/40"
                      : isProject
                        ? "bg-cyan text-navy-deep ring-2 ring-cyan/40"
                        : "bg-muted text-foreground ring-1 ring-border group-hover:bg-primary group-hover:text-primary-foreground",
                  )}
                >
                  {isCapstone ? "★" : String(index + 1)}
                </span>

                {/* Chapter Top Bar: Badge, Number & Scope Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase",
                        isCapstone
                          ? "bg-gold/20 text-gold-foreground border border-gold/40"
                          : isProject
                            ? "bg-cyan/15 text-cyan border border-cyan/30"
                            : "bg-accent text-primary border border-primary/20",
                      )}
                    >
                      {isCapstone ? (
                        <Award className="h-3 w-3 text-gold-foreground" />
                      ) : isProject ? (
                        <Layers className="h-3 w-3 text-cyan" />
                      ) : (
                        <BookOpen className="h-3 w-3 text-primary" />
                      )}
                      {ch.badgeLabel}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-muted-foreground">
                    Module {index + 1} of {chapters.length}
                  </span>
                </div>

                {/* Chapter Title */}
                <div className="mt-3.5">
                  <h3
                    className={cn(
                      "font-display text-lg sm:text-xl font-bold tracking-tight",
                      isCapstone ? "text-foreground" : "text-foreground",
                    )}
                  >
                    {ch.title}
                  </h3>

                  {/* Preserved Raw Curriculum Syllabus Item */}
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {ch.rawText}
                  </p>
                </div>

                {/* Core Topics Breakdown */}
                {ch.coreTopics.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Core Concepts Covered
                    </span>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {ch.coreTopics.map((topic) => (
                        <li
                          key={topic}
                          className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
                        >
                          <span className="h-1 w-1 rounded-full bg-cyan" aria-hidden="true" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Guided Chapter Task / Project Box */}
                <div
                  className={cn(
                    "mt-4 rounded-2xl border p-3.5 sm:p-4 text-xs leading-relaxed",
                    isCapstone
                      ? "border-gold/40 bg-gold/10 text-foreground"
                      : isProject
                        ? "border-cyan/40 bg-cyan/10 text-foreground"
                        : "border-border/70 bg-accent/30 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {isCapstone ? (
                      <>
                        <Award className="h-3.5 w-3.5 text-gold-foreground shrink-0" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-gold-foreground">
                          Capstone Deliverable
                        </span>
                      </>
                    ) : isProject ? (
                      <>
                        <Terminal className="h-3.5 w-3.5 text-cyan shrink-0" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-cyan">
                          Milestone Project
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
                          Guided Practical Task
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{ch.guidedTask}</p>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>

      {/* Curriculum Validation Basis & Official Source Links */}
      <Reveal delay={100}>
        <div
          data-validation-card
          className="rounded-3xl border border-cyan/30 bg-gradient-to-br from-card via-card to-cyan/5 p-6 sm:p-8 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan/15 text-cyan border border-cyan/30">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan font-semibold">
                  Curriculum Validation Basis
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                  Official Standard & Specification Alignment
                </h3>
              </div>
            </div>

            <span className="rounded-full border border-primary/20 bg-accent px-3 py-1 font-mono text-[11px] font-semibold text-primary">
              {validation.standardType}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Authoritative Reference
              </span>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                {validation.officialStandard}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Authority: {validation.authority}</p>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Verification Summary
              </span>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {validation.validationSummary}
              </p>
            </div>
          </div>

          {/* Official Documentation Link */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-[11px] text-muted-foreground">
              All concepts, coding standards, and syntax taught follow the latest official
              documentation.
            </p>

            <a
              href={validation.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:border-cyan/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Explore Official Documentation</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

