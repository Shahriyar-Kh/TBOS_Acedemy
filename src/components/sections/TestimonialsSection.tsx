import { BookOpen, CheckCircle2, Laptop, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export const learningCommitments = [
  {
    icon: Laptop,
    title: "Live Interactive Instruction",
    desc: "Scheduled classes are delivered live so learners can ask questions, receive explanations, and work through examples in real time.",
  },
  {
    icon: BookOpen,
    title: "Concept-First Curriculum",
    desc: "Programs are structured around concepts, guided practice, and progressive learning rather than one-off recorded content.",
  },
  {
    icon: Sparkles,
    title: "Practical Hands-On Projects",
    desc: "Technical programs include practical exercises and project work where it fits the published curriculum and learner level.",
  },
  {
    icon: Users,
    title: "1-on-1 & Small Group Batches",
    desc: "One-to-one tutoring and small-group formats are available depending on the program, tutor availability, and confirmed schedule.",
  },
  {
    icon: CheckCircle2,
    title: "Milestones & Progress Tracking",
    desc: "Programs use defined topics, milestones, and feedback appropriate to the course or tutoring plan; exact reporting varies by program.",
  },
  {
    icon: ShieldCheck,
    title: "Free Demo Trial Session",
    desc: "A Free Demo is one live trial session used to assess teaching fit and discuss next steps before any paid continuation.",
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
          description="The practical standards we use for live instruction, program clarity, trial sessions, and responsible admissions communication."
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
