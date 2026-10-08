import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  GraduationCap,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitForm, type FormType } from "@/lib/forms";
import {
  type ApplicationType,
  applicationTypeOptions,
  normalizeApplicationType,
  getAllProgramOptions,
  educationLevelOptions,
  learningPreferenceOptions,
  preferredDaysOptions,
  preferredTimeOptions,
  skillLevelOptions,
  classesPerWeekOptions,
  isMinorLearner,
} from "@/lib/programs";
import { whatsappLink } from "@/data/site";
import { trackMetaLead } from "@/lib/marketing";
import { FormSuccessPanel } from "./FormSuccessPanel";

const schema = z.object({
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
  institution: z.string().trim().max(120).optional().or(z.literal("")),

  // Guardian details (required for minors)
  guardianName: z.string().trim().max(100).optional().or(z.literal("")),
  guardianPhone: z.string().trim().max(25).optional().or(z.literal("")),
  guardianEmail: z.string().trim().max(255).optional().or(z.literal("")),

  // Interest & Program
  applicationType: z.string().min(1, "Select an application category"),
  selectedProgram: z.string().trim().min(2, "Please select or type your course/subject").max(140),
  skillLevel: z.string().optional().or(z.literal("")),
  learningGoal: z.string().trim().max(300).optional().or(z.literal("")),

  // Preferences & Schedule
  learningPreference: z.string().min(1, "Select a learning format"),
  preferredDays: z.string().optional().or(z.literal("")),
  preferredTime: z.string().optional().or(z.literal("")),
  classesPerWeek: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),

  consent: z.literal(true, { errorMap: () => ({ message: "Please accept to continue" }) }),
  company: z.string().max(0).optional(), // Honeypot
});

type FormValues = z.input<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function ApplyForm({
  sourcePage = "Apply Page",
  defaultApplicationType,
  defaultCourseType,
  defaultSelected = "",
  formType,
}: {
  sourcePage?: string;
  defaultApplicationType?: string;
  defaultCourseType?: string;
  defaultSelected?: string;
  formType?: FormType;
}) {
  const [submittedData, setSubmittedData] = useState<{
    studentName: string;
    selectedProgram: string;
    applicationType: string;
    referenceId?: string;
  } | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingLockRef = useRef(false);

  const initialType: ApplicationType = normalizeApplicationType(
    defaultApplicationType || defaultCourseType || (formType as string),
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentName: "",
      email: "",
      phone: "",
      country: "Pakistan",
      city: "",
      age: "",
      educationLevel: "",
      institution: "",
      guardianName: "",
      guardianPhone: "",
      guardianEmail: "",
      applicationType: initialType,
      selectedProgram: defaultSelected,
      skillLevel: "Complete Beginner (No prior experience)",
      learningPreference: "One-to-One (Personalized Private Tuition)",
      preferredDays: "Flexible / Any Day",
      preferredTime: "Flexible / Let Admissions Suggest",
      classesPerWeek: "Flexible / Recommend for my goal",
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

  const onSubmit = async (values: FormValues) => {
    if (isSubmittingLockRef.current) return;
    isSubmittingLockRef.current = true;
    setSubmitError(null);

    // Minor validation enforcement
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
        submissionType: "application",
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
        institution: values.institution,
        guardianName: values.guardianName,
        guardianPhone: values.guardianPhone,
        guardianEmail: values.guardianEmail,
        skillLevel: values.skillLevel,
        learningGoal: values.learningGoal,
        learningPreference: values.learningPreference,
        preferredDays: values.preferredDays,
        preferredTime: values.preferredTime,
        classesPerWeek: values.classesPerWeek,
        notes: values.notes,
        company: values.company,
      });

      if (result.ok) {
        // Fire Meta Lead conversion tracking ONLY on verified success
        trackMetaLead({ leadType: "application", contentName: values.selectedProgram });
        setSubmittedData({
          studentName: values.studentName,
          selectedProgram: values.selectedProgram,
          applicationType: values.applicationType,
          referenceId: result.referenceId,
        });
        toast.success("Application received! Our admissions team will review your application.");
      } else {
        const errorMsg =
          result.error ??
          "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("ApplyForm submission caught unexpected error:", err);
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
        kind="application"
        title="Application Received!"
        studentName={submittedData.studentName}
        selectedProgram={submittedData.selectedProgram}
        applicationType={submittedData.applicationType}
        referenceId={submittedData.referenceId}
        onReset={() => {
          setSubmittedData(null);
          setSubmitError(null);
          reset();
        }}
        resetButtonText="Submit Another Application"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      noValidate
    >
      {/* Honeypot for spam protection */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("company")}
      />

      {/* Program Context Banner */}
      {(watchedProg || defaultSelected) && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
              You're Applying For
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
              const el = document.getElementById("selectedProgram");
              el?.focus();
            }}
            className="self-start sm:self-auto text-xs h-8"
          >
            Change Program
          </Button>
        </div>
      )}

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
                Submission Could Not Be Completed
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
                  `Hello TechBuilt Admissions, I had an issue submitting my application for ${watchedProg || "a course"}. Could you assist?`,
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

      {/* SECTION 1: Learner Personal Information */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <UserCheck className="h-4 w-4 text-primary" /> 1. Learner Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="studentName">Learner full name *</Label>
            <Input
              id="studentName"
              className="mt-1.5"
              placeholder="e.g. Muhammad Ahmed"
              aria-required="true"
              {...register("studentName")}
            />
            <ErrorText msg={errors.studentName?.message} />
          </div>

          <div>
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              className="mt-1.5"
              placeholder="student@example.com"
              aria-required="true"
              {...register("email")}
            />
            <ErrorText msg={errors.email?.message} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">WhatsApp / Phone number *</Label>
            <Input
              id="phone"
              className="mt-1.5"
              placeholder="+92 300 1234567"
              aria-required="true"
              {...register("phone")}
            />
            <ErrorText msg={errors.phone?.message} />
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              className="mt-1.5"
              placeholder="e.g. Pakistan, UAE, UK, USA"
              aria-required="true"
              {...register("country")}
            />
            <ErrorText msg={errors.country?.message} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="city">City (optional)</Label>
            <Input
              id="city"
              className="mt-1.5"
              placeholder="e.g. Lahore, Karachi"
              {...register("city")}
            />
          </div>

          <div>
            <Label htmlFor="age">Age (years)</Label>
            <Input id="age" className="mt-1.5" placeholder="e.g. 14 or 22" {...register("age")} />
          </div>

          <div>
            <Label htmlFor="educationLevel">Current Education Level *</Label>
            <select
              id="educationLevel"
              className={cn(fieldClass, "mt-1.5")}
              aria-required="true"
              {...register("educationLevel")}
            >
              <option value="">Select level / grade</option>
              {educationLevelOptions.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.educationLevel?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="institution">Current School / College / University (optional)</Label>
          <Input
            id="institution"
            className="mt-1.5"
            placeholder="e.g. Beaconhouse, FAST, NUST, etc."
            {...register("institution")}
          />
        </div>
      </div>

      {/* SECTION 2: Parent / Guardian Information */}
      <div
        className={cn(
          "rounded-xl border p-4 sm:p-5 transition-all space-y-4",
          isMinor ? "border-amber-400/50 bg-amber-500/5" : "border-border/60 bg-muted/20",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck
              className={cn("h-4 w-4", isMinor ? "text-amber-500" : "text-muted-foreground")}
            />
            2. Parent / Guardian Information
          </h3>
          {isMinor && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Required for Minors Under 18
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {isMinor
            ? "Because the learner is under 18, we require parent or guardian contact details to coordinate batch timings, orientation, and academic progress."
            : "Optional for adult learners. For minors, parent/guardian contact is required."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="guardianName">
              Parent / Guardian Name {isMinor ? "*" : "(optional)"}
            </Label>
            <Input
              id="guardianName"
              className="mt-1.5 bg-background"
              placeholder="Father / Mother / Guardian full name"
              {...register("guardianName")}
            />
            <ErrorText msg={errors.guardianName?.message} />
          </div>

          <div>
            <Label htmlFor="guardianPhone">
              Parent WhatsApp / Phone {isMinor ? "*" : "(optional)"}
            </Label>
            <Input
              id="guardianPhone"
              className="mt-1.5 bg-background"
              placeholder="+92 300 0000000"
              {...register("guardianPhone")}
            />
            <ErrorText msg={errors.guardianPhone?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="guardianEmail">Parent / Guardian Email (optional)</Label>
          <Input
            id="guardianEmail"
            type="email"
            className="mt-1.5 bg-background"
            placeholder="guardian@example.com"
            {...register("guardianEmail")}
          />
        </div>
      </div>

      {/* SECTION 3: Program of Interest */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <GraduationCap className="h-4 w-4 text-primary" /> 3. Program of Interest
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="applicationType">Application Category *</Label>
            <select
              id="applicationType"
              className={cn(fieldClass, "mt-1.5")}
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
            <Label htmlFor="selectedProgram">Selected Course / Subject / Program *</Label>
            <input
              id="selectedProgram"
              list="application-program-list"
              className={cn(fieldClass, "mt-1.5")}
              placeholder="Choose or type, e.g. Python, Full Stack Developer, Mathematics"
              aria-required="true"
              {...register("selectedProgram")}
            />
            <datalist id="application-program-list">
              {filteredSuggestions.map((item) => (
                <option key={`${item.group}-${item.slug}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </datalist>
            <ErrorText msg={errors.selectedProgram?.message} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="skillLevel">Current Experience Level</Label>
            <select
              id="skillLevel"
              className={cn(fieldClass, "mt-1.5")}
              {...register("skillLevel")}
            >
              {skillLevelOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="learningGoal">Your Primary Goal</Label>
            <Input
              id="learningGoal"
              className="mt-1.5"
              placeholder="e.g. Build projects / Improve board exam grades / Switch careers"
              {...register("learningGoal")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Learning Preferences & Schedule */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <Calendar className="h-4 w-4 text-primary" /> 4. Learning Format &amp; Schedule
          Preferences
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="learningPreference">Preferred Learning Format *</Label>
            <select
              id="learningPreference"
              className={cn(fieldClass, "mt-1.5")}
              aria-required="true"
              {...register("learningPreference")}
            >
              {learningPreferenceOptions.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.learningPreference?.message} />
          </div>

          <div>
            <Label htmlFor="classesPerWeek">Classes Frequency Preference</Label>
            <select
              id="classesPerWeek"
              className={cn(fieldClass, "mt-1.5")}
              {...register("classesPerWeek")}
            >
              {classesPerWeekOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="preferredDays">Preferred Days</Label>
            <select
              id="preferredDays"
              className={cn(fieldClass, "mt-1.5")}
              {...register("preferredDays")}
            >
              {preferredDaysOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="preferredTime">Preferred Time Window</Label>
            <select
              id="preferredTime"
              className={cn(fieldClass, "mt-1.5")}
              {...register("preferredTime")}
            >
              {preferredTimeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Additional Requirements / Notes</Label>
          <Textarea
            id="notes"
            className="mt-1.5 min-h-24"
            placeholder="Tell us any specific curriculum syllabus (Cambridge, Federal, Punjab, University), timing constraints, or questions."
            {...register("notes")}
          />
        </div>
      </div>

      {/* SECTION 5: Consent & Submit */}
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
          <input
            id="consent"
            type="checkbox"
            aria-required="true"
            {...register("consent")}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Label
            htmlFor="consent"
            className="text-xs font-normal leading-relaxed text-muted-foreground"
          >
            I agree to be contacted by TechBuilt Open School admissions regarding my application.
            There is no obligation to enrol until syllabus, batch timetable, and fees are mutually
            confirmed. *
          </Label>
        </div>
        <ErrorText msg={errors.consent?.message as string | undefined} />

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting Application…
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </form>
  );
}
