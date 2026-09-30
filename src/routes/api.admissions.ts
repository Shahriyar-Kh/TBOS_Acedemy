import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, type AdmissionsRequestRecord } from "@/lib/supabase.server";
import {
  admissionsSubmissionSchema,
  resolveAndValidateProgram,
  validateAdmissionsPayload,
} from "@/lib/admissions";

export const Route = createFileRoute("/api/admissions")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // 1. Validate content type
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return new Response(
            JSON.stringify({ ok: false, error: "Content-Type must be application/json" }),
            { status: 415, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Malformed JSON payload" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // 2. Validate against schema
        const parsed = admissionsSubmissionSchema.safeParse(body);
        if (!parsed.success) {
          const firstErr = parsed.error.errors[0]?.message || "Invalid submission parameters";
          return new Response(
            JSON.stringify({ ok: false, error: firstErr }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const data = parsed.data;

        // 3. Honeypot check — drop silently without database persistence
        if (data.company && data.company.trim().length > 0) {
          return new Response(
            JSON.stringify({ ok: true, referenceId: "TBOS-OK" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // 4. Domain validation (e.g. minor guardian requirements, demo preferences)
        const domainCheck = validateAdmissionsPayload(data);
        if (!domainCheck.valid) {
          return new Response(
            JSON.stringify({ ok: false, error: domainCheck.error }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        // 5. Validate selected program against real repository catalog
        const programValidation = resolveAndValidateProgram(
          data.selectedProgram,
          data.applicationType,
        );
        if (!programValidation.valid) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: programValidation.error || "Please select a valid program from our catalog.",
            }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        // 6. Request-time Supabase configuration check
        const { client: supabase, configured } = getSupabaseServerClient();
        if (!configured || !supabase) {
          console.warn("Admissions submission received but Supabase server credentials are not configured.");
          return new Response(
            JSON.stringify({
              ok: false,
              error:
                data.submissionKind === "demo"
                  ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
                  : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }

        // 7. Initial CRM status
        const initialStatus = data.submissionKind === "demo" ? "demo_requested" : "new";

        // Parse age to numeric or null
        const numericAge =
          data.age && data.age.trim() !== "" ? parseInt(data.age.trim(), 10) : null;

        const row: AdmissionsRequestRecord = {
          submission_kind: data.submissionKind,
          application_type: programValidation.applicationType,
          selected_program_slug: data.selectedProgramSlug || programValidation.selectedProgramSlug,
          selected_program_title: programValidation.selectedProgramTitle,
          selected_program_category: programValidation.selectedProgramCategory,

          student_name: data.studentName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          country: data.country.trim(),
          city: data.city?.trim() || null,
          age: numericAge,
          education_level: data.educationLevel.trim(),
          institution: data.institution?.trim() || null,
          skill_level: data.skillLevel?.trim() || null,

          learning_goal: data.learningGoal?.trim() || null,
          learning_preference: data.learningPreference?.trim() || null,

          preferred_days: data.preferredDays?.trim() || null,
          preferred_time: data.preferredTime?.trim() || null,
          timezone: data.timezone?.trim() || null,

          guardian_name: data.guardianName?.trim() || null,
          guardian_phone: data.guardianPhone?.trim() || null,
          guardian_email: data.guardianEmail?.trim() || null,

          notes: data.notes?.trim() || null,
          source_page: data.sourcePage?.trim() || "Admissions Endpoint",

          status: initialStatus,
        };

        // 8. Insert into PostgreSQL via Supabase elevated secret-key client
        const { data: inserted, error: insertError } = await supabase
          .from("admissions_requests")
          .insert(row)
          .select("id")
          .single();

        if (insertError) {
          console.error("Supabase admissions insert failed:", insertError.message);
          return new Response(
            JSON.stringify({
              ok: false,
              error:
                data.submissionKind === "demo"
                  ? "We couldn't submit your demo request right now. Please try again or contact admissions on WhatsApp."
                  : "We couldn't submit your application right now. Please try again or contact admissions on WhatsApp.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // 9. Generate safe public reference ID
        const rawId = inserted?.id ? String(inserted.id) : "";
        const shortRef = rawId ? `TBOS-${rawId.slice(0, 8).toUpperCase()}` : undefined;

        return new Response(
          JSON.stringify({
            ok: true,
            referenceId: shortRef,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
