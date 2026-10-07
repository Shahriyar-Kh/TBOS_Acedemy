import type { LucideIcon } from "lucide-react";
import { Clock, BarChart3, Monitor, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickFactItem = {
  label: string;
  value: string;
  icon?: LucideIcon;
};

export function QuickFacts({
  duration,
  level,
  mode = "Live Online Classes",
  format = "1-on-1 & Cohort Batches",
  className,
}: {
  duration: string;
  level: string;
  mode?: string;
  format?: string;
  className?: string;
}) {
  const facts: QuickFactItem[] = [
    { label: "Pacing & Duration", value: duration, icon: Clock },
    { label: "Experience Level", value: level, icon: BarChart3 },
    { label: "Delivery Mode", value: mode, icon: Monitor },
    { label: "Learning Format", value: format, icon: Users },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4", className)}>
      {facts.map((fact) => {
        const IconComponent = fact.icon;
        return (
          <div
            key={fact.label}
            className="flex flex-col rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-soft transition-colors hover:border-border-strong"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              {IconComponent && <IconComponent className="h-4 w-4 text-cyan" />}
              <span className="font-mono text-[10px] uppercase tracking-wider">{fact.label}</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm font-bold text-foreground">{fact.value}</p>
          </div>
        );
      })}
    </div>
  );
}
