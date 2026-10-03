import {
  Globe2,
  Users,
  ShieldCheck,
  Clock4,
  Award,
  HeartHandshake,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const reasons = [
  {
    icon: Award,
    title: "Premium expert tutors",
    desc: "Qualified subject specialists and industry professionals, selected for both expertise and teaching ability.",
  },
  {
    icon: Users,
    title: "Truly personalised",
    desc: "One-to-one and small group classes built around each student's level, curriculum and goals.",
  },
  {
    icon: Globe2,
    title: "International reach",
    desc: "Serving students across Pakistan and international learners worldwide, with flexible scheduling for every time zone.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & trusted",
    desc: "Interactive online classrooms, patient instructors, and clear communication with parents at every step.",
  },
  {
    icon: Clock4,
    title: "Flexible learning",
    desc: "Study online at convenient schedules that suit your routine, guided by your instructor.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated support",
    desc: "Structured coursework designed to build confidence, practical understanding, and foundational skills.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-gradient-soft">
      <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why TechBuilt"
          title="A focused academy built around student progress"
          description="We combine structured curriculum with an interactive, supportive learning experience."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal
              key={r.title}
              delay={i * 70}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                <r.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
