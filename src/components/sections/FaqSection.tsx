import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import type { Faq } from "@/data/faqs";

export function FaqSection({
  faqs,
  eyebrow = "FAQ",
  title = "Frequently asked questions",
  description = "Everything parents and students need to know about learning with us.",
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl container-px py-16 sm:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <Reveal className="mt-10">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
