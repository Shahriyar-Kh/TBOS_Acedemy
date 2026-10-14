import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateBatchSchema } from "@/lib/crmSchemas";
import { logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/batches/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: { id: string } }) => {
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

        const batchId = params.id;
        const { data: batch, error } = await client
          .from("batches")
          .select("*, enrollments(*, students(*)), class_sessions(*)")
          .eq("id", batchId)
          .single();

        if (error || !batch) {
          return new Response(JSON.stringify({ ok: false, error: "Batch not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, batch }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      PATCH: async ({ request, params }: { request: Request; params: { id: string } }) => {
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

        const batchId = params.id;
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = updateBatchSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const d = parsed.data;
        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (d.name !== undefined) updates.name = d.name;
        if (d.programSlug !== undefined) updates.program_slug = d.programSlug;
        if (d.programTitle !== undefined) updates.program_title = d.programTitle;
        if (d.programType !== undefined) updates.program_type = d.programType;
        if (d.mode !== undefined) updates.mode = d.mode;
        if (d.instructorId !== undefined) updates.instructor_id = d.instructorId;
        if (d.instructorName !== undefined) updates.instructor_name = d.instructorName;
        if (d.startDate !== undefined) updates.start_date = d.startDate;
        if (d.expectedEndDate !== undefined) updates.expected_end_date = d.expectedEndDate;
        if (d.daysOfWeek !== undefined) updates.days_of_week = d.daysOfWeek;
        if (d.startTime !== undefined) updates.start_time = d.startTime;
        if (d.endTime !== undefined) updates.end_time = d.endTime;
        if (d.timezone !== undefined) updates.timezone = d.timezone;
        if (d.maxCapacity !== undefined) updates.max_capacity = d.maxCapacity;
        if (d.meetingLink !== undefined) updates.meeting_link = d.meetingLink;
        if (d.status !== undefined) updates.status = d.status;
        if (d.notes !== undefined) updates.notes = d.notes;

        const { data: updated, error: updateErr } = await client
          .from("batches")
          .update(updates)
          .eq("id", batchId)
          .select()
          .single();

        if (updateErr || !updated) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to update batch" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "update_batch",
          entity: "batches",
          entityId: batchId,
          details: updates,
        });

        return new Response(
          JSON.stringify({ ok: true, batch: updated }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
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

        const batchId = params.id;
        const { error } = await client
          .from("batches")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", batchId);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to archive batch" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, message: "Batch archived successfully" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

