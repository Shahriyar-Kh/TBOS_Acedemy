import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Clock } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { HomeImage } from "@/components/home/HomeImage";
import { SectionIntro } from "@/components/home/HomeSections";
import {
  courseTags,
  homeCourses,
  homeImages,
  homeSpecializations,
  imageForSpecialization,
  specializationTags,
} from "@/data/homepage";
import type { Course } from "@/data/courses";
import type { Specialization } from "@/data/specializations";

const cardBase =
  "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
/* Specializations                                                     */
/* ------------------------------------------------------------------ */

function SpecializationTile({ spec, index }: { spec: Specialization; index: number }) {
  const image = homeImages[imageForSpecialization(spec.slug)];
  // Same photo can serve two cards; vary the crop so neighbours don't look identical.
  const position = index % 2 === 0 ? "object-left" : "object-right";

  return (
    <Link to="/specializations/$slug" params={{ slug: spec.slug }} className={cardBase}>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-hero">
        <HomeImage
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
          className={`h-full w-full object-cover ${position} transition-transform duration-700 group-hover:scale-105`}
          fallback={<Icon name={spec.icon} className="h-14 w-14 text-cyan/60" />}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/20 to-transparent"
        />
        <span className="glass absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl text-cyan transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <Icon name={spec.icon} className="h-6 w-6" />
        </span>
        <span className="glass absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
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
              <SpecializationTile spec={spec} index={i} />
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
/* Courses                                                             */
/* ------------------------------------------------------------------ */

function CourseTile({ course }: { course: Course }) {
  return (
    <Link to="/courses/$slug" params={{ slug: course.slug }} className={cardBase}>
      {/* Technical header: gradient + grid + oversized icon (no photo needed) */}
      <div className="relative flex h-32 items-end justify-between overflow-hidden bg-gradient-hero p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-tech-grid opacity-70"
        />
        <Icon
          name={course.icon}
          className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rotate-12 text-primary-foreground/10 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110"
        />
        <span className="glass relative grid h-12 w-12 place-items-center rounded-2xl text-cyan transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <Icon name={course.icon} className="h-6 w-6" />
        </span>
        <span className="relative rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-gold-foreground">
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
