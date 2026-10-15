import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Clock, Sparkles } from "lucide-react";
import { Icon } from "@/components/Icon";
import { getSpecializationCatalogVisual, deriveSpecializationTags } from "@/data/catalogVisuals";
import type { Specialization } from "@/data/specializations";
import { getSpecializationRoadmap } from "@/data/specializationRoadmaps";
import { cn } from "@/lib/utils";

export function SpecializationCatalogCard({
  spec,
  className,
}: {
  spec: Specialization;
  className?: string;
}) {
  const visual = getSpecializationCatalogVisual(spec.slug);
  const tags = deriveSpecializationTags(spec.modules);
  const roadmap = getSpecializationRoadmap(spec.slug);

  return (
    <Link
      to="/specializations/$slug"
      params={{ slug: spec.slug }}
      data-specialization-card={spec.slug}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      {/* Editorial Media Frame */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-hero">
        <img
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none",
            visual.objectPosition ?? "object-center",
          )}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent"
        />

        {roadmap && (
          <span className="glass absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-navy-deep/80 px-2.5 py-1 font-mono text-[11px] font-bold text-gold shadow-sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {roadmap.groupDiscount} · {roadmap.groupFee}
          </span>
        )}

        {/* Floating Glass Icon */}
        <span className="glass absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl text-cyan shadow-soft transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none">
          <Icon name={spec.icon} className="h-6 w-6" />
        </span>

        {/* Floating Duration Badge */}
        <span className="glass absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5 text-cyan" aria-hidden="true" /> {spec.duration}
        </span>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
            {visual.badge}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground">
            <BarChart3 className="h-3 w-3 text-gold-foreground" /> {spec.level}
          </span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {spec.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-gold-foreground">{spec.tagline}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
          {spec.summary}
        </p>

        {/* Derived Authentic Technology Chips */}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-primary/10 bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-primary"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {roadmap && (
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-gold-foreground">
                Group: {roadmap.groupFee}
              </span>
              <span className="font-mono font-bold text-success">{roadmap.groupDiscount}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-muted-foreground">
              <span>One-to-one: {roadmap.oneToOneFee}</span>
              <span>{roadmap.groupSize} · 4 classes/week</span>
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs font-medium text-muted-foreground">
            {roadmap
              ? `${roadmap.courses.length} included courses`
              : `${spec.modules.length} progressive modules`}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-gold-foreground transition-colors">
            Explore track
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}
