import { Reveal } from "@/components/Reveal";
import { stats } from "@/data/site";

export function StatsStrip() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 container-px py-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="text-center">
            <p className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
