import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateCrmTaskSchema } from "@/lib/crmSchemas";

export const Route = createFileRoute("/api/admin/tasks/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }: { request: Request; params: { id: string } }) => {
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

        const taskId = params.id;
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = updateCrmTaskSchema.safeParse(body);
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

        if (d.title !== undefined) updates.title = d.title;
        if (d.description !== undefined) updates.description = d.description;
        if (d.dueDate !== undefined) updates.due_date = d.dueDate;
        if (d.priority !== undefined) updates.priority = d.priority;
        if (d.status !== undefined) {
          updates.status = d.status;
          if (d.status === "completed") {
            updates.completed_at = new Date().toISOString();
          } else {
            updates.completed_at = null;
          }
        }
        if (d.assignedTo !== undefined) updates.assigned_to = d.assignedTo;

        const { data: updated, error } = await client
          .from("crm_tasks")
          .update(updates)
          .eq("id", taskId)
          .select()
          .single();

        if (error || !updated) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to update task" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, task: updated }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
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

        const taskId = params.id;
        const { error } = await client.from("crm_tasks").delete().eq("id", taskId);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to delete task" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

