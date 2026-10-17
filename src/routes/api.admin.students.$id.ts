import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateStudentSchema } from "@/lib/crmSchemas";
import { logCrmAction, checkStudentDuplicate, archiveStudentTx, deleteStudentSafeTx } from "@/lib/crm.server";

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

        // Fetch enrollments, invoices, payments, attendance, billing plans, recurring schedules, class sessions, and lead
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

        const d = parsed.data;

        // Proactive duplicate detection if email or phone is updated
        if (d.email || d.phone) {
          const dup = await checkStudentDuplicate({
            email: d.email,
            phone: d.phone,
            excludeStudentId: studentId,
          });

          if (dup.isDuplicate) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: `Another student is already registered with this ${dup.matchedBy} (${dup.existingStudent?.student_id}: ${dup.existingStudent?.full_name}).`,
                matchedBy: dup.matchedBy,
                existingStudent: dup.existingStudent,
              }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (d.fullName !== undefined) updates.full_name = d.fullName;
        if (d.email !== undefined) updates.email = d.email.toLowerCase().trim();
        if (d.phone !== undefined) updates.phone = d.phone;
        if (d.whatsapp !== undefined) updates.whatsapp = d.whatsapp;
        if (d.guardianName !== undefined) updates.guardian_name = d.guardianName;
        if (d.guardianPhone !== undefined) updates.guardian_phone = d.guardianPhone;
        if (d.guardianEmail !== undefined) updates.guardian_email = d.guardianEmail;
        if (d.guardianRelationship !== undefined) updates.guardian_relationship = d.guardianRelationship;
        if (d.emergencyContact !== undefined) updates.emergency_contact = d.emergencyContact;
        if (d.dateOfBirth !== undefined) updates.date_of_birth = d.dateOfBirth;
        if (d.age !== undefined) updates.age = d.age;
        if (d.address !== undefined) updates.address = d.address;
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

      POST: async ({ request, params }: { request: Request; params: { id: string } }) => {
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
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Action: Archive Student
        if (body.action === "archive") {
          try {
            const result = await archiveStudentTx({
              studentId,
              reason: body.reason || "Archived by administrator",
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            });

            return new Response(
              JSON.stringify({ ok: true, success: true, ...result }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            return new Response(
              JSON.stringify({ ok: false, error: err.message || "Failed to archive student" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Action: Restore Student
        if (body.action === "restore") {
          const nowIso = new Date().toISOString();
          const { data: restored, error: restErr } = await client
            .from("students")
            .update({ status: "active", archived_at: null, archived_by: null, archive_reason: null, updated_at: nowIso })
            .eq("id", studentId)
            .select()
            .single();

          if (restErr || !restored) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to restore student" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            action: "restore_student",
            entity: "students",
            entityId: studentId,
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, student: restored }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Quick Status Update
        if (body.action === "update-status" && body.status) {
          const targetStatus = body.status;
          const { data: updated, error: updErr } = await client
            .from("students")
            .update({ status: targetStatus, updated_at: new Date().toISOString() })
            .eq("id", studentId)
            .select()
            .single();

          if (updErr || !updated) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to update student status" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            action: "update_student_status",
            entity: "students",
            entityId: studentId,
            details: { newStatus: targetStatus },
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, student: updated }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(JSON.stringify({ ok: false, error: "Unsupported action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const studentId = params.id;
        const url = new URL(request.url);
        const isPermanent = url.searchParams.get("permanent") === "true";

        if (isPermanent) {
          // Owner-only permanent deletion with financial safety verification
          const auth = await verifyAdminRequest(request, ["owner"]);
          if (!auth.ok) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: auth.status === 403
                  ? "Only system owners can permanently delete student records."
                  : auth.error,
              }),
              { status: auth.status, headers: { "Content-Type": "application/json" } },
            );
          }

          try {
            const result = await deleteStudentSafeTx({
              studentId,
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            });

            return new Response(
              JSON.stringify({ ok: true, success: true, ...result }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            if (errMsg.includes("STUDENT_HAS_OPERATIONAL_HISTORY") || errMsg.includes("Cannot permanently delete student")) {
              return new Response(
                JSON.stringify({
                  ok: false,
                  hasHistory: true,
                  error: errMsg.replace(/^.*STUDENT_HAS_OPERATIONAL_HISTORY:\s*/, ""),
                }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(
              JSON.stringify({ ok: false, error: errMsg || "Failed to delete student" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Soft archive instead of permanent deletion
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const result = await archiveStudentTx({
            studentId,
            reason: "Archived via delete action",
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
          });

          return new Response(
            JSON.stringify({ ok: true, message: "Student archived successfully", ...result }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ ok: false, error: err.message || "Failed to archive student" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
