import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { Icon } from "@/components/Icon";
import type { Specialization } from "@/data/specializations";

export function SpecializationCard({ spec }: { spec: Specialization }) {
  return (
    <Link
      to="/specializations/$slug"
      params={{ slug: spec.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-gold opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
        <Icon name={spec.icon} className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-xl font-bold text-foreground">{spec.title}</h3>
      <p className="mt-1 text-sm font-medium text-gold-foreground">{spec.tagline}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {spec.summary}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-gold-foreground" /> {spec.duration}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-gold-foreground">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
