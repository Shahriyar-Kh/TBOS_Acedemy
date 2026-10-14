import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { createCrmTaskSchema } from "@/lib/crmSchemas";
import { logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/tasks")({
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

        let query = client.from("crm_tasks").select("*, admin_users(email, role)").order("due_date", { ascending: true });
        if (status !== "all") query = query.eq("status", status);

        // RBAC row scoping: instructors only see tasks assigned to them
        if (auth.admin.admin.role === "instructor") {
          query = query.eq("assigned_to", auth.admin.user.id);
        }

        const { data: tasks, error } = await query;
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch tasks" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, tasks: tasks || [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
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

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = createCrmTaskSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const d = parsed.data;
        const { data: newTask, error: insErr } = await client
          .from("crm_tasks")
          .insert({
            title: d.title,
            description: d.description || null,
            due_date: d.dueDate,
            priority: d.priority,
            status: d.status,
            assigned_to: d.assignedTo || auth.admin.user.id,
            related_type: d.relatedType || null,
            related_id: d.relatedId || null,
          })
          .select()
          .single();

        if (insErr || !newTask) {
          console.error("Task insert error:", insErr);
          return new Response(JSON.stringify({ ok: false, success: false, error: insErr?.message || "Failed to create task" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "create_crm_task",
          entity: "crm_tasks",
          entityId: newTask.id,
          details: { title: newTask.title, priority: newTask.priority },
        });

        return new Response(
          JSON.stringify({ ok: true, success: true, task: newTask }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

