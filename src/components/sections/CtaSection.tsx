import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/data/site";

export function CtaSection({
  title = "Ready to start your learning journey?",
  description = "Apply today and our admissions team will review your application and guide you through the next steps.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
      <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-hero px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/apply">Apply Now</Link>
            </Button>
            <Button asChild variant="outline-light" size="xl">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Talk to us on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
