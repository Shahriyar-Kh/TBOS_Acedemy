import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitForm } from "@/lib/forms";
import { trackMetaLead } from "@/lib/marketing";
import { whatsappLink } from "@/data/site";
import { FormSuccessPanel } from "./FormSuccessPanel";

const inquiryCategories = [
  "Course enquiry",
  "Specialization enquiry",
  "Academic tutoring",
  "Tutor service",
  "Fees & payment",
  "Partnership",
  "Other",
];

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid number")
    .max(20)
    .regex(/^[+0-9\s-]+$/, "Invalid number"),
  category: z.string().min(1, "Select a category"),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
  company: z.string().max(0).optional(),
});

type FormValues = z.input<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function ContactForm({ sourcePage = "Contact" }: { sourcePage?: string }) {
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    category: string;
    referenceId?: string;
  } | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      category: "",
      message: "",
    },
  });

  const watchedCategory = watch("category");

  const onSubmit = async (values: FormValues) => {
    if (isSubmittingLockRef.current) return;
    isSubmittingLockRef.current = true;
    setSubmitError(null);

    try {
      const result = await submitForm({
        formType: "Contact",
        sourcePage,
        fullName: values.fullName,
        email: values.email,
        whatsapp: values.whatsapp,
        selected: values.category,
        message: values.message,
        company: values.company,
      });

      if (result.ok) {
        trackMetaLead({ leadType: "contact", contentName: values.category });
        setSubmittedData({
          fullName: values.fullName,
          category: values.category,
          referenceId: result.referenceId,
        });
        toast.success("Message sent! We'll get back to you shortly.");
      } else {
        const errorMsg =
          result.error ?? "Could not send your message right now. Please try WhatsApp instead.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("ContactForm caught unexpected error:", err);
      const fallbackErr = "A network error occurred. Please contact us via WhatsApp.";
      setSubmitError(fallbackErr);
      toast.error(fallbackErr);
    } finally {
      isSubmittingLockRef.current = false;
    }
  };

  if (submittedData) {
    return (
      <FormSuccessPanel
        kind="contact"
        title="Message Received!"
        studentName={submittedData.fullName}
        selectedProgram={submittedData.category}
        applicationType="General Admissions Inquiry"
        referenceId={submittedData.referenceId}
        onReset={() => {
          setSubmittedData(null);
          setSubmitError(null);
          reset();
        }}
        resetButtonText="Send Another Message"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      noValidate
    >
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("company")}
      />

      {/* Actionable Inline Error Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-sm font-semibold text-destructive">
                Message Could Not Be Sent
              </strong>
              <p className="mt-0.5 text-foreground leading-relaxed">{submitError}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-destructive/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-8 text-xs bg-background text-foreground"
            >
              Try Again
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary hover:text-primary"
            >
              <a
                href={whatsappLink(
                  `Hello TechBuilt, I had an inquiry regarding ${watchedCategory || "courses"}. Could you assist?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp Admissions
              </a>
            </Button>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="c-name">Full name *</Label>
        <Input
          id="c-name"
          className="mt-1.5"
          placeholder="Your name"
          aria-required="true"
          {...register("fullName")}
        />
        <ErrorText msg={errors.fullName?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-email">Email *</Label>
          <Input
            id="c-email"
            type="email"
            className="mt-1.5"
            placeholder="you@example.com"
            aria-required="true"
            {...register("email")}
          />
          <ErrorText msg={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="c-wa">WhatsApp *</Label>
          <Input
            id="c-wa"
            className="mt-1.5"
            placeholder="+92 300 0000000"
            aria-required="true"
            {...register("whatsapp")}
          />
          <ErrorText msg={errors.whatsapp?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="c-cat">Inquiry category *</Label>
        <select
          id="c-cat"
          className={cn(fieldClass, "mt-1.5")}
          aria-required="true"
          {...register("category")}
        >
          <option value="">Select a category</option>
          {inquiryCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ErrorText msg={errors.category?.message} />
      </div>

      <div>
        <Label htmlFor="c-msg">Message *</Label>
        <Textarea
          id="c-msg"
          className="mt-1.5 min-h-32"
          placeholder="How can we help you?"
          aria-required="true"
          {...register("message")}
        />
        <ErrorText msg={errors.message?.message} />
      </div>

      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
