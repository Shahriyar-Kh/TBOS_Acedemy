import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import type { TutoringSubject } from "@/data/tutoring";

export function TutoringCatalogCard({
  subject,
  compact = false,
}: {
  subject: TutoringSubject;
  compact?: boolean;
}) {
  const type =
    subject.category === "Quran & Islamic Studies" ? "Quran & Islamic Studies" : "Academic Tutoring";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card">
      <Link
        to="/tutoring/$slug"
        params={{ slug: subject.slug }}
        className="relative block overflow-hidden border-b border-border/70 bg-gradient-hero p-6 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan/15 blur-2xl"
        />
        <div className="relative flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-primary-foreground/15 bg-white/10 text-cyan shadow-soft backdrop-blur-sm">
            <Icon name={subject.icon} className="h-6 w-6" />
          </span>
          <span className="rounded-full border border-primary-foreground/15 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/85">
            {subject.level}
          </span>
        </div>
        <p className="relative mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
          {subject.category}
        </p>
        <h3 className="relative mt-1 font-display text-xl font-bold text-primary-foreground">
          {subject.title}
        </h3>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{subject.summary}</p>

        {!compact && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {subject.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-lg border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/70 pt-5">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link to="/free-demo" search={{ type, selected: subject.title }}>
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Free Demo
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs">
            <Link to="/tutoring/$slug" params={{ slug: subject.slug }}>
              View details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Link
          to="/apply"
          search={{ type, selected: subject.title }}
          className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Request this tutor <BookOpen className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
