import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/admin/reminders")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "admissions", "instructor"]);
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
        const type = url.searchParams.get("type") || "all";
        const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));

        let query = client
          .from("crm_reminders")
          .select("*")
          .order("scheduled_for", { ascending: false })
          .limit(limit);

        if (status !== "all") query = query.eq("status", status);
        if (type !== "all") query = query.eq("type", type);

        const { data: reminders, error } = await query;
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch reminders" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true, reminders: reminders || [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

