import { useState } from "react";
import { CheckCircle2, Copy, Check, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/data/site";

export interface FormSuccessPanelProps {
  title?: string;
  studentName?: string;
  selectedProgram?: string;
  applicationType?: string;
  referenceId?: string;
  kind?: "application" | "demo" | "contact";
  preferredTime?: string;
  onReset?: () => void;
  resetButtonText?: string;
}

export function FormSuccessPanel({
  title,
  studentName,
  selectedProgram,
  applicationType,
  referenceId,
  kind = "application",
  preferredTime,
  onReset,
  resetButtonText,
}: FormSuccessPanelProps) {
  const [copied, setCopied] = useState(false);

  const defaultTitle =
    kind === "demo"
      ? "Free Demo Request Received!"
      : kind === "contact"
        ? "Message Received!"
        : "Application Received!";

  const resolvedTitle = title || defaultTitle;

  const handleCopyReference = () => {
    if (!referenceId) return;
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Build contextual WhatsApp message
  const whatsappSubject =
    kind === "demo" ? "my free demo request" : kind === "contact" ? "my message" : "my application";

  const programDescriptor = selectedProgram ? ` for ${selectedProgram}` : "";
  const refDescriptor = referenceId ? ` (Ref: ${referenceId})` : "";
  const whatsappFollowup = `Hello TechBuilt Open School, I have submitted ${whatsappSubject}${programDescriptor}${refDescriptor} and would like to confirm the next steps.`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-success/30 bg-card p-6 shadow-card sm:p-10 text-left transition-all animate-in fade-in-50 duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            Submission Confirmed
          </span>
          <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{resolvedTitle}</h2>
          {studentName && (
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you, <strong className="text-foreground">{studentName}</strong>. Your details
              have been securely registered with admissions.
            </p>
          )}
        </div>
      </div>

      {/* Reference ID Card */}
      {referenceId && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">
              Official Reference ID
            </span>
            <span className="font-mono text-base font-bold text-foreground">{referenceId}</span>
            <p className="text-xs text-muted-foreground">
              Save this reference number for fast WhatsApp inquiries and status updates.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyReference}
            className="shrink-0 h-9 gap-1.5 text-xs"
            aria-label="Copy reference ID"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy ID
              </>
            )}
          </Button>
        </div>
      )}

      {/* Summary Box */}
      {(selectedProgram || applicationType || preferredTime) && (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground block text-[10px]">
            Submission Summary
          </span>
          <div className="grid gap-2 sm:grid-cols-2">
            {selectedProgram && (
              <div>
                <span className="text-muted-foreground">Program / Topic:</span>
                <p className="font-semibold text-foreground">{selectedProgram}</p>
              </div>
            )}
            {applicationType && (
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p className="font-semibold text-foreground">{applicationType}</p>
              </div>
            )}
            {preferredTime && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Preferred Time:</span>
                <p className="font-semibold text-foreground">{preferredTime}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps Roadmap */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          What Happens Next
        </h3>
        <ol className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              1
            </span>
            <div>
              <strong className="text-foreground">Admissions Coordinator Review:</strong> An
              admissions coordinator reviews your learning background and verifies course alignment.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              2
            </span>
            <div>
              <strong className="text-foreground">Timetable &amp; Schedule Confirmation:</strong> We
              will reach out via WhatsApp or email to share the detailed syllabus outline and
              confirm suitable class slots.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              3
            </span>
            <div>
              <strong className="text-foreground">Interactive Learning Kickoff:</strong> Join your
              live class session or trial meeting to experience real-time instructor-led
              instruction.
            </div>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
        <Button asChild variant="hero" size="lg" className="flex-1 justify-center">
          <a href={whatsappLink(whatsappFollowup)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" /> Message Admissions on WhatsApp
          </a>
        </Button>
        {onReset && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReset}
            className="flex-1 sm:flex-none justify-center"
          >
            {resetButtonText ||
              (kind === "contact" ? "Send Another Message" : "Submit Another Application")}
          </Button>
        )}
      </div>
    </div>
  );
}
