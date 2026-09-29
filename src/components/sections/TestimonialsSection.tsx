import { BookOpen, CheckCircle2, Laptop, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export const learningCommitments = [
  {
    icon: Laptop,
    title: "Live Interactive Instruction",
    desc: "Every session is conducted live with an expert instructor who answers questions, reviews code, and explains concepts in real time.",
  },
  {
    icon: BookOpen,
    title: "Concept-First Curriculum",
    desc: "We focus on strong theoretical foundations and deep problem-solving skills rather than rote memorization or surface-level tutorials.",
  },
  {
    icon: Sparkles,
    title: "Practical Hands-On Projects",
    desc: "Technical students build real software portfolios and Git repositories that demonstrate genuine engineering ability.",
  },
  {
    icon: Users,
    title: "1-on-1 & Small Group Batches",
    desc: "Intimate class sizes ensure personalized pacing, attentive mentoring, and continuous support tailored to individual learning needs.",
  },
  {
    icon: CheckCircle2,
    title: "Milestones & Progress Tracking",
    desc: "Structured syllabi with clear weekly milestones and constructive feedback keep students and parents continuously updated.",
  },
  {
    icon: ShieldCheck,
    title: "Free Demo Guarantee",
    desc: "Experience our teaching standard, classroom environment, and curriculum firsthand before committing to any paid enrollment.",
  },
];

export function TestimonialsSection({ limit }: { limit?: number }) {
  const items = limit ? learningCommitments.slice(0, limit) : learningCommitments;
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Our Commitment"
          title="Academy Standards & Quality Commitments"
          description="How TechBuilt Open School delivers rigorous, personalized online education for students and parents worldwide."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
