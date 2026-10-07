import { HelpCircle, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { LiveOffer } from "@/data/liveOffers";

export function LiveProgramFAQ({ offer }: { offer: LiveOffer }) {
  const regularFeeStr =
    typeof offer.regularFee === "number"
      ? offer.regularFee.toLocaleString()
      : (offer.regularFee ?? "0");
  const offerFeeStr =
    typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : (offer.offerFee ?? "0");

  const faqs = [
    {
      q: "Is prior programming experience required?",
      a:
        offer.prerequisites && offer.prerequisites.length > 0
          ? offer.prerequisites.join(" ")
          : "No prior programming experience is required. The curriculum begins with step-by-step foundational principles and builds steadily towards practical mastery.",
    },
    {
      q: "What is the Free Demo session, and does it include the full course?",
      a: "The Free Demo is a single complimentary trial class, not the full course. It allows students and parents to experience the live online environment, assess the instructor's teaching methodology, and review the syllabus before enrolling. The full program is paid monthly at the group cohort rate.",
    },
    {
      q: `How long is the program and what is the weekly schedule?`,
      a: `This program runs for ${offer.duration}. Sessions are held ${offer.classesPerWeek || "scheduled weekly"}, with each class lasting ${offer.sessionDuration || "1 hour"}. Contact admissions to confirm specific batch timings for your time zone.`,
    },
    {
      q: "What is the monthly fee for this live cohort?",
      a: `The regular fee is Rs ${regularFeeStr}/${offer.billingPeriod}. Under the current cohort offer, enrollment is Rs ${offerFeeStr}/${offer.billingPeriod}. ${offer.paidNote}`,
    },
    {
      q: `Who is this live batch specifically designed for?`,
      a: `${offer.audience}. ${offer.idealFor.join(" ")}`,
    },
    {
      q: "How do I confirm the next confirmed batch timetable?",
      a: "New batches are scheduled periodically. Please submit an inquiry through the Apply form or message our admissions coordinator on WhatsApp to receive the next confirmed batch dates and time slots.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-t border-border/60">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Questions About {offer.shortTitle}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Clear, honest answers regarding curriculum, scheduling, fees, and the Free Demo trial
            session.
          </p>
        </div>
      </Reveal>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <Reveal key={faq.q} delay={idx * 30}>
            <details className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40 open:border-primary/50">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-foreground text-sm list-none select-none">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="mt-3 pl-6.5 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-3">
                {faq.a}
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
