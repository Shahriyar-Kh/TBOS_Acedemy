import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateStudentSchema } from "@/lib/crmSchemas";
import { logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/students/$id")({
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

        const studentId = params.id;

        // Fetch student with all relationships
        const { data: student, error: fetchErr } = await client
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        if (fetchErr || !student) {
          return new Response(JSON.stringify({ ok: false, error: "Student not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Fetch enrollments, invoices, payments, attendance, billing plans, recurring schedules, and class sessions
        const [
          { data: enrollments },
          { data: invoices },
          { data: payments },
          { data: attendance },
          { data: billingPlans },
          { data: recurringSchedules },
          { data: sessions },
          { data: tasks },
          { data: lead },
        ] = await Promise.all([
          client.from("enrollments").select("*, batches(*)").eq("student_id", studentId),
          client.from("fee_invoices").select("*").eq("student_id", studentId).order("due_date", { ascending: false }),
          client.from("fee_payments").select("*").eq("student_id", studentId).order("payment_date", { ascending: false }),
          client.from("class_attendance").select("*, class_sessions(*)").eq("student_id", studentId),
          client.from("billing_plans").select("*").eq("student_id", studentId),
          client.from("recurring_class_schedules").select("*").eq("student_id", studentId),
          client.from("class_sessions").select("*, batches(*)").eq("student_id", studentId).order("session_date", { ascending: true }),
          client.from("crm_tasks").select("*").eq("related_id", studentId).order("created_at", { ascending: false }),
          student.lead_id ? client.from("admissions_requests").select("*").eq("id", student.lead_id).maybeSingle() : Promise.resolve({ data: null }),
        ]);

        return new Response(
          JSON.stringify({
            ok: true,
            student,
            enrollments: enrollments || [],
            invoices: invoices || [],
            payments: payments || [],
            attendance: attendance || [],
            billingPlans: billingPlans || [],
            recurringSchedules: recurringSchedules || [],
            sessions: sessions || [],
            tasks: tasks || [],
            lead: lead || null,
          }),
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

        const studentId = params.id;
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = updateStudentSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const d = parsed.data;
        if (d.fullName !== undefined) updates.full_name = d.fullName;
        if (d.email !== undefined) updates.email = d.email.toLowerCase().trim();
        if (d.phone !== undefined) updates.phone = d.phone;
        if (d.whatsapp !== undefined) updates.whatsapp = d.whatsapp;
        if (d.guardianName !== undefined) updates.guardian_name = d.guardianName;
        if (d.guardianPhone !== undefined) updates.guardian_phone = d.guardianPhone;
        if (d.guardianEmail !== undefined) updates.guardian_email = d.guardianEmail;
        if (d.country !== undefined) updates.country = d.country;
        if (d.city !== undefined) updates.city = d.city;
        if (d.timezone !== undefined) updates.timezone = d.timezone;
        if (d.status !== undefined) updates.status = d.status;
        if (d.billingDay !== undefined) updates.billing_day = d.billingDay;
        if (d.notes !== undefined) updates.notes = d.notes;

        const { data: updated, error: updateErr } = await client
          .from("students")
          .update(updates)
          .eq("id", studentId)
          .select()
          .single();

        if (updateErr || !updated) {
          console.error("Student update error:", updateErr);
          return new Response(JSON.stringify({ ok: false, error: "Failed to update student" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "update_student",
          entity: "students",
          entityId: studentId,
          details: updates,
        });

        return new Response(
          JSON.stringify({ ok: true, student: updated }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        // Soft archive instead of cascade destructive delete
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

        const studentId = params.id;
        const { error } = await client
          .from("students")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", studentId);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to archive student" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "archive_student",
          entity: "students",
          entityId: studentId,
        });

        return new Response(
          JSON.stringify({ ok: true, message: "Student archived successfully" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

