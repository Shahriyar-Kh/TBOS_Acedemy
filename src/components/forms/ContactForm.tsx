import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitForm } from "@/lib/forms";

const inquiryCategories = [
  "Course enquiry",
  "Specialization enquiry",
  "Academic tutoring",
  "Tutor service",
  "Fees & scholarships",
  "Partnership",
  "Other",
];

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  whatsapp: z.string().trim().min(7, "Enter a valid number").max(20).regex(/^[+0-9\s-]+$/, "Invalid number"),
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
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { category: "" } });

  const onSubmit = async (values: FormValues) => {
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
      setDone(true);
      reset();
      toast.success("Message sent! We'll get back to you shortly.");
    } else {
      toast.error(result.error ?? "Could not send. Please try WhatsApp instead.");
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-4 text-2xl font-bold text-foreground">Message received!</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Thank you for reaching out. Our team will respond via email or WhatsApp soon.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      noValidate
    >
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("company")} />

      <div>
        <Label htmlFor="c-name">Full name *</Label>
        <Input id="c-name" className="mt-1.5" placeholder="Your name" {...register("fullName")} />
        <ErrorText msg={errors.fullName?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-email">Email *</Label>
          <Input id="c-email" type="email" className="mt-1.5" placeholder="you@example.com" {...register("email")} />
          <ErrorText msg={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="c-wa">WhatsApp *</Label>
          <Input id="c-wa" className="mt-1.5" placeholder="+92 300 0000000" {...register("whatsapp")} />
          <ErrorText msg={errors.whatsapp?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="c-cat">Inquiry category *</Label>
        <select id="c-cat" className={cn(fieldClass, "mt-1.5")} {...register("category")}>
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
        <Textarea id="c-msg" className="mt-1.5 min-h-32" placeholder="How can we help you?" {...register("message")} />
        <ErrorText msg={errors.message?.message} />
      </div>

      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
