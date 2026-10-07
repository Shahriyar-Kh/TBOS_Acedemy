import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Clock } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { HomeImage } from "@/components/home/HomeImage";
import { SectionIntro } from "@/components/home/HomeSections";
import {
  courseTags,
  getCourseVisual,
  getSpecializationVisual,
  homeCourses,
  homeSpecializations,
  specializationTags,
  type CourseVisualMotif,
} from "@/data/homepage";
import type { Course } from "@/data/courses";
import type { Specialization } from "@/data/specializations";
import { cn } from "@/lib/utils";

const cardBase =
  "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {items.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-primary/10 bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Specializations (PART B — Unique Specialization Imagery)           */
/* ------------------------------------------------------------------ */

function SpecializationTile({ spec }: { spec: Specialization }) {
  const visual = getSpecializationVisual(spec.slug);

  return (
    <Link
      to="/specializations/$slug"
      params={{ slug: spec.slug }}
      className={cn(cardBase, "hover:border-cyan/50 hover:shadow-card")}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-hero">
        <HomeImage
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
          className={`h-full w-full object-cover ${visual.objectPosition ?? "object-center"} transition-transform duration-700 group-hover:scale-105`}
          fallback={<Icon name={spec.icon} className="h-14 w-14 text-cyan/60" />}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent"
        />
        <span className="glass absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl text-cyan transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-soft">
          <Icon name={spec.icon} className="h-6 w-6" />
        </span>
        <span className="glass absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5 text-cyan" aria-hidden="true" /> {spec.duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          {spec.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-gold-foreground">{spec.tagline}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {spec.summary}
        </p>
        <Chips items={specializationTags[spec.slug] ?? []} />
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {spec.level}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Explore
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SpecializationsSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dots mask-fade-b opacity-50"
      />
      <div className="relative mx-auto max-w-7xl container-px py-20 sm:py-24">
        <SectionIntro
          eyebrow="Developer tracks"
          title="Structured Specialization Roadmaps"
          description="Multi-module, mentor-led learning paths that take you from fundamentals to practical software, data and AI work."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeSpecializations.map((spec, i) => (
            <Reveal key={spec.slug} delay={(i % 3) * 80} className="h-full">
              <SpecializationTile spec={spec} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Button
            asChild
            variant="default"
            size="xl"
            className="group font-semibold active:scale-[0.98]"
          >
            <Link to="/specializations">
              View All Specializations
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Courses (PART C — Unique Technical Visual Headers)                 */
/* ------------------------------------------------------------------ */

function CourseMotif({ motif }: { motif: CourseVisualMotif }): ReactNode {
  switch (motif) {
    case "terminal":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-3 font-mono text-[10px] leading-relaxed text-emerald-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] uppercase tracking-wider text-emerald-400/80">cli</span>
          </div>
          <span className="block">&gt;&gt;&gt; import app</span>
          <span className="block">&gt;&gt;&gt; app.run()</span>
          <span className="block text-emerald-300/60">&gt; build() ▋</span>
        </div>
      );
    case "code-block":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-3 font-mono text-[10px] leading-relaxed text-amber-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80">js</span>
          </div>
          <span className="block">async () =&gt; &#123;</span>
          <span className="block pl-2 text-amber-300/60">await fetch();</span>
          <span className="block">&#125;</span>
        </div>
      );
    case "orbitals":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-cyan/25 select-none transition-transform duration-700 group-hover:rotate-12"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <ellipse cx="50" cy="50" rx="42" ry="16" strokeWidth="1.2" transform="rotate(30 50 50)" />
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="16"
            strokeWidth="1.2"
            transform="rotate(-30 50 50)"
          />
          <ellipse cx="50" cy="50" rx="42" ry="16" strokeWidth="1.2" transform="rotate(90 50 50)" />
          <circle cx="50" cy="50" r="3.5" fill="currentColor" />
        </svg>
      );
    case "relational-grid":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-24 w-28 text-indigo-400/30 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="5" y="5" width="90" height="70" rx="4" strokeWidth="1.4" />
          <line x1="5" y1="24" x2="95" y2="24" strokeWidth="1.4" />
          <line x1="36" y1="5" x2="36" y2="75" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="68" y1="5" x2="68" y2="75" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="5" y1="48" x2="95" y2="48" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );
    case "analytical-chart":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-4 h-20 w-28 text-gold/30 select-none transition-transform duration-700 group-hover:translate-y-[-2px]"
          viewBox="0 0 100 60"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="8,48 28,34 48,40 68,18 92,10" strokeWidth="2" />
          <rect x="22" y="34" width="6" height="14" fill="currentColor" fillOpacity="0.35" />
          <rect x="42" y="40" width="6" height="8" fill="currentColor" fillOpacity="0.35" />
          <rect x="62" y="18" width="6" height="30" fill="currentColor" fillOpacity="0.35" />
          <rect x="82" y="10" width="6" height="38" fill="currentColor" fillOpacity="0.35" />
          <line x1="4" y1="48" x2="96" y2="48" strokeWidth="1.4" />
        </svg>
      );
    case "model-pipeline":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-24 w-32 text-purple-400/30 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 120 70"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="18" cy="22" r="5" strokeWidth="1.4" />
          <circle cx="18" cy="48" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="16" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="35" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="54" r="5" strokeWidth="1.4" />
          <circle cx="98" cy="35" r="5" strokeWidth="1.4" fill="currentColor" fillOpacity="0.5" />
          <line x1="23" y1="22" x2="53" y2="16" strokeWidth="1" />
          <line x1="23" y1="22" x2="53" y2="35" strokeWidth="1" />
          <line x1="23" y1="48" x2="53" y2="35" strokeWidth="1" />
          <line x1="23" y1="48" x2="53" y2="54" strokeWidth="1" />
          <line x1="63" y1="16" x2="93" y2="35" strokeWidth="1" />
          <line x1="63" y1="35" x2="93" y2="35" strokeWidth="1" />
          <line x1="63" y1="54" x2="93" y2="35" strokeWidth="1" />
        </svg>
      );
  }
}

function CourseTile({ course }: { course: Course }) {
  const visual = getCourseVisual(course.slug);

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className={cn(cardBase, visual.borderGlow, "hover:shadow-card")}
    >
      {/* Unique technical visual header */}
      <div
        className={cn(
          "relative flex h-36 items-end justify-between overflow-hidden bg-gradient-to-br p-5",
          visual.bgGradient,
        )}
      >
        {/* Subtle grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-tech-grid opacity-60"
        />

        {/* Ambient accent glow */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100",
            visual.glowColor,
          )}
        />

        {/* Unique technical motif shape */}
        <CourseMotif motif={visual.motif} />

        {/* Course icon */}
        <span className="glass relative grid h-12 w-12 place-items-center rounded-2xl text-cyan shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <Icon name={course.icon} className="h-6 w-6" />
        </span>

        {/* Category tag */}
        <span className="relative rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-gold-foreground shadow-sm">
          {course.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.summary}
        </p>
        <Chips items={courseTags[course.slug] ?? []} />
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {course.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {course.level}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
            View Course
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CoursesSection() {
  return (
    <section className="relative overflow-hidden bg-muted/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-tech-grid-light mask-fade-radial opacity-60"
      />
      <div className="relative mx-auto max-w-7xl container-px py-20 sm:py-24">
        <SectionIntro
          eyebrow="Popular courses"
          title="Programming, Data & AI Courses"
          description="Practical, instructor-led online courses across programming, web development, databases and data & AI — with hands-on projects built into the curriculum."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeCourses.map((course, i) => (
            <Reveal key={course.slug} delay={(i % 3) * 80} className="h-full">
              <CourseTile course={course} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Button
            asChild
            variant="default"
            size="xl"
            className="group font-semibold active:scale-[0.98]"
          >
            <Link to="/courses">
              Explore All Courses
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
