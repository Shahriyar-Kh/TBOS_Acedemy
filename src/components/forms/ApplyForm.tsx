import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck, UserCheck } from "lucide-react";
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
    referenceId?: string;
  } | null>(null);

  const initialType: ApplicationType = normalizeApplicationType(
    defaultApplicationType || defaultCourseType || (formType as string),
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
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
    if (isMinor && (!values.guardianName || values.guardianName.trim().length < 2)) {
      toast.error("Please provide a parent or guardian name for students under 18.");
      return;
    }
    if (isMinor && (!values.guardianPhone || values.guardianPhone.trim().length < 7)) {
      toast.error("Please provide a parent or guardian contact number for students under 18.");
      return;
    }

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
      trackMetaLead({ leadType: "application", contentName: values.selectedProgram });
      setSubmittedData({
        studentName: values.studentName,
        selectedProgram: values.selectedProgram,
        referenceId: result.referenceId,
      });
      reset();
      toast.success("Application received! Our admissions team will review your application and contact you.");
    } else {
      toast.error(result.error ?? "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.");
    }
  };

  if (submittedData) {
    const whatsappFollowup = `Hello TechBuilt Open School, I have submitted an application for ${submittedData.selectedProgram}${submittedData.referenceId ? ` (Ref: ${submittedData.referenceId})` : ""} and would like more information.`;

    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h3 className="mt-4 text-2xl font-bold text-foreground">Application Received!</h3>
        {submittedData.referenceId && (
          <p className="mt-2 text-xs font-mono font-semibold text-primary">
            Application Reference: {submittedData.referenceId}
          </p>
        )}
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thank you, <strong>{submittedData.studentName}</strong>. Your application for{" "}
          <strong>{submittedData.selectedProgram}</strong> has been registered. Our admissions team
          will contact you via WhatsApp or email to discuss your plan, curriculum details,
          and schedule.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="hero" size="lg">
            <a href={whatsappLink(whatsappFollowup)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" /> Message Admissions on WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={() => setSubmittedData(null)}>
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
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

      {/* 1. Student Personal Information */}
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <UserCheck className="h-4 w-4 text-primary" /> 1. Student Information
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="studentName">Student full name *</Label>
            <Input
              id="studentName"
              className="mt-1.5"
              placeholder="e.g. Muhammad Ahmed"
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
              {...register("email")}
            />
            <ErrorText msg={errors.email?.message} />
          </div>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">WhatsApp / Phone number *</Label>
            <Input
              id="phone"
              className="mt-1.5"
              placeholder="+92 300 1234567"
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
              {...register("country")}
            />
            <ErrorText msg={errors.country?.message} />
          </div>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="city">City (optional)</Label>
            <Input id="city" className="mt-1.5" placeholder="e.g. Lahore, Karachi" {...register("city")} />
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
      </div>

      {/* 2. Minor / Guardian Logic */}
      {isMinor && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 sm:p-5 transition-all">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold-foreground" />
            <h4 className="text-sm font-bold text-foreground">
              Parent / Guardian Details (Required for students under 18)
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            We maintain direct, transparent communication with parents regarding class schedules, tutor assignments, and academic progress.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guardianName">Parent / Guardian Name *</Label>
              <Input
                id="guardianName"
                className="mt-1.5 bg-background"
                placeholder="Father / Mother / Guardian full name"
                {...register("guardianName")}
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone">Parent WhatsApp / Phone *</Label>
              <Input
                id="guardianPhone"
                className="mt-1.5 bg-background"
                placeholder="+92 300 0000000"
                {...register("guardianPhone")}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Program Interest */}
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" /> 2. Program of Interest
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="applicationType">Application Category *</Label>
            <select
              id="applicationType"
              className={cn(fieldClass, "mt-1.5")}
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

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
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

      {/* 4. Learning Format & Schedule Preferences */}
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" /> 3. Learning Preferences & Schedule
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="learningPreference">Preferred Learning Format *</Label>
            <select
              id="learningPreference"
              className={cn(fieldClass, "mt-1.5")}
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

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
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

        <div className="mt-4">
          <Label htmlFor="notes">Additional Requirements / Notes</Label>
          <Textarea
            id="notes"
            className="mt-1.5 min-h-24"
            placeholder="Tell us any specific curriculum syllabus (Cambridge, Federal, Punjab, University), timing constraints, or questions."
            {...register("notes")}
          />
        </div>
      </div>

      {/* 5. Consent & Submit */}
      <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
        <input
          id="consent"
          type="checkbox"
          {...register("consent")}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Label htmlFor="consent" className="text-xs font-normal leading-relaxed text-muted-foreground">
          I agree to be contacted by TechBuilt Open School admissions regarding my application. There is no obligation to enrol until arrangements and fees are mutually confirmed. *
        </Label>
      </div>
      <ErrorText msg={errors.consent?.message as string | undefined} />

      <Button
        type="submit"
        variant="hero"
        size="xl"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting Application…
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
