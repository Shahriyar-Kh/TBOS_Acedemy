import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  light?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-block text-sm font-semibold uppercase tracking-[0.18em]",
            light ? "text-gold" : "text-gold-foreground",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "mt-3 text-3xl font-bold sm:text-4xl",
          light ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            light ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
