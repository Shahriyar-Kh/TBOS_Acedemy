import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, BarChart3 } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/data/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
          <Icon name={course.icon} className="h-6 w-6" />
        </span>
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          {course.category}
        </Badge>
      </div>
      <h3 className="mt-5 text-xl font-bold text-foreground">{course.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {course.summary}
      </p>
      <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gold-foreground" /> {course.duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-gold-foreground" /> {course.level}
        </span>
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-gold-foreground">
        View course
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
