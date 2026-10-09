import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/data/site";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${site.fullName} — home`}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-soft transition-transform group-hover:scale-105",
          light ? "bg-gold text-gold-foreground" : "bg-gradient-hero text-primary-foreground",
        )}
      >
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-extrabold tracking-tight",
            light ? "text-primary-foreground" : "text-foreground",
          )}
        >
          TechBuilt <span className="text-gold-foreground">Open School</span>
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
            light ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          International Online Academy
        </span>
      </span>
    </Link>
  );
}
