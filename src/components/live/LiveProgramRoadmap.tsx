import { Award, CheckCircle2, Layers } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { LiveOffer } from "@/data/liveOffers";

export function LiveProgramRoadmap({ offer }: { offer: LiveOffer }) {
  return (
    <section className="py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 border-b border-border/60 pb-5">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              PROGRESSIVE SYLLABUS ARCHITECTURE
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Structured Roadmap & Milestones
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every phase is engineered to take you from foundational concepts to working
              implementation.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-primary shrink-0">
            <Layers className="h-4 w-4" /> {offer.roadmap.length} Progressive Phases
          </span>
        </div>
      </Reveal>

      {/* Structured Technical Timeline */}
      <div className="relative space-y-6 before:absolute before:inset-0 before:left-3.5 sm:before:left-5 before:h-full before:w-0.5 before:bg-border/80">
        {offer.roadmap.map((phase, idx) => (
          <Reveal key={phase.title} delay={idx * 40}>
            <div className="relative flex items-start gap-4 sm:gap-6 pl-1 sm:pl-2">
              {/* Timeline Node */}
              <div className="relative z-10 grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-card border-2 border-primary font-mono text-xs sm:text-sm font-bold text-primary shadow-sm">
                {idx + 1}
              </div>

              {/* Phase Content Box */}
              <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft transition-colors hover:border-primary/40">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {phase.phase}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                      {phase.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Phase {idx + 1} of {offer.roadmap.length}
                  </span>
                </div>

                {/* Topics list */}
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {phase.topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>

                {/* Milestone Outcome */}
                {phase.outcome && (
                  <div className="mt-4 rounded-xl bg-muted/50 p-3.5 text-xs text-foreground/90 flex items-start gap-2.5 border border-border/50">
                    <Award className="h-4 w-4 shrink-0 text-gold-foreground mt-0.5" />
                    <div>
                      <strong className="text-foreground">Phase Milestone Outcome: </strong>
                      <span className="text-muted-foreground">{phase.outcome}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
