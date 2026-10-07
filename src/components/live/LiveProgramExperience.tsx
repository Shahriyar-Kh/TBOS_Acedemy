import { MonitorPlay, Code2, MessageSquare, Target } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function LiveProgramExperience() {
  const pillars = [
    {
      icon: MonitorPlay,
      title: "Live Instructor Teaching",
      description:
        "Every class is conducted live online with real-time screen sharing and step-by-step code demonstration by an experienced software instructor — not pre-recorded videos.",
    },
    {
      icon: Code2,
      title: "Guided Practical Coding",
      description:
        "Students write code alongside the mentor during the session. Immediate hands-on exercises ensure concepts are practiced and retained right away.",
    },
    {
      icon: MessageSquare,
      title: "Interactive Live Q&A",
      description:
        "Ask questions during class, get immediate syntax and runtime error debugging, and receive personalized feedback on homework submissions.",
    },
    {
      icon: Target,
      title: "Structured Milestones",
      description:
        "Progress through 6 distinct roadmap phases with concrete milestone outcomes and a comprehensive capstone project showcasing your actual code.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-t border-border/60">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            TRANSPARENT LEARNING EXPERIENCE
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What Live Cohort Learning Means
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We focus on genuine mentorship, scheduled accountability, and real programming practice.
            Here is what to expect in every session.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, idx) => {
          const IconComp = pillar.icon;
          return (
            <Reveal key={pillar.title} delay={idx * 50}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft h-full flex flex-col justify-between transition-colors hover:border-primary/40">
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-foreground text-base">{pillar.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
