import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitForm } from "@/lib/forms";
import { trackMetaLead } from "@/lib/marketing";
import {
  type ApplicationType,
  applicationTypeOptions,
  normalizeApplicationType,
  getAllProgramOptions,
  educationLevelOptions,
  preferredDaysOptions,
  preferredTimeOptions,
  skillLevelOptions,
  isMinorLearner,
} from "@/lib/programs";
import { whatsappLink } from "@/data/site";

const demoSchema = z.object({
  studentName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp / phone number")
    .max(25)
    .regex(/^[+0-9\s-]+$/, "Use digits, spaces, + or - only"),
  country: z.string().trim().min(2, "Country is required").max(60),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  age: z.string().trim().max(3).optional().or(z.literal("")),
  educationLevel: z.string().min(1, "Select your education level / grade"),

  // Guardian details for minors
  guardianName: z.string().trim().max(100).optional().or(z.literal("")),
  guardianPhone: z.string().trim().max(25).optional().or(z.literal("")),

  // Program selection
  applicationType: z.string().min(1, "Select program type"),
  selectedProgram: z.string().trim().min(2, "Please select or type your course/subject").max(140),
  skillLevel: z.string().optional().or(z.literal("")),

  // Preferred demo schedule (preferences, not confirmed instant appointments)
  preferredDays: z.string().min(1, "Select preferred day(s) for the demo"),
  preferredTime: z.string().min(1, "Select preferred time window"),
  timezone: z.string().trim().max(60).optional().or(z.literal("")),

  learningGoal: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(600).optional().or(z.literal("")),

  consent: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge to continue" }),
  }),
  company: z.string().max(0).optional(), // Honeypot
});

type DemoFormValues = z.input<typeof demoSchema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function DemoForm({
  sourcePage = "Free Demo Page",
  defaultType,
  defaultSelected = "",
}: {
  sourcePage?: string;
  defaultType?: string;
  defaultSelected?: string;
}) {
  const [submittedData, setSubmittedData] = useState<{
    studentName: string;
    selectedProgram: string;
    preferredTime: string;
    referenceId?: string;
  } | null>(null);

  const initialType: ApplicationType = normalizeApplicationType(defaultType);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      studentName: "",
      email: "",
      phone: "",
      country: "Pakistan",
      city: "",
      age: "",
      educationLevel: "",
      guardianName: "",
      guardianPhone: "",
      applicationType: initialType,
      selectedProgram: defaultSelected,
      skillLevel: "Complete Beginner (No prior experience)",
      preferredDays: "Flexible / Any Day",
      preferredTime: "Evening (5:00 PM - 9:00 PM PKT)",
      timezone: "PKT (UTC+5)",
      learningGoal: "",
      notes: "",
    },
  });

  const watchedAge = watch("age");
  const watchedEdu = watch("educationLevel");
  const watchedProg = watch("selectedProgram");
  const watchedAppType = watch("applicationType");

  const isMinor = useMemo(
    () => isMinorLearner(watchedAge, watchedEdu, watchedProg),
    [watchedAge, watchedEdu, watchedProg],
  );

  const allPrograms = useMemo(() => getAllProgramOptions(), []);

  const filteredSuggestions = useMemo(() => {
    if (!watchedAppType || watchedAppType === "General Admissions Inquiry") {
      return allPrograms;
    }
    const matched = allPrograms.filter((p) => p.group === watchedAppType);
    return matched.length > 0 ? matched : allPrograms;
  }, [allPrograms, watchedAppType]);

  const onSubmit = async (values: DemoFormValues) => {
    if (isMinor && (!values.guardianName || values.guardianName.trim().length < 2)) {
      toast.error("Please provide a parent or guardian name for students under 18.");
      return;
    }
    if (isMinor && (!values.guardianPhone || values.guardianPhone.trim().length < 7)) {
      toast.error("Please provide a parent or guardian contact number for students under 18.");
      return;
    }

    const result = await submitForm({
      submissionType: "demo",
      sourcePage,
      applicationType: values.applicationType,
      selectedProgram: values.selectedProgram,
      studentName: values.studentName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      city: values.city,
      age: values.age,
      educationLevel: values.educationLevel,
      guardianName: values.guardianName,
      guardianPhone: values.guardianPhone,
      skillLevel: values.skillLevel,
      learningGoal: values.learningGoal,
      learningPreference: "Free Demo Trial Session",
      preferredDays: values.preferredDays,
      preferredTime: values.preferredTime,
      timezone: values.timezone,
      notes: values.notes,
      company: values.company,
    });

    if (result.ok) {
      trackMetaLead({ leadType: "free_demo", contentName: values.selectedProgram });
      setSubmittedData({
        studentName: values.studentName,
        selectedProgram: values.selectedProgram,
        preferredTime: `${values.preferredDays}, ${values.preferredTime}`,
        referenceId: result.referenceId,
      });
      reset();
      toast.success("Demo request received! Our admissions team will contact you to confirm the session.");
    } else {
      toast.error(result.error ?? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp.");
    }
  };

  if (submittedData) {
    const whatsappFollowup = `Hello TechBuilt Open School, I would like to request a Free Demo for ${submittedData.selectedProgram}${submittedData.referenceId ? ` (Ref: ${submittedData.referenceId})` : ""}.`;

    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CalendarCheck className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-2xl font-bold text-foreground">Demo Request Received</h3>
        {submittedData.referenceId && (
          <p className="mt-2 text-xs font-mono font-semibold text-primary">
            Request Reference: {submittedData.referenceId}
          </p>
        )}
        <p className="mt-3 text-muted-foreground">
          Thank you, <strong className="text-foreground">{submittedData.studentName}</strong>. Your trial demo request for{" "}
          <strong className="text-foreground">{submittedData.selectedProgram}</strong> has been logged.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-card p-4 text-left text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>How your demo is confirmed:</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Requested schedule: <strong className="text-foreground">{submittedData.preferredTime}</strong>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Our admissions coordinator will review instructor availability, reach out via WhatsApp / Email, and share your private live class meeting link before the session.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink(whatsappFollowup)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20ba59]"
          >
            <MessageCircle className="h-4 w-4" />
            Confirm on WhatsApp
          </a>
          <Button
            variant="outline"
            onClick={() => setSubmittedData(null)}
            className="h-11 px-5"
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      noValidate
    >
      {/* Honeypot field */}
      <input
        type="text"
        {...register("company")}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Trial Disclosure Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground">
        <div className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">
              Free 1-Class Live Trial Session
            </p>
            <p>
              The Free Demo is an introductory live session to experience our interactive teaching style, meet the instructor, and assess curriculum fit. Ongoing batches and tutoring programs are paid courses.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Student Details */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">1. Student Information</h3>
          <p className="text-xs text-muted-foreground">Who will attend the demo session?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="demo-studentName" className="text-xs font-semibold">
              Student Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-studentName"
              placeholder="e.g. Ayesha Khan"
              className={fieldClass}
              {...register("studentName")}
            />
            <ErrorText msg={errors.studentName?.message} />
          </div>

          <div>
            <Label htmlFor="demo-email" className="text-xs font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="ayesha@example.com"
              className={fieldClass}
              {...register("email")}
            />
            <ErrorText msg={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="demo-phone" className="text-xs font-semibold">
              WhatsApp / Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-phone"
              placeholder="+92 300 1234567"
              className={fieldClass}
              {...register("phone")}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Admissions coordinates the live demo meeting link via WhatsApp.
            </p>
            <ErrorText msg={errors.phone?.message} />
          </div>

          <div>
            <Label htmlFor="demo-country" className="text-xs font-semibold">
              Country of Residence <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-country"
              placeholder="e.g. Pakistan, UAE, UK, Saudi Arabia"
              className={fieldClass}
              {...register("country")}
            />
            <ErrorText msg={errors.country?.message} />
          </div>

          <div>
            <Label htmlFor="demo-city" className="text-xs font-semibold">
              City <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="demo-city"
              placeholder="e.g. Lahore, Karachi, Dubai"
              className={fieldClass}
              {...register("city")}
            />
          </div>

          <div>
            <Label htmlFor="demo-age" className="text-xs font-semibold">
              Student Age <span className="text-muted-foreground font-normal">(Helpful for cohort placement)</span>
            </Label>
            <Input
              id="demo-age"
              placeholder="e.g. 14, 21"
              className={fieldClass}
              {...register("age")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="demo-educationLevel" className="text-xs font-semibold">
            Current Education Level / Grade <span className="text-destructive">*</span>
          </Label>
          <select
            id="demo-educationLevel"
            className={fieldClass}
            {...register("educationLevel")}
          >
            <option value="">-- Select Grade or Education Level --</option>
            {educationLevelOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ErrorText msg={errors.educationLevel?.message} />
        </div>
      </div>

      {/* Guardian Section (Prompted/Required for Minors) */}
      {isMinor && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Parent or Guardian Contact (Required for Learners Under 18)
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            For students in Grades 5–10 or under 18, our admissions coordinator connects directly with a parent or guardian to confirm the trial schedule.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="demo-guardianName" className="text-xs font-semibold">
                Parent / Guardian Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-guardianName"
                placeholder="Parent or Guardian Name"
                className={fieldClass}
                {...register("guardianName")}
              />
              <ErrorText msg={errors.guardianName?.message} />
            </div>

            <div>
              <Label htmlFor="demo-guardianPhone" className="text-xs font-semibold">
                Parent / Guardian WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-guardianPhone"
                placeholder="+92 300 1234567"
                className={fieldClass}
                {...register("guardianPhone")}
              />
              <ErrorText msg={errors.guardianPhone?.message} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Program Selection */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">2. Program of Interest</h3>
          <p className="text-xs text-muted-foreground">Which subject or course would you like to trial?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="demo-appType" className="text-xs font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="demo-appType"
              className={fieldClass}
              {...register("applicationType")}
            >
              {applicationTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.applicationType?.message} />
          </div>

          <div>
            <Label htmlFor="demo-selectedProgram" className="text-xs font-semibold">
              Select or Type Course / Subject <span className="text-destructive">*</span>
            </Label>
            <input
              list="demo-programs-list"
              id="demo-selectedProgram"
              placeholder="e.g. Python Young Developers, React.js, Physics"
              className={fieldClass}
              {...register("selectedProgram")}
            />
            <datalist id="demo-programs-list">
              {filteredSuggestions.map((item) => (
                <option key={`${item.group}-${item.value}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </datalist>
            <ErrorText msg={errors.selectedProgram?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="demo-skillLevel" className="text-xs font-semibold">
            Current Knowledge / Experience Level
          </Label>
          <select
            id="demo-skillLevel"
            className={fieldClass}
            {...register("skillLevel")}
          >
            {skillLevelOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Schedule Preferences (Not Instant Bookings) */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">3. Schedule Preference</h3>
          <p className="text-xs text-muted-foreground">
            Share your preferred timing window. Admissions will confirm the exact date and session time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="demo-preferredDays" className="text-xs font-semibold">
              Preferred Day(s) <span className="text-destructive">*</span>
            </Label>
            <select
              id="demo-preferredDays"
              className={fieldClass}
              {...register("preferredDays")}
            >
              {preferredDaysOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.preferredDays?.message} />
          </div>

          <div>
            <Label htmlFor="demo-preferredTime" className="text-xs font-semibold">
              Preferred Time Window <span className="text-destructive">*</span>
            </Label>
            <select
              id="demo-preferredTime"
              className={fieldClass}
              {...register("preferredTime")}
            >
              {preferredTimeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.preferredTime?.message} />
          </div>

          <div>
            <Label htmlFor="demo-timezone" className="text-xs font-semibold">
              Timezone
            </Label>
            <Input
              id="demo-timezone"
              placeholder="e.g. PKT (UTC+5), GST (UTC+4), GMT"
              className={fieldClass}
              {...register("timezone")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="demo-learningGoal" className="text-xs font-semibold">
            What do you hope to learn or evaluate in this demo session?
          </Label>
          <Input
            id="demo-learningGoal"
            placeholder="e.g. Test if the syllabus fits my child, check online teaching clarity, solve physics doubts"
            className={fieldClass}
            {...register("learningGoal")}
          />
        </div>

        <div>
          <Label htmlFor="demo-notes" className="text-xs font-semibold">
            Additional Questions or Notes <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="demo-notes"
            rows={3}
            placeholder="Any specific topic you would like the instructor to cover during the trial session..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("notes")}
          />
        </div>
      </div>

      {/* Consent & Submit */}
      <div className="space-y-4 pt-2">
        <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            {...register("consent")}
          />
          <span>
            I understand that this Free Demo is a 1-session live trial to evaluate the course and teaching quality. Continued enrolment in the full program or tutoring is paid. <span className="text-destructive">*</span>
          </span>
        </label>
        <ErrorText msg={errors.consent?.message} />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full text-base font-semibold shadow-md sm:w-auto sm:min-w-[240px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Demo Request...
            </>
          ) : (
            "Request Free Demo Session"
          )}
        </Button>
      </div>
    </form>
  );
}
