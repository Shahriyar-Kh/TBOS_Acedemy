import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  BadgeCheck,
  BookOpenCheck,
  Bot,
  Braces,
  CalendarClock,
  Code2,
  Compass,
  Database,
  FileCode,
  FolderGit2,
  GitBranch,
  Globe,
  HeartHandshake,
  Laptop,
  Layers,
  LineChart,
  MessageCircle,
  MonitorPlay,
  Rocket,
  Route as RouteIcon,
  Server,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/data/courses";
import { getSpecialization } from "@/data/specializations";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared heading                                                      */
/* ------------------------------------------------------------------ */

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
          light
            ? "border-primary-foreground/20 bg-primary-foreground/10 text-cyan"
            : "border-primary/15 bg-accent text-primary",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", light ? "bg-cyan" : "bg-gold")}
        />
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]",
          light ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            light ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Trust / value strip                                                 */
/* ------------------------------------------------------------------ */

const trustItems: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: Laptop, title: "Live Interactive Classes", sub: "Instructor-led, online" },
  { icon: FolderGit2, title: "Project-Based Learning", sub: "Build as you learn" },
  { icon: Terminal, title: "Programming & AI Focus", sub: "Python, web, data, ML" },
  { icon: Users, title: "One-to-One + Group", sub: "Pick the format that fits" },
  { icon: RouteIcon, title: "Structured Roadmaps", sub: "Fundamentals to capstone" },
];

export function TrustStrip() {
  return (
    <section aria-label="Academy highlights" className="relative z-10 -mt-14 sm:-mt-16">
      <div className="mx-auto max-w-7xl container-px">
        <Reveal className="glass-light grid grid-cols-2 gap-px overflow-hidden rounded-3xl shadow-card sm:grid-cols-3 lg:grid-cols-5">
          {trustItems.map(({ icon: ItemIcon, title, sub }) => (
            <div
              key={title}
              className="group flex items-start gap-3 bg-card/70 p-4 transition-colors duration-300 hover:bg-card last:col-span-2 sm:p-5 sm:last:col-span-1"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <ItemIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why TechBuilt Open School                                           */
/* NOTE: keep the brand name OUT of this <h2>. The FAQ already renders */
/* one heading containing it, and the Playwright homepage test uses a  */
/* strict getByRole("heading", { name: /techbuilt open school/i }).    */
/* ------------------------------------------------------------------ */

const differentiators: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Laptop,
    title: "Live Instructor-Led Learning",
    desc: "Every session is live. Your instructor answers questions, reviews your code and explains concepts in real time.",
  },
  {
    icon: FolderGit2,
    title: "Build Real Projects",
    desc: "Courses and programs finish with practical projects, so you leave with working code, not just notes.",
  },
  {
    icon: Compass,
    title: "Structured Learning Paths",
    desc: "Clear roadmaps and weekly milestones take you from fundamentals through to specialization-level work.",
  },
  {
    icon: Rocket,
    title: "Technical Skills for Modern Careers",
    desc: "Python, web development, databases, data analysis and AI/ML foundations — the skills modern teams use.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Online Learning",
    desc: "Learn from anywhere in Pakistan or worldwide, with one-to-one and small-group options.",
  },
  {
    icon: HeartHandshake,
    title: "Guided Support",
    desc: "A real admissions team helps you choose the right program, and instructors keep you moving with feedback.",
  },
];

export function WhySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-tech-grid-light mask-fade-b opacity-60"
      />
      <div className="relative mx-auto max-w-7xl container-px py-20 sm:py-24">
        <SectionIntro
          eyebrow="Why TechBuilt Open School"
          title="A technical academy built around real skills"
          description="Live teaching, hands-on projects and clear learning paths that take you from your first line of code to real-world skills."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item, i) => (
            <Reveal key={item.title} delay={i * 70} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan/50 hover:shadow-card">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-6 top-5 font-display text-3xl font-extrabold text-accent transition-colors duration-300 group-hover:text-cyan/40"
                >
                  0{i + 1}
                </span>
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Learning journey                                                    */
/* ------------------------------------------------------------------ */

const journey: { icon: LucideIcon; title: string; desc: string; tags: string[] }[] = [
  {
    icon: BookOpenCheck,
    title: "Learn Foundations",
    desc: "Start with the fundamentals — programming logic, data, databases and the web — taught live by an instructor.",
    tags: ["Python", "JavaScript", "SQL"],
  },
  {
    icon: Workflow,
    title: "Practice with Guided Exercises",
    desc: "Apply every concept straight away with guided exercises and instructor feedback on your code.",
    tags: ["Guided exercises", "Code review"],
  },
  {
    icon: FolderGit2,
    title: "Build Real Projects",
    desc: "Combine your skills in practical projects and capstones that you can show and explain.",
    tags: ["Projects", "Capstones"],
  },
  {
    icon: Layers,
    title: "Advance into Specializations",
    desc: "Go deeper with structured roadmaps in backend, full-stack, frontend, data and AI/ML.",
    tags: ["Roadmaps", "Multi-module paths"],
  },
];

export function LearningJourney() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-tech-grid mask-fade-radial opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 -z-10 h-72 w-72 animate-orb rounded-full bg-cyan/15 blur-3xl"
      />
      <div className="mx-auto max-w-7xl container-px py-20 sm:py-24">
        <SectionIntro
          light
          eyebrow="Learning journey"
          title="From first line of code to real projects"
          description="A clear path from foundations to specialization — every stage builds on the last."
        />

        <div className="relative mt-16">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px animate-flow bg-[linear-gradient(90deg,var(--cyan)_50%,transparent_50%)] bg-[length:16px_1px] opacity-60 lg:block"
          />

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {journey.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 110}
                className="relative flex gap-5 lg:flex-col lg:gap-0"
              >
                {/* Mobile connector */}
                {i < journey.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-8 top-16 -bottom-10 w-px bg-gradient-to-b from-cyan/60 to-transparent lg:hidden"
                  />
                )}
                <div className="relative z-10 shrink-0 lg:mx-auto">
                  <span className="glass grid h-16 w-16 place-items-center rounded-2xl text-cyan shadow-soft">
                    <step.icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] font-extrabold text-gold-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="group lg:mt-6 lg:flex-1">
                  <div className="glass h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40">
                    <h3 className="text-lg font-bold text-primary-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">
                      {step.desc}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {step.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[11px] font-medium text-primary-foreground/85"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="hero"
            size="xl"
            className="group font-semibold active:scale-[0.98]"
          >
            <Link to="/courses">
              Start with a Course
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline-light"
            size="xl"
            className="font-semibold active:scale-[0.98]"
          >
            <Link to="/specializations">See Specialization Roadmaps</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Technologies (validated against the real catalog)                   */
/* ------------------------------------------------------------------ */

type TechTarget = { kind: "course" | "specialization"; slug: string };

const techStack: { name: string; note: string; icon: LucideIcon; target: TechTarget }[] = [
  {
    name: "Python",
    note: "Core language",
    icon: Terminal,
    target: { kind: "course", slug: "python" },
  },
  {
    name: "Django",
    note: "Backend framework",
    icon: Server,
    target: { kind: "specialization", slug: "backend-developer" },
  },
  {
    name: "FastAPI",
    note: "Async APIs",
    icon: Zap,
    target: { kind: "specialization", slug: "backend-developer" },
  },
  {
    name: "JavaScript",
    note: "Web logic",
    icon: Braces,
    target: { kind: "course", slug: "javascript" },
  },
  {
    name: "TypeScript",
    note: "Typed JavaScript",
    icon: FileCode,
    target: { kind: "course", slug: "typescript" },
  },
  { name: "React", note: "Interfaces", icon: Atom, target: { kind: "course", slug: "react" } },
  {
    name: "Next.js",
    note: "Full-stack React",
    icon: Globe,
    target: { kind: "course", slug: "nextjs" },
  },
  { name: "SQL", note: "Relational data", icon: Database, target: { kind: "course", slug: "sql" } },
  {
    name: "Data Analysis",
    note: "Insights & EDA",
    icon: LineChart,
    target: { kind: "course", slug: "data-analysis-foundations" },
  },
  {
    name: "AI / ML Foundations",
    note: "Models & evaluation",
    icon: Bot,
    target: { kind: "course", slug: "ai-ml-foundations" },
  },
  {
    name: "REST APIs",
    note: "Service design",
    icon: Code2,
    target: { kind: "course", slug: "rest-apis" },
  },
  {
    name: "Git & GitHub",
    note: "Version control",
    icon: GitBranch,
    target: { kind: "course", slug: "git-github" },
  },
];

// Only show technologies whose target page really exists in the catalog.
const verifiedTech = techStack.filter(({ target }) =>
  target.kind === "course"
    ? Boolean(getCourse(target.slug))
    : Boolean(getSpecialization(target.slug)),
);

const techChipClass =
  "group flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-cyan/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TechStackSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dots mask-fade-radial opacity-50"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 container-px py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionIntro
          align="left"
          eyebrow="Modern tech skills"
          title="The technologies you'll learn"
          description="Everything here is part of our course catalog and specialization roadmaps. Pick a technology to see where it is taught."
          className="mx-0"
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {verifiedTech.map(({ name, note, icon: TechIcon, target }, i) => (
            <Reveal as="li" key={name} delay={(i % 6) * 50}>
              {target.kind === "course" ? (
                <Link to="/courses/$slug" params={{ slug: target.slug }} className={techChipClass}>
                  <TechChipBody
                    name={name}
                    note={note}
                    icon={<TechIcon className="h-5 w-5" aria-hidden="true" />}
                  />
                </Link>
              ) : (
                <Link
                  to="/specializations/$slug"
                  params={{ slug: target.slug }}
                  className={techChipClass}
                >
                  <TechChipBody
                    name={name}
                    note={note}
                    icon={<TechIcon className="h-5 w-5" aria-hidden="true" />}
                  />
                </Link>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TechChipBody({ name, note, icon }: { name: string; note: string; icon: ReactNode }) {
  return (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-tight text-foreground">{name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{note}</span>
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA (sits across the light → navy boundary into the footer)   */
/* ------------------------------------------------------------------ */

const ctaTile =
  "group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]";

export function FinalCta() {
  return (
    <section
      className="relative"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, var(--background) 0, var(--background) 52%, oklch(0.26 0.08 262) 52%)",
      }}
    >
      <div className="mx-auto max-w-7xl container-px pb-14 pt-16 sm:pb-16 sm:pt-20">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-hero px-6 py-12 shadow-card ring-1 ring-primary-foreground/10 sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-tech-grid mask-fade-radial opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 animate-orb rounded-full bg-gold/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-64 w-64 animate-orb rounded-full bg-cyan/20 blur-3xl [animation-delay:-8s]"
          />

          <div className="mx-auto max-w-2xl text-center">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Start learning
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-4xl lg:text-[2.6rem]">
              Ready to build real technical skills?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              Choose how you'd like to begin — browse the live programs, apply directly, try a demo
              session, or talk to our admissions team.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/live-batches"
              className={cn(ctaTile, "glass hover:border-cyan/50 hover:bg-primary-foreground/15")}
            >
              <Layers className="h-6 w-6 text-cyan" aria-hidden="true" />
              <span className="mt-4 text-base font-bold text-primary-foreground">
                Explore Live Programs
              </span>
              <span className="mt-1 flex-1 text-sm text-primary-foreground/70">
                See the current live group cohorts.
              </span>
              <ArrowRight className="mt-4 h-4 w-4 text-cyan transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/apply"
              className={cn(
                ctaTile,
                "bg-gold text-gold-foreground shadow-gold hover:brightness-105",
              )}
            >
              <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              <span className="mt-4 text-base font-bold">Apply Now</span>
              <span className="mt-1 flex-1 text-sm text-gold-foreground/80">
                Start your application in minutes.
              </span>
              <ArrowRight className="mt-4 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/free-demo"
              className={cn(ctaTile, "glass hover:border-cyan/50 hover:bg-primary-foreground/15")}
            >
              <MonitorPlay className="h-6 w-6 text-cyan" aria-hidden="true" />
              <span className="mt-4 text-base font-bold text-primary-foreground">
                Request Free Demo
              </span>
              <span className="mt-1 flex-1 text-sm text-primary-foreground/70">
                A trial session only — the full course is paid.
              </span>
              <ArrowRight className="mt-4 h-4 w-4 text-cyan transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                ctaTile,
                "glass hover:border-success/60 hover:bg-primary-foreground/15",
              )}
            >
              <MessageCircle className="h-6 w-6 text-success" aria-hidden="true" />
              <span className="mt-4 text-base font-bold text-primary-foreground">
                WhatsApp Admissions
              </span>
              <span className="mt-1 flex-1 text-sm text-primary-foreground/70">
                Chat with our team directly.
              </span>
              <ArrowRight className="mt-4 h-4 w-4 text-success transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
