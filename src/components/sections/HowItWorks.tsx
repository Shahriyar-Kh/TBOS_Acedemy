import { ClipboardList, UserCheck, CalendarClock, Rocket } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const steps = [
  {
    icon: ClipboardList,
    title: "Apply online",
    desc: "Fill out a quick application telling us your goals, grade and preferred subject or course.",
  },
  {
    icon: UserCheck,
    title: "Get matched",
    desc: "We match you with the ideal expert tutor and share a personalised plan within 24 hours.",
  },
  {
    icon: CalendarClock,
    title: "Schedule classes",
    desc: "Choose class times that suit you — one-to-one or group, across any time zone.",
  },
  {
    icon: Rocket,
    title: "Learn & grow",
    desc: "Start live classes, track progress with regular reports, and achieve your goals.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
      <SectionHeading
        eyebrow="Simple process"
        title="How it works"
        description="Getting started is easy. From application to your first class in four simple steps."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 90}
            className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-accent">
              0{i + 1}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold text-gold-foreground shadow-soft">
              <s.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
