import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/sections/FaqSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { whatsappLink } from "@/data/site";
import type { SeoPage } from "@/data/seoPages";

export function SeoLanding({ page }: { page: SeoPage }) {
  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.h1} description={page.intro} />

      <section className="mx-auto max-w-5xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 60}>
                <h2 className="text-2xl font-bold text-foreground">{s.heading}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-bold text-foreground">What you get</h3>
              <ul className="mt-4 space-y-3">
                {page.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-6 w-full">
                <Link
                  to="/apply"
                  search={{ type: page.ctaCourseType, selected: page.ctaSelected }}
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="mt-3 w-full">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <TestimonialsSection limit={3} />
      <FaqSection faqs={page.faqs} />
      <CtaSection />
    </>
  );
}
