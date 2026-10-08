import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarCheck,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  UserCheck,
  GraduationCap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
import { FormSuccessPanel } from "./FormSuccessPanel";

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

  // Preferred demo schedule
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
    applicationType: string;
    preferredTime: string;
    referenceId?: string;
  } | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingLockRef = useRef(false);

  const initialType: ApplicationType = normalizeApplicationType(defaultType);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
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
    if (isSubmittingLockRef.current) return;
    isSubmittingLockRef.current = true;
    setSubmitError(null);

    // Minor validation check
    let hasGuardianError = false;
    if (isMinor) {
      if (!values.guardianName || values.guardianName.trim().length < 2) {
        setError("guardianName", {
          message: "Parent/guardian name is required for minors under 18",
        });
        hasGuardianError = true;
      } else {
        clearErrors("guardianName");
      }
      if (!values.guardianPhone || values.guardianPhone.trim().length < 7) {
        setError("guardianPhone", {
          message: "Parent/guardian WhatsApp/phone is required for minors under 18",
        });
        hasGuardianError = true;
      } else {
        clearErrors("guardianPhone");
      }
    }

    if (hasGuardianError) {
      isSubmittingLockRef.current = false;
      toast.error("Please provide parent or guardian details for students under 18.");
      return;
    }

    try {
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
        // Track conversion ONLY upon verified success
        trackMetaLead({ leadType: "free_demo", contentName: values.selectedProgram });
        setSubmittedData({
          studentName: values.studentName,
          selectedProgram: values.selectedProgram,
          applicationType: values.applicationType,
          preferredTime: `${values.preferredDays}, ${values.preferredTime}`,
          referenceId: result.referenceId,
        });
        toast.success(
          "Demo request received! Our admissions team will contact you to confirm the session.",
        );
      } else {
        const errorMsg =
          result.error ??
          "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("DemoForm caught unexpected error:", err);
      const fallbackErr =
        "A network error occurred. Please check your connection or contact admissions on WhatsApp.";
      setSubmitError(fallbackErr);
      toast.error(fallbackErr);
    } finally {
      isSubmittingLockRef.current = false;
    }
  };

  if (submittedData) {
    return (
      <FormSuccessPanel
        kind="demo"
        title="Free Demo Request Received!"
        studentName={submittedData.studentName}
        selectedProgram={submittedData.selectedProgram}
        applicationType={submittedData.applicationType}
        preferredTime={submittedData.preferredTime}
        referenceId={submittedData.referenceId}
        onReset={() => {
          setSubmittedData(null);
          setSubmitError(null);
          reset();
        }}
        resetButtonText="Submit Another Demo Request"
      />
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

      {/* Program Context Banner */}
      {(watchedProg || defaultSelected) && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
              Trial For
            </span>
            <p className="text-sm font-bold text-foreground">{watchedProg || defaultSelected}</p>
            <p className="text-xs text-muted-foreground">
              Category: {watchedAppType || initialType}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const el = document.getElementById("demo-selectedProgram");
              el?.focus();
            }}
            className="self-start sm:self-auto text-xs h-8"
          >
            Change Program
          </Button>
        </div>
      )}

      {/* Trial Disclosure Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground">
        <div className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">Free 1-Class Live Trial Session</p>
            <p>
              The Free Demo is an introductory live session to experience our interactive teaching
              style, meet the instructor, and assess curriculum fit. Regular cohorts and ongoing
              tutoring are paid programs.
            </p>
          </div>
        </div>
      </div>

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
                Demo Request Could Not Be Submitted
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
                  `Hello TechBuilt Admissions, I had an issue requesting a demo for ${watchedProg || "a program"}. Could you assist?`,
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

      {/* SECTION 1: Student Details */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">1. Student Information</h3>
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
              aria-required="true"
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
              aria-required="true"
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
              aria-required="true"
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
              aria-required="true"
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
              Student Age{" "}
              <span className="text-muted-foreground font-normal">
                (Helpful for cohort placement)
              </span>
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
            aria-required="true"
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

      {/* SECTION 2: Guardian Section (Prompted/Required for Minors) */}
      <div
        className={cn(
          "rounded-xl border p-4 sm:p-5 transition-all space-y-4",
          isMinor ? "border-amber-400/50 bg-amber-500/5" : "border-border/60 bg-muted/20",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className={cn("h-5 w-5", isMinor ? "text-amber-500" : "text-muted-foreground")}
            />
            <h4 className="text-sm font-semibold text-foreground">2. Parent / Guardian Contact</h4>
          </div>
          {isMinor && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Required for Minors Under 18
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {isMinor
            ? "For students in Grades 5–10 or under 18, our admissions coordinator connects directly with a parent or guardian to confirm the trial schedule."
            : "Optional for adult learners. For minors under 18, parent/guardian contact is required."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="demo-guardianName" className="text-xs font-semibold">
              Parent / Guardian Full Name{" "}
              {isMinor ? <span className="text-destructive">*</span> : "(optional)"}
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
              Parent / Guardian WhatsApp{" "}
              {isMinor ? <span className="text-destructive">*</span> : "(optional)"}
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

      {/* SECTION 3: Program Selection */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">3. Program of Interest</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="demo-appType" className="text-xs font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="demo-appType"
              className={fieldClass}
              aria-required="true"
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
              aria-required="true"
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
          <select id="demo-skillLevel" className={fieldClass} {...register("skillLevel")}>
            {skillLevelOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 4: Schedule Preferences */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">4. Schedule Preference</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Share your preferred timing window. Admissions will confirm the exact date and session
          time.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="demo-preferredDays" className="text-xs font-semibold">
              Preferred Day(s) <span className="text-destructive">*</span>
            </Label>
            <select
              id="demo-preferredDays"
              className={fieldClass}
              aria-required="true"
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
              aria-required="true"
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
            Additional Questions or Notes{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
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

      {/* SECTION 5: Consent & Submit */}
      <div className="space-y-4 pt-2">
        <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            aria-required="true"
            {...register("consent")}
          />
          <span>
            I understand that this Free Demo is a 1-session live trial to evaluate the course and
            teaching quality. Continued enrolment in the full program or tutoring is paid.{" "}
            <span className="text-destructive">*</span>
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
