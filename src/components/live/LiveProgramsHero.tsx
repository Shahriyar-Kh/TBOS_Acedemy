import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles, Users, Calendar, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function LiveProgramsHero() {
  const factualChips = [
    { label: "3 Active Group Programs", icon: Users },
    { label: "Live Online Classes", icon: Calendar },
    { label: "Free Demo Trial Available", icon: Sparkles },
    { label: "Structured Phase Roadmaps", icon: ShieldCheck },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 sm:py-24">
      {/* Background technical motifs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dots opacity-25" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-cyan/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl container-px text-center">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center justify-center gap-1.5 text-xs text-primary-foreground/75"
        >
          <Link to="/" className="hover:text-cyan transition-colors">
            Home
          </Link>
          <span className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-primary-foreground/95 font-medium">Live Batches</span>
          </span>
        </nav>

        {/* Eyebrow */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
            LIVE INSTRUCTOR-LED PROGRAMS
          </span>
        </Reveal>

        {/* H1 Heading */}
        <Reveal delay={60}>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Learn Live. Build Skills with Structure.
          </h1>
        </Reveal>

        {/* Supporting Description */}
        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
            Join scheduled online cohorts built around real instruction, guided practice, technical
            milestones, and mentor feedback. Experience authentic text-based programming in
            collaborative live sessions.
          </p>
        </Reveal>

        {/* Factual Chips */}
        <Reveal delay={180}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {factualChips.map((chip) => {
              const IconComp = chip.icon;
              return (
                <span
                  key={chip.label}
                  className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary-foreground/95 shadow-sm"
                >
                  <IconComp className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
                  {chip.label}
                </span>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
