import { Star, Quote } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { testimonials } from "@/data/testimonials";

export function TestimonialsSection({ limit }: { limit?: number }) {
  const items = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Loved by families"
          title="Trusted by students & parents worldwide"
          description="Real results and real stories from learners across Pakistan and around the world."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 80}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-hero text-sm font-bold text-primary-foreground">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.role} · {t.location}
                  </p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
