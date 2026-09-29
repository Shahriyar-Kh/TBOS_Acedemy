import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Clock, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/ContactForm";
import { buildMeta } from "@/lib/seo";
import { site, whatsappLink } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: buildMeta({
      title: "Contact Us | TechBuilt Open School International Online Academy",
      description:
        "Get in touch with TechBuilt Open School. Ask about courses, specializations, fees, scholarships and online tutoring. We respond quickly via email and WhatsApp.",
      keywords: ["contact online academy", "online tutor contact", "academy enquiry"],
    }),
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const details = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: whatsappLink() },
  { icon: Phone, label: "Phone", value: site.phoneDisplay, href: `tel:${site.phoneDisplay.replace(/\s/g, "")}` },
  { icon: Clock, label: "Working hours", value: site.workingHours },
  { icon: MapPin, label: "Serving", value: "Pakistan & 25+ countries (online)" },
];

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="We're here to help"
        title="Contact Us"
        description="Have a question about courses, tutoring, fees or scholarships? Reach out and we'll get back to you quickly."
        breadcrumb={[{ label: "Contact" }]}
      />

      <section className="mx-auto max-w-6xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">Get in touch</h2>
            <p className="mt-3 text-muted-foreground">
              Prefer to talk directly? Message us on WhatsApp for the fastest response, or send an
              email and our team will reply within one working day.
            </p>

            <ul className="mt-8 space-y-4">
              {details.map((d) => (
                <li key={d.label} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        target={d.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <Button asChild variant="success" size="lg" className="mt-6 w-full sm:w-auto">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Message us on WhatsApp
              </a>
            </Button>
          </Reveal>

          <Reveal delay={100}>
            <ContactForm sourcePage="Contact Page" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
