import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/admin/reports")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "accountant"]);
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
        const exportType = url.searchParams.get("export") || "";

        // Handle specific CSV exports
        if (exportType === "students-roster") {
          const { data: students } = await client
            .from("students")
            .select("student_id, full_name, email, phone, country, city, status, enrollment_date, billing_day")
            .order("student_id", { ascending: true });

          return new Response(JSON.stringify({ ok: true, data: students || [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (exportType === "fee-ledger") {
          const { data: invoices } = await client
            .from("fee_invoices")
            .select("invoice_number, billing_month, amount_due, amount_paid, balance, due_date, status, students(student_id, full_name)")
            .order("due_date", { ascending: false });

          return new Response(JSON.stringify({ ok: true, data: invoices || [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (exportType === "admissions-funnel") {
          const { data: leads } = await client
            .from("admissions_requests")
            .select("student_name, email, phone, selected_program_title, submission_kind, status, created_at")
            .order("created_at", { ascending: false });

          return new Response(JSON.stringify({ ok: true, data: leads || [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (exportType === "attendance-summary") {
          const { data: attendance } = await client
            .from("class_attendance")
            .select("status, recorded_at, class_sessions(title, session_date), students(student_id, full_name)")
            .order("recorded_at", { ascending: false });

          return new Response(JSON.stringify({ ok: true, data: attendance || [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Consolidated Report Analytics Dashboard metrics
        const [
          { count: totalStudents },
          { count: activeStudents },
          { count: totalLeads },
          { count: enrolledLeads },
          { count: demoLeads },
          { data: invoices },
          { data: attendance },
        ] = await Promise.all([
          client.from("students").select("*", { count: "exact", head: true }),
          client.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
          client.from("admissions_requests").select("*", { count: "exact", head: true }),
          client.from("admissions_requests").select("*", { count: "exact", head: true }).eq("status", "enrolled"),
          client.from("admissions_requests").select("*", { count: "exact", head: true }).ilike("status", "%demo%"),
          client.from("fee_invoices").select("amount_due, amount_paid, balance, status"),
          client.from("class_attendance").select("status"),
        ]);

        const allInvoices = invoices || [];
        const totalBilled = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_due) || 0), 0);
        const totalCollected = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
        const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

        const allAttendance = attendance || [];
        const totalSessions = allAttendance.length;
        const presentCount = allAttendance.filter((a) => a.status === "present").length;
        const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

        return new Response(
          JSON.stringify({
            ok: true,
            metrics: {
              totalStudents: totalStudents || 0,
              activeStudents: activeStudents || 0,
              totalLeads: totalLeads || 0,
              enrolledLeads: enrolledLeads || 0,
              demoLeads: demoLeads || 0,
              conversionRate: totalLeads && totalLeads > 0 ? Math.round(((enrolledLeads || 0) / totalLeads) * 100) : 0,
              totalBilled,
              totalCollected,
              collectionRate,
              attendanceRate,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

