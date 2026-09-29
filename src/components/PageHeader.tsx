import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
      <div className="mx-auto max-w-4xl container-px py-14 text-center sm:py-20">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center justify-center gap-1.5 text-xs text-primary-foreground/70">
            <Link to="/" className="hover:text-gold">
              Home
            </Link>
            {breadcrumb.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-gold">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-primary-foreground/90">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <Reveal>
          {eyebrow && (
            <span className="inline-block text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-4xl font-extrabold text-primary-foreground sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
