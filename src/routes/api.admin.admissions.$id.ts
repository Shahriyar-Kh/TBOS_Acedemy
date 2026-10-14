import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { adminAdmissionsPatchSchema } from "@/lib/adminCrm";
import {
  retryAdmissionsDeliveries,
  type IntegrationChannel,
} from "@/lib/admissionsIntegrations.server";

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
          return new Response(JSON.stringify({ ok: false, error: "Database client unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const admissionId = params.id;

        // 1. Fetch admission record
        const { data: admission, error: fetchError } = await client
          .from("admissions_requests")
          .select("*")
          .eq("id", admissionId)
          .single();

        if (fetchError || !admission) {
          return new Response(JSON.stringify({ ok: false, error: "Admissions record not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
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

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        // Destructive CRM action: only owner/admin roles may permanently delete records.
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { client } = getSupabaseServerClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "Database client unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const admissionId = params.id;

        const { data: existing, error: findError } = await client
          .from("admissions_requests")
          .select("id, student_name, selected_program_title")
          .eq("id", admissionId)
          .single();

        if (findError || !existing) {
          return new Response(JSON.stringify({ ok: false, error: "Admissions record not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // admissions_activity and admissions_delivery_log are removed by FK cascade.
        const { error: deleteError } = await client
          .from("admissions_requests")
          .delete()
          .eq("id", admissionId);

        if (deleteError) {
          console.error("Admissions delete error:", deleteError.message);
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to delete admissions record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        console.info("Admissions record permanently deleted", {
          admissionId,
          adminUserId: auth.admin.user.id,
        });

        return new Response(
          JSON.stringify({
            ok: true,
            deletedId: admissionId,
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
          return new Response(JSON.stringify({ ok: false, error: "Database client unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // 2. Parse and validate JSON
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = adminAdmissionsPatchSchema.safeParse(body);
        if (!parsed.success) {
          const firstErr = parsed.error.errors[0]?.message || "Invalid patch parameters";
          return new Response(JSON.stringify({ ok: false, error: firstErr }), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
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
          return new Response(JSON.stringify({ ok: false, error: "Admissions record not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
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

        if (
          patch.nextFollowUpAt !== undefined &&
          patch.nextFollowUpAt !== existing.next_follow_up_at
        ) {
          updatePayload.next_follow_up_at = patch.nextFollowUpAt || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "follow_up_set",
            note: patch.nextFollowUpAt
              ? `Follow-up scheduled for ${patch.nextFollowUpAt}`
              : "Follow-up cleared",
          });
        }

        if (patch.demoScheduledAt !== undefined || patch.demoMeetingLink !== undefined) {
          const newDemoAt =
            patch.demoScheduledAt !== undefined
              ? patch.demoScheduledAt || null
              : existing.demo_scheduled_at;
          const newLink =
            patch.demoMeetingLink !== undefined
              ? patch.demoMeetingLink || null
              : existing.demo_meeting_link;

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

        if (
          patch.lastContactedAt !== undefined &&
          patch.lastContactedAt !== existing.last_contacted_at
        ) {
          updatePayload.last_contacted_at = patch.lastContactedAt || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "contacted",
            note: patch.lastContactedAt
              ? `Contacted at ${patch.lastContactedAt}`
              : "Contact timestamp cleared",
          });
        }

        if (patch.closedReason !== undefined && patch.closedReason !== existing.closed_reason) {
          updatePayload.closed_reason = patch.closedReason || null;
          activitiesToInsert.push({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "closed_reason_updated",
            note: patch.closedReason
              ? `Closed reason: ${patch.closedReason}`
              : "Closed reason cleared",
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

      POST: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const auth = await verifyAdminRequest(request);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { client } = getSupabaseServerClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "Database client unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const admissionId = params.id;

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // Defaults to retry-delivery
        }

        // Handle Convert to Enrolled Student
        if (body.action === "convert-to-student") {
          const { convertLeadToStudentSchema } = await import("@/lib/crmSchemas");
          const { generateStudentId, generateInvoiceNumber, logCrmAction } = await import("@/lib/crm.server");

          const parsed = convertLeadToStudentSchema.safeParse({
            leadId: admissionId,
            ...body,
          });

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const conv = parsed.data;

          // 1. Fetch admission lead to verify existence
          const { data: lead, error: leadErr } = await client
            .from("admissions_requests")
            .select("*")
            .eq("id", admissionId)
            .single();

          if (leadErr || !lead) {
            return new Response(JSON.stringify({ ok: false, error: "Lead not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 2. Prevent accidental duplicate enrollment from same lead
          const { data: existingStudent } = await client
            .from("students")
            .select("id, student_id, full_name")
            .or(`lead_id.eq.${admissionId},email.eq.${conv.email.toLowerCase().trim()}`)
            .maybeSingle();

          let studentRecord = existingStudent;

          if (!studentRecord) {
            // Create new student
            const studentId = await generateStudentId();
            const { data: newStud, error: studErr } = await client
              .from("students")
              .insert({
                student_id: studentId,
                full_name: conv.fullName,
                email: conv.email.toLowerCase().trim(),
                phone: conv.phone,
                whatsapp: conv.whatsapp || conv.phone,
                guardian_name: conv.guardianName || null,
                guardian_phone: conv.guardianPhone || null,
                guardian_email: conv.guardianEmail || null,
                age: conv.age || null,
                country: conv.country || "Pakistan",
                city: conv.city || null,
                timezone: "Asia/Karachi",
                status: "active",
                enrollment_date: conv.enrollmentDate,
                billing_day: conv.billingDay,
                lead_id: admissionId,
              })
              .select()
              .single();

            if (studErr || !newStud) {
              console.error("Student creation error in conversion:", studErr);
              return new Response(
                JSON.stringify({ ok: false, error: "Failed to create student record" }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }
            studentRecord = newStud;
          }

          if (!studentRecord) {
            return new Response(
              JSON.stringify({ ok: false, error: "Failed to create or find student record" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // 3. Create Enrollment record
          const { data: enrollment, error: enrollErr } = await client
            .from("enrollments")
            .insert({
              student_id: studentRecord.id,
              batch_id: conv.batchId || null,
              program_slug: conv.programSlug,
              program_title: conv.programTitle,
              program_type: conv.programType,
              instructor_id: conv.instructorId || null,
              instructor_name: conv.instructorName || null,
              agreed_fee: conv.agreedFee,
              discount: conv.discount || 0,
              billing_day: conv.billingDay,
              enrollment_date: conv.enrollmentDate,
              schedule: conv.schedule || null,
              status: "active",
            })
            .select()
            .single();

          if (enrollErr || !enrollment) {
            console.error("Enrollment creation error in conversion:", enrollErr);
            return new Response(
              JSON.stringify({ ok: false, error: "Failed to create enrollment record" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // If batch was assigned, increment active student count
          if (conv.batchId) {
            const { data: bData } = await client
              .from("batches")
              .select("active_student_count")
              .eq("id", conv.batchId)
              .maybeSingle();
            if (bData) {
              await client
                .from("batches")
                .update({ active_student_count: (bData.active_student_count || 0) + 1 })
                .eq("id", conv.batchId);
            }
          }

          // 4. Create Initial Fee Invoice if requested
          let invoiceRecord = null;
          if (conv.createInitialInvoice && conv.agreedFee > 0) {
            const now = new Date();
            const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            const invNumber = await generateInvoiceNumber();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // 7 days grace period

            const { data: inv } = await client
              .from("fee_invoices")
              .insert({
                invoice_number: invNumber,
                student_id: studentRecord.id,
                enrollment_id: enrollment.id,
                billing_month: billingMonth,
                amount_due: conv.agreedFee,
                amount_paid: 0,
                balance: conv.agreedFee,
                due_date: dueDate.toISOString().split("T")[0],
                status: "due",
                notes: `Initial monthly tuition for ${conv.programTitle}`,
              })
              .select()
              .maybeSingle();

            invoiceRecord = inv;
          }

          // 5. Update Lead Status to 'enrolled'
          await client
            .from("admissions_requests")
            .update({
              status: "enrolled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", admissionId);

          // 6. Record Activity & Audit
          await client.from("admissions_activity").insert({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "status_changed",
            old_status: lead.status,
            new_status: "enrolled",
            note: `Converted to Student: ${studentRecord.student_id} (${conv.programTitle})`,
          });

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "convert_lead_to_student",
            entity: "admissions_requests",
            entityId: admissionId,
            details: {
              studentId: studentRecord.student_id,
              programTitle: conv.programTitle,
              agreedFee: conv.agreedFee,
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              student: studentRecord,
              enrollment,
              invoice: invoiceRecord,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        if (body.action && body.action !== "retry-delivery") {
          return new Response(JSON.stringify({ ok: false, error: "Unsupported action" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Fetch admission record
        const { data: admission, error: fetchErr } = await client
          .from("admissions_requests")
          .select("*")
          .eq("id", admissionId)
          .single();

        if (fetchErr || !admission) {
          return new Response(JSON.stringify({ ok: false, error: "Admissions record not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Retry deliveries safely
        const retryResult = await retryAdmissionsDeliveries(admissionId, admission, body.channels);

        return new Response(JSON.stringify(retryResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
