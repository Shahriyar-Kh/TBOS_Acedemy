import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, Database, FolderGit2, Radio, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeImage } from "@/components/home/HomeImage";
import { homeImages } from "@/data/homepage";
import { cn } from "@/lib/utils";

const credibility = [
  "Live instructor-led classes",
  "Project-based learning",
  "One-to-one & group formats",
];

// Staggered CSS entrance (SSR-safe: pure CSS, no hydration state).
const stagger = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero pb-28 sm:pb-32">
      {/* Background: grid, glows, orbs (CSS only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-tech-grid mask-fade-radial opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 animate-orb rounded-full bg-cyan/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 animate-orb rounded-full bg-gold/15 blur-3xl [animation-delay:-9s]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 container-px pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-24">
        {/* Copy */}
        <div>
          <span
            className="animate-fade-up glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan"
            style={stagger(0)}
          >
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" /> Modern Technical Academy
          </span>

          <h1 className="mt-6 font-display text-[2.45rem] font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-5xl lg:text-[3.4rem] xl:text-[4rem]">
            <span className="animate-fade-up block" style={stagger(80)}>
              Build Real
            </span>{" "}
            <span className="animate-fade-up block text-gradient-cyan" style={stagger(180)}>
              Technical Skills
            </span>{" "}
            <span className="animate-fade-up block" style={stagger(280)}>
              for the Modern Digital World
            </span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg"
            style={stagger(380)}
          >
            Live, instructor-led online programs in Python, web development, data analysis and AI/ML
            foundations — built around real projects and structured learning paths, for learners
            across Pakistan and worldwide.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
            style={stagger(480)}
          >
            <Button
              asChild
              variant="hero"
              size="xl"
              className="group font-semibold active:scale-[0.98]"
            >
              <Link to="/apply">
                Apply Now
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline-light"
              size="xl"
              className="group font-semibold active:scale-[0.98]"
            >
              <a href="#live-programs">
                Explore Live Programs
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:rotate-90" />
              </a>
            </Button>
          </div>

          <ul className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-3" style={stagger(580)}>
            {credibility.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-primary-foreground/90"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-cyan" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>

          <p
            className="animate-fade-up mt-6 text-sm text-primary-foreground/70"
            style={stagger(660)}
          >
            Not sure yet?{" "}
            <Link
              to="/free-demo"
              className="font-semibold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Request a Free Demo
            </Link>{" "}
            — a trial session only, so you can see the classroom before enrolling.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Visual composition                                                  */
/* ------------------------------------------------------------------ */

function Layer({
  children,
  className,
  depth = 1,
}: {
  children: ReactNode;
  className?: string;
  /** Parallax strength multiplier (desktop pointer only). */
  depth?: number;
}) {
  return (
    <div
      className={cn("absolute", className)}
      style={{
        translate: `calc(var(--mx, 0) * ${18 * depth}px) calc(var(--my, 0) * ${14 * depth}px)`,
        transition: "translate 350ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

function HeroVisual() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Pointer parallax: fine pointers + no reduced-motion only. Writes CSS vars, never React state.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!query.matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        el.style.setProperty("--my", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const hero = homeImages.hero;

  return (
    <div
      ref={rootRef}
      className="animate-fade-up relative mx-auto w-full max-w-[32rem] lg:max-w-none"
      style={stagger(240)}
    >
      {/* Main image card */}
      <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2rem] border border-primary-foreground/15 shadow-card ring-1 ring-cyan/20 sm:aspect-[4/5]">
        <HomeImage
          src={hero.src}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          priority
          sizes="(min-width: 1024px) 480px, (min-width: 640px) 512px, 92vw"
          className="h-full w-full object-cover"
          fallback={<Terminal className="h-20 w-20 text-cyan/60" aria-hidden="true" />}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/10 to-transparent"
        />
      </div>

      {/* Live class indicator */}
      <Layer className="left-3 top-3 sm:-left-4 sm:top-8" depth={1.2}>
        <div className="animate-float-slow">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
            <span className="relative grid h-2.5 w-2.5 place-items-center">
              <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-success" />
            </span>
            <Radio className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
            Live online classes
          </div>
        </div>
      </Layer>

      {/* Focus badges */}
      <Layer className="right-3 top-16 sm:-right-5 sm:top-24" depth={1.6}>
        <ul className="flex flex-col items-end gap-2.5">
          {[
            { label: "Python", icon: Terminal, delay: "0s" },
            { label: "Data", icon: Database, delay: "-3s" },
            { label: "AI / ML", icon: Bot, delay: "-6s" },
          ].map(({ label, icon: BadgeIcon, delay }) => (
            <li key={label} className="animate-float-slow" style={{ animationDelay: delay }}>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
                <BadgeIcon className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Layer>

      {/* Terminal panel (decorative) */}
      <Layer
        className="inset-x-3 bottom-4 sm:-left-8 sm:right-auto sm:w-[19.5rem] lg:-left-10"
        depth={0.8}
      >
        <div
          aria-hidden="true"
          className="animate-drift rounded-2xl border border-primary-foreground/15 bg-navy-deep/85 p-4 font-mono text-[12px] leading-6 shadow-card backdrop-blur-md"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
            <span className="ml-2 text-[11px] text-primary-foreground/50">learn.py</span>
          </div>
          <p className="text-primary-foreground/45"># 100 days of Python</p>
          <p className="text-primary-foreground/90">
            <span className="text-cyan">for</span> day <span className="text-cyan">in</span> range(
            <span className="text-gold">1</span>, <span className="text-gold">101</span>):
          </p>
          <p className="pl-5 text-primary-foreground/90">
            learn(<span className="text-emerald-300">"Python"</span>)
          </p>
          <p className="pl-5 text-primary-foreground/90">
            build(<span className="text-emerald-300">"a real project"</span>)
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-caret bg-cyan" />
          </p>
        </div>
      </Layer>

      {/* Project-based learning card */}
      <Layer className="-bottom-5 right-4 hidden sm:block lg:-right-6" depth={1.4}>
        <div className="animate-float-slow [animation-delay:-4s]">
          <div className="glass-light flex items-center gap-3 rounded-2xl p-3.5 pr-5 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <FolderGit2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Build real projects</p>
              <p className="text-xs text-muted-foreground">From first script to capstone</p>
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
