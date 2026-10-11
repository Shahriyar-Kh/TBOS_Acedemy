import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { getSpecializationJourney } from "@/data/curriculumRoadmaps";
import type { Specialization } from "@/data/specializations";
import { cn } from "@/lib/utils";

export function SpecializationJourney({
  spec,
  className,
}: {
  spec: Specialization;
  className?: string;
}) {
  const journey = getSpecializationJourney(spec.slug);

  if (!journey) {
    // Graceful fallback to original modules if journey not configured
    return (
      <div className={cn("space-y-6", className)}>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Specialization Learning Pathway
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Progressive curriculum roadmap connecting foundational skills to real-world code.
          </p>
        </div>
        <ol className="relative space-y-4 border-l border-border/80 pl-6 ml-3">
          {spec.modules.map((mod, i) => (
            <li key={mod} className="rounded-2xl border border-border bg-card p-4">
              <span className="font-mono text-xs font-semibold text-primary">Phase {i + 1}</span>
              <h3 className="mt-1 text-base font-semibold text-foreground">{mod}</h3>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const { courses, capstone } = journey;

  return (
    <div data-specialization-journey className={cn("space-y-8", className)}>
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            Structured Learning Pathway
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground">
            {courses.length} progressive courses + capstone
          </span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Included Courses & Progressive Journey
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every course block develops a distinct technical layer, complete with practical chapters,
          an individual portfolio project, and a clear architectural bridge into the subsequent course.
        </p>
      </div>

      {/* Progressive Courses Learning Journey */}
      <ol className="relative space-y-6 border-l-2 border-border/80 pl-4 sm:pl-8 ml-3 sm:ml-4">
        {courses.map((c, index) => {
          const isLastCourse = index === courses.length - 1;

          return (
            <Reveal key={c.courseNumber} delay={Math.min(index * 40, 300)}>
              <li
                data-spec-course-block
                className="relative group rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-soft transition-all duration-300 hover:border-cyan/40 hover:shadow-card"
              >
                {/* Connecting Node Pin on Left Margin */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] sm:-left-[43px] top-7 grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full border-2 border-background bg-accent text-[10px] sm:text-xs font-bold font-mono text-primary shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  {c.courseNumber}
                </span>

                {/* Course Header: Number, Title, Duration & Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-1 font-mono text-[11px] font-semibold text-primary uppercase">
                      <BookOpen className="h-3 w-3" />
                      Course {String(c.courseNumber).padStart(2, "0")}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3 text-cyan" /> {c.durationEstimate}
                    </span>
                  </div>

                  {c.courseSlug && (
                    <Link
                      to="/courses/$slug"
                      params={{ slug: c.courseSlug }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-cyan transition-colors"
                    >
                      <span>View syllabus</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {/* Course Name */}
                <div className="mt-4">
                  <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                    {c.courseTitle}
                  </h3>
                </div>

                {/* Core Chapters */}
                <div className="mt-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Core Chapters & Key Competencies
                  </span>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {c.coreChapters.map((chapter) => (
                      <li
                        key={chapter}
                        className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs text-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cyan shrink-0" />
                        <span>{chapter}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Course Practical Project */}
                <div className="mt-4 rounded-2xl border border-cyan/30 bg-cyan/5 p-3.5 sm:p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan">
                    <Terminal className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-[11px] uppercase tracking-wider">
                      Portfolio Project Milestone
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm font-medium text-foreground">
                    {c.projectTitle}
                  </p>
                </div>

                {/* Progression Relationship with Next Course */}
                <div className="mt-3.5 rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-3.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      {isLastCourse ? "Path to Final Capstone" : `Progression to Course ${String(c.courseNumber + 1).padStart(2, "0")}`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed">{c.progressionNote}</p>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>

      {/* Final Prominent Capstone Section */}
      <Reveal delay={120}>
        <div
          data-capstone-project
          className="relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-8 shadow-card"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-2xl"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold-foreground border border-gold/40 shadow-soft">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gold-foreground font-semibold">
                  Comprehensive Track Capstone
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  {capstone.title}
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 border border-gold/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-foreground">
              <Sparkles className="h-3 w-3" /> Final Milestone
            </span>
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {capstone.description}
          </p>

          {/* Capstone Deliverables */}
          <div className="mt-5">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-foreground">
              Required Portfolio Deliverables
            </span>
            <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {capstone.deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-2xl border border-gold/20 bg-background/80 p-3 text-xs font-medium text-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-gold-foreground shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evaluation Review Format */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-gold-foreground" />
              <span>
                Evaluation Method: <strong className="text-foreground">{capstone.reviewFormat}</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] text-gold-foreground font-semibold">
              Included in fixed tuition
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

