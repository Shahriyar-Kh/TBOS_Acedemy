import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { adminAdmissionsPatchSchema } from "@/lib/adminCrm";

export const Route = createFileRoute("/api/admin/admissions/$id")({
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
          return new Response(
            JSON.stringify({ ok: false, error: "Database client unavailable" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const admissionId = params.id;

        // 1. Fetch admission record
        const { data: admission, error: fetchError } = await client
          .from("admissions_requests")
          .select("*")
          .eq("id", admissionId)
          .single();

        if (fetchError || !admission) {
          return new Response(
            JSON.stringify({ ok: false, error: "Admissions record not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        // 2. Fetch activity audit logs
        const { data: activities } = await client
          .from("admissions_activity")
          .select("*")
          .eq("admission_id", admissionId)
          .order("created_at", { ascending: false });

        // 3. Fetch delivery integration logs for this admission only
        const { data: deliveryLogs } = await client
          .from("admissions_delivery_log")
          .select("*")
          .eq("admission_id", admissionId)
          .order("created_at", { ascending: true });

        return new Response(
          JSON.stringify({
            ok: true,
            admission,
            activities: activities || [],
            deliveryLogs: deliveryLogs || [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      PATCH: async ({ request, params }: { request: Request; params: { id: string } }) => {
        // 1. Authorize admin
        const auth = await verifyAdminRequest(request);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { client } = getSupabaseServerClient();
        if (!client) {
          return new Response(
            JSON.stringify({ ok: false, error: "Database client unavailable" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // 2. Parse and validate JSON
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Malformed JSON payload" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const parsed = adminAdmissionsPatchSchema.safeParse(body);
        if (!parsed.success) {
          const firstErr = parsed.error.errors[0]?.message || "Invalid patch parameters";
          return new Response(
            JSON.stringify({ ok: false, error: firstErr }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const patch = parsed.data;
        const admissionId = params.id;

        // 3. Fetch current state to verify existence and prepare activity audit trail
        const { data: existing, error: findError } = await client
          .from("admissions_requests")
          .select("*")
          .eq("id", admissionId)
          .single();

        if (findError || !existing) {
          return new Response(
            JSON.stringify({ ok: false, error: "Admissions record not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        // 4. Build sanitized update object with only allowed CRM fields
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const activitiesToInsert: Array<{
          admission_id: string;
          admin_user_id: string;
          action_type:
            | "status_changed"
            | "note_updated"
            | "demo_scheduled"
            | "follow_up_set"
            | "contacted"
            | "closed_reason_updated";
          old_status?: string | null;
          new_status?: string | null;
          note?: string | null;
        }> = [];

        if (patch.status !== undefined && patch.status !== existing.status) {
          updatePayload.status = patch.status;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "status_changed",
            old_status: existing.status,
            new_status: patch.status,
            note: `Status updated from ${existing.status} to ${patch.status}`,
          });
        }

        if (patch.adminNotes !== undefined && patch.adminNotes !== existing.admin_notes) {
          updatePayload.admin_notes = patch.adminNotes;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "note_updated",
            note: patch.adminNotes ? "Admin note updated" : "Admin note cleared",
          });
        }

        if (patch.nextFollowUpAt !== undefined && patch.nextFollowUpAt !== existing.next_follow_up_at) {
          updatePayload.next_follow_up_at = patch.nextFollowUpAt || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "follow_up_set",
            note: patch.nextFollowUpAt ? `Follow-up scheduled for ${patch.nextFollowUpAt}` : "Follow-up cleared",
          });
        }

        if (
          patch.demoScheduledAt !== undefined ||
          patch.demoMeetingLink !== undefined
        ) {
          const newDemoAt = patch.demoScheduledAt !== undefined ? (patch.demoScheduledAt || null) : existing.demo_scheduled_at;
          const newLink = patch.demoMeetingLink !== undefined ? (patch.demoMeetingLink || null) : existing.demo_meeting_link;

          if (newDemoAt !== existing.demo_scheduled_at || newLink !== existing.demo_meeting_link) {
            updatePayload.demo_scheduled_at = newDemoAt;
            updatePayload.demo_meeting_link = newLink;

            // If demo is scheduled and status was demo_requested, automatically suggest demo_scheduled
            if (newDemoAt && (!patch.status || patch.status === "demo_requested")) {
              updatePayload.status = "demo_scheduled";
            }

            activitiesToInsert.push({
              admission_id: admissionId,
              admin_user_id: auth.admin.user.id,
              action_type: "demo_scheduled",
              note: newDemoAt ? `Demo scheduled for ${newDemoAt}` : "Demo schedule updated",
            });
          }
        }

        if (patch.lastContactedAt !== undefined && patch.lastContactedAt !== existing.last_contacted_at) {
          updatePayload.last_contacted_at = patch.lastContactedAt || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "contacted",
            note: patch.lastContactedAt ? `Contacted at ${patch.lastContactedAt}` : "Contact timestamp cleared",
          });
        }

        if (patch.closedReason !== undefined && patch.closedReason !== existing.closed_reason) {
          updatePayload.closed_reason = patch.closedReason || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "closed_reason_updated",
            note: patch.closedReason ? `Closed reason: ${patch.closedReason}` : "Closed reason cleared",
          });
        }

        // 5. Update record
        const { data: updated, error: updateError } = await client
          .from("admissions_requests")
          .update(updatePayload)
          .eq("id", admissionId)
          .select("*")
          .single();

        if (updateError) {
          console.error("Admissions patch update error:", updateError);
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to update admissions record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // 6. Record audit activity
        if (activitiesToInsert.length > 0) {
          await client.from("admissions_activity").insert(activitiesToInsert);
        }

        return new Response(
          JSON.stringify({
            ok: true,
            admission: updated,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
