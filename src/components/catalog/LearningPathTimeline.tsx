import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export function LearningPathTimeline({
  items,
  title = "Curriculum Roadmap",
  subtitle = "Step-by-step progressive syllabus designed to build production competence.",
  className,
}: {
  items: string[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <ol className="relative space-y-4 border-l border-border/70 pl-6 sm:pl-8 ml-3.5 sm:ml-4">
        {items.map((item, index) => {
          const stepNumber = String(index + 1).padStart(2, "0");

          return (
            <Reveal key={item} delay={index * 40}>
              <li className="relative group">
                {/* Connecting Node Pin */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] sm:-left-[39px] top-4 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border-2 border-background bg-accent text-[11px] sm:text-xs font-bold text-primary shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  {index + 1}
                </span>

                {/* Module Card */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft transition-all duration-300 hover:border-cyan/40 hover:shadow-card">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-cyan font-semibold">
                      Phase {stepNumber}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm sm:text-base font-semibold leading-snug text-foreground">
                    {item}
                  </h3>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
