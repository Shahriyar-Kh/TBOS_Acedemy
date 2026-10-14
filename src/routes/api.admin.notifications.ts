import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/admin/notifications")({
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

        // Fetch stored notifications
        const { data: stored } = await client
          .from("crm_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        // Calculate dynamic real-time alerts
        const dynamicAlerts: Array<{
          id: string;
          title: string;
          message: string;
          type: string;
          link?: string;
          is_read: boolean;
          created_at: string;
        }> = [];

        // 1. Follow-ups due today
        const nowIso = new Date().toISOString();
        const { count: followUpCount } = await client
          .from("admissions_requests")
          .select("*", { count: "exact", head: true })
          .lte("next_follow_up_at", nowIso)
          .not("status", "in", '("enrolled","closed","rejected","archived")');

        if (followUpCount && followUpCount > 0) {
          dynamicAlerts.push({
            id: "dyn-followup",
            title: "Follow-ups Due",
            message: `${followUpCount} admission follow-up(s) are pending action today.`,
            type: "follow_up_due",
            link: "/admin/admissions?view=followups",
            is_read: false,
            created_at: nowIso,
          });
        }

        // 2. Overdue fees
        const todayStr = new Date().toISOString().split("T")[0];
        const { count: overdueCount } = await client
          .from("fee_invoices")
          .select("*", { count: "exact", head: true })
          .lt("due_date", todayStr)
          .gt("balance", 0);

        if (overdueCount && overdueCount > 0) {
          dynamicAlerts.push({
            id: "dyn-overdue",
            title: "Overdue Tuition Dues",
            message: `${overdueCount} student invoice(s) have passed their due date.`,
            type: "payment_due",
            link: "/admin/fees?tab=overdue",
            is_read: false,
            created_at: nowIso,
          });
        }

        // 3. New unreviewed submissions
        const { count: newLeadsCount } = await client
          .from("admissions_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "new");

        if (newLeadsCount && newLeadsCount > 0) {
          dynamicAlerts.push({
            id: "dyn-new-leads",
            title: "New Applications",
            message: `${newLeadsCount} new student application(s) awaiting initial review.`,
            type: "new_application",
            link: "/admin/admissions?status=new",
            is_read: false,
            created_at: nowIso,
          });
        }

        const merged = [...dynamicAlerts, ...(stored || [])];

        return new Response(
          JSON.stringify({
            ok: true,
            notifications: merged,
            unreadCount: merged.filter((n) => !n.is_read).length,
          }),
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
          body = {};
        }

        if (body.notificationId && !body.notificationId.startsWith("dyn-")) {
          await client
            .from("crm_notifications")
            .update({ is_read: true })
            .eq("id", body.notificationId);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

