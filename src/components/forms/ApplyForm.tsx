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
import {
  submitForm,
  courseTypeOptions,
  classTypeOptions,
  gradeOptions,
  type FormType,
} from "@/lib/forms";
import { courses } from "@/data/courses";
import { specializations } from "@/data/specializations";

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  guardianName: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20)
    .regex(/^[+0-9\s-]+$/, "Use digits, spaces, + or - only"),
  country: z.string().trim().min(2, "Required").max(60),
  city: z.string().trim().min(2, "Required").max(60),
  grade: z.string().min(1, "Select your grade / level"),
  courseType: z.string().min(1, "Select a category"),
  selected: z.string().trim().min(2, "Select or type your choice").max(120),
  goal: z.string().trim().max(300).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(60).optional().or(z.literal("")),
  classType: z.string().min(1, "Select a class type"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept to continue" }) }),
  company: z.string().max(0).optional(), // honeypot
});

type FormValues = z.input<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function ApplyForm({
  sourcePage,
  defaultCourseType = "Single Course",
  defaultSelected = "",
  formType = "Single Course",
}: {
  sourcePage: string;
  defaultCourseType?: string;
  defaultSelected?: string;
  formType?: FormType;
}) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseType: defaultCourseType,
      selected: defaultSelected,
      classType: "One-to-one",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await submitForm({
      formType,
      sourcePage,
      fullName: values.fullName,
      guardianName: values.guardianName,
      email: values.email,
      whatsapp: values.whatsapp,
      country: values.country,
      city: values.city,
      grade: values.grade,
      courseType: values.courseType,
      selected: values.selected,
      goal: values.goal,
      preferredTime: values.preferredTime,
      classType: values.classType,
      message: values.message,
      company: values.company,
    });

    if (result.ok) {
      setDone(true);
      reset();
      toast.success("Application received! Our team will contact you within 24 hours.");
    } else {
      toast.error(result.error ?? "Submission failed. Please try again or use WhatsApp.");
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-4 text-2xl font-bold text-foreground">Thank you for applying!</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Your application has been received. Our admissions team will reach out via email or
          WhatsApp within 24 hours to confirm your tutor, schedule and plan.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setDone(false)}>
          Submit another application
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
      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("company")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full name *</Label>
          <Input id="fullName" className="mt-1.5" placeholder="Student full name" {...register("fullName")} />
          <ErrorText msg={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="guardianName">Father / Mother name</Label>
          <Input id="guardianName" className="mt-1.5" placeholder="Parent / guardian name" {...register("guardianName")} />
          <ErrorText msg={errors.guardianName?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email address *</Label>
          <Input id="email" type="email" className="mt-1.5" placeholder="you@example.com" {...register("email")} />
          <ErrorText msg={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp number *</Label>
          <Input id="whatsapp" className="mt-1.5" placeholder="+92 300 0000000" {...register("whatsapp")} />
          <ErrorText msg={errors.whatsapp?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" className="mt-1.5" placeholder="Pakistan" {...register("country")} />
          <ErrorText msg={errors.country?.message} />
        </div>
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" className="mt-1.5" placeholder="Lahore" {...register("city")} />
          <ErrorText msg={errors.city?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="grade">Student grade / level *</Label>
          <select id="grade" className={cn(fieldClass, "mt-1.5")} {...register("grade")}>
            <option value="">Select grade / level</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <ErrorText msg={errors.grade?.message} />
        </div>
        <div>
          <Label htmlFor="courseType">Course type *</Label>
          <select id="courseType" className={cn(fieldClass, "mt-1.5")} {...register("courseType")}>
            {courseTypeOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ErrorText msg={errors.courseType?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="selected">Selected course / specialization / subject *</Label>
        <input
          id="selected"
          list="selectable-options"
          className={cn(fieldClass, "mt-1.5")}
          placeholder="Type or choose, e.g. Mathematics, Full Stack Development"
          {...register("selected")}
        />
        <datalist id="selectable-options">
          {courses.map((c) => (
            <option key={`c-${c.slug}`} value={c.title} />
          ))}
          {specializations.map((s) => (
            <option key={`s-${s.slug}`} value={s.title} />
          ))}
        </datalist>
        <ErrorText msg={errors.selected?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="classType">Class type *</Label>
          <select id="classType" className={cn(fieldClass, "mt-1.5")} {...register("classType")}>
            {classTypeOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ErrorText msg={errors.classType?.message} />
        </div>
        <div>
          <Label htmlFor="preferredTime">Preferred class time</Label>
          <Input id="preferredTime" className="mt-1.5" placeholder="e.g. Weekdays after 5 PM" {...register("preferredTime")} />
        </div>
      </div>

      <div>
        <Label htmlFor="goal">Your learning goal</Label>
        <Input id="goal" className="mt-1.5" placeholder="e.g. Improve grades / become a developer" {...register("goal")} />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          className="mt-1.5 min-h-28"
          placeholder="Tell us anything that helps us match the right tutor and plan."
          {...register("message")}
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
        <input
          id="consent"
          type="checkbox"
          {...register("consent")}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Label htmlFor="consent" className="text-sm font-normal leading-relaxed text-muted-foreground">
          I agree to be contacted by TechBuilt Open School regarding my application and accept
          the privacy policy. *
        </Label>
      </div>
      <ErrorText msg={errors.consent?.message as string | undefined} />

      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
