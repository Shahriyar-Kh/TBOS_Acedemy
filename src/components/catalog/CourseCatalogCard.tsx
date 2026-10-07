import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, BarChart3 } from "lucide-react";
import { CourseVisual } from "@/components/catalog/CourseVisual";
import { getCourseCatalogVisual } from "@/data/catalogVisuals";
import type { Course } from "@/data/courses";
import { cn } from "@/lib/utils";

export function CourseCatalogCard({ course, className }: { course: Course; className?: string }) {
  const visual = getCourseCatalogVisual(course.slug);

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      data-course-card={course.slug}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        visual.borderGlow,
        className,
      )}
    >
      {/* Unique Visual Header with Technical Motif */}
      <CourseVisual visual={visual} iconName={course.icon} />

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-2 pt-4">
        {/* Category & Level Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {course.category}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground">
            <BarChart3 className="h-3 w-3 text-gold-foreground" />
            {course.level}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-gold-foreground">
          {visual.tagline || course.tagline}
        </p>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {course.summary}
        </p>

        {/* Chips from keywords / curriculum */}
        {course.keywords && course.keywords.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {course.keywords.slice(0, 3).map((kw) => (
              <li
                key={kw}
                className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {kw}
              </li>
            ))}
          </ul>
        )}

        {/* Card Footer: Duration & CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-gold-foreground" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-gold-foreground transition-colors">
            View course
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
