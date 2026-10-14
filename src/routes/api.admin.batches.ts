import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { createBatchSchema } from "@/lib/crmSchemas";
import { logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/batches")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { client } = getSupabaseServerClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "Database unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const url = new URL(request.url);
        const status = url.searchParams.get("status") || "all";
        const programType = url.searchParams.get("type") || "all";

        let query = client.from("batches").select("*, enrollments(id, student_id, agreed_fee, status, students(id, full_name, email, phone, student_id))").order("created_at", { ascending: false });

        if (status !== "all") query = query.eq("status", status);
        if (programType !== "all") query = query.eq("program_type", programType);

        // RBAC row scoping: instructors can only view batches assigned to them
        if (auth.admin.admin.role === "instructor") {
          query = query.eq("instructor_id", auth.admin.user.id);
        }

        const { data: batches, error } = await query;

        if (error) {
          console.error("Batches query error:", error);
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch batches" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, batches: batches || [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "admissions"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { client } = getSupabaseServerClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "Database unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = createBatchSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const d = parsed.data;
        const { data: newBatch, error: insertErr } = await client
          .from("batches")
          .insert({
            name: d.name,
            program_slug: d.programSlug,
            program_title: d.programTitle,
            program_type: d.programType,
            mode: d.mode,
            instructor_id: d.instructorId || null,
            instructor_name: d.instructorName || null,
            start_date: d.startDate || null,
            expected_end_date: d.expectedEndDate || null,
            days_of_week: d.daysOfWeek || [],
            start_time: d.startTime || null,
            end_time: d.endTime || null,
            timezone: d.timezone || "Asia/Karachi",
            max_capacity: d.maxCapacity || 20,
            meeting_link: d.meetingLink || null,
            status: d.status || "active",
            notes: d.notes || null,
          })
          .select()
          .single();

        if (insertErr || !newBatch) {
          console.error("Batch insert error:", insertErr);
          return new Response(JSON.stringify({ ok: false, error: "Failed to create batch" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "create_batch",
          entity: "batches",
          entityId: newBatch.id,
          details: { name: newBatch.name, programTitle: newBatch.program_title },
        });

        return new Response(
          JSON.stringify({ ok: true, batch: newBatch }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

