import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/admin/admissions")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
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

        // 2. Parse query parameters
        const url = new URL(request.url);
        const search = url.searchParams.get("q")?.trim() || "";
        const statusFilter = url.searchParams.get("status")?.trim() || "";
        const typeFilter = url.searchParams.get("type")?.trim() || "";
        const kindFilter = url.searchParams.get("kind")?.trim() || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
        const limit = Math.min(50, Math.max(5, parseInt(url.searchParams.get("limit") || "20", 10) || 20));
        const offset = (page - 1) * limit;

        // 3. Build query
        let query = client
          .from("admissions_requests")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (statusFilter && statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        if (kindFilter && kindFilter !== "all") {
          query = query.eq("submission_kind", kindFilter);
        }

        if (typeFilter && typeFilter !== "all") {
          query = query.eq("application_type", typeFilter);
        }

        if (search) {
          // Safe OR search across relevant text fields
          const sanitized = search.replace(/[%_,()]/g, " ").trim();
          if (sanitized) {
            query = query.or(
              `student_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,selected_program_title.ilike.%${sanitized}%`,
            );
          }
        }

        // Pagination range
        query = query.range(offset, offset + limit - 1);

        const { data: rows, count: totalCount, error: queryError } = await query;

        if (queryError) {
          console.error("Admin admissions query error:", queryError);
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to retrieve admissions records." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // 4. Compute dashboard statistics from real database rows
        const nowIso = new Date().toISOString();

        const [
          { count: newCount },
          { count: demoReqCount },
          { count: demoSchedCount },
          { count: enrolledCount },
          { count: followUpDueCount },
        ] = await Promise.all([
          client
            .from("admissions_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          client
            .from("admissions_requests")
            .select("*", { count: "exact", head: true })
            .or("submission_kind.eq.demo,status.in.(demo_requested,demo_scheduled,demo_completed)"),
          client
            .from("admissions_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "demo_scheduled"),
          client
            .from("admissions_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "enrolled"),
          client
            .from("admissions_requests")
            .select("*", { count: "exact", head: true })
            .not("next_follow_up_at", "is", null)
            .lte("next_follow_up_at", nowIso)
            .not("status", "in", "(enrolled,closed)"),
        ]);

        const stats = {
          total: totalCount || 0,
          newRequests: newCount || 0,
          demoRequests: demoReqCount || 0,
          scheduledDemos: demoSchedCount || 0,
          enrolled: enrolledCount || 0,
          followUpsDue: followUpDueCount || 0,
        };

        return new Response(
          JSON.stringify({
            ok: true,
            data: rows || [],
            total: totalCount || 0,
            page,
            limit,
            stats,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
