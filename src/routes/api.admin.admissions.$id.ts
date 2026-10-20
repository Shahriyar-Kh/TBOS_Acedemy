import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { adminAdmissionsPatchSchema } from "@/lib/adminCrm";
import {
  retryAdmissionsDeliveries,
  type IntegrationChannel,
} from "@/lib/admissionsIntegrations.server";
import {
  scheduleDemoSchema,
  updateDemoOutcomeSchema,
  convertLeadToStudentSchema,
} from "@/lib/crmSchemas";
import {
  checkClassScheduleConflicts,
  convertLeadToStudentTx,
  generateInvoiceNumber,
  logCrmAction,
} from "@/lib/crm.server";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar.server";

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

        // 3. Fetch delivery integration logs
        const { data: deliveryLogs } = await client
          .from("admissions_delivery_log")
          .select("*")
          .eq("admission_id", admissionId)
          .order("created_at", { ascending: true });

        // 4. Fetch linked demo class session if scheduled
        let demoSession: any = null;
        if (admission.demo_class_session_id) {
          const { data: sess } = await client
            .from("class_sessions")
            .select("*, admin_users!class_sessions_instructor_id_fkey(full_name, email)")
            .eq("id", admission.demo_class_session_id)
            .maybeSingle();
          demoSession = sess;
        }

        // 5. Fetch linked converted student if enrolled
        let convertedStudent: any = null;
        if (admission.converted_student_id) {
          const { data: st } = await client
            .from("students")
            .select("id, student_id, full_name, email, phone, status")
            .eq("id", admission.converted_student_id)
            .maybeSingle();
          convertedStudent = st;
        }

        return new Response(
          JSON.stringify({
            ok: true,
            admission,
            activities: activities || [],
            deliveryLogs: deliveryLogs || [],
            demoSession,
            convertedStudent,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
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

        const { error: deleteError } = await client
          .from("admissions_requests")
          .delete()
          .eq("id", admissionId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to delete admissions record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        await client.from("crm_audit_logs").insert({
          admin_user_id: auth.admin.user.id,
          actor_email: auth.admin.user.email,
          action: "delete_admission_record",
          entity: "admissions_requests",
          entity_id: admissionId,
          details: { student_name: existing.student_name, program: existing.selected_program_title },
        });

        return new Response(JSON.stringify({ ok: true, id: admissionId }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
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
          return new Response(JSON.stringify({ ok: false, error: "Database client unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const admissionId = params.id;
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parseResult = adminAdmissionsPatchSchema.safeParse(body);
        if (!parseResult.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parseResult.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const patch = parseResult.data;
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

        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const activitiesToInsert: Array<{
          admission_id: string;
          admin_user_id: string;
          action_type: string;
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

        if (patch.demoScheduledAt !== undefined || patch.demoMeetingLink !== undefined) {
          const newDemoAt = patch.demoScheduledAt !== undefined ? patch.demoScheduledAt || null : existing.demo_scheduled_at;
          const newLink = patch.demoMeetingLink !== undefined ? patch.demoMeetingLink || null : existing.demo_meeting_link;

          if (newDemoAt !== existing.demo_scheduled_at || newLink !== existing.demo_meeting_link) {
            updatePayload.demo_scheduled_at = newDemoAt;
            updatePayload.demo_meeting_link = newLink;
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

        const { data: updated, error: updateError } = await client
          .from("admissions_requests")
          .update(updatePayload)
          .eq("id", admissionId)
          .select("*")
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to update admissions record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        if (activitiesToInsert.length > 0) {
          await client.from("admissions_activity").insert(activitiesToInsert);
        }

        return new Response(
          JSON.stringify({ ok: true, admission: updated }),
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
          // Empty body
        }

        // Action: Schedule CRM Demo
        if (body.action === "schedule-demo") {
          const parsed = scheduleDemoSchema.safeParse({
            leadId: admissionId,
            ...body,
          });

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const { instructorId, instructorName, sessionDate, startTime, endTime, title, meetingLink, override, overrideReason } = parsed.data;

          // Fetch admission details
          const { data: admission, error: admErr } = await client
            .from("admissions_requests")
            .select("*")
            .eq("id", admissionId)
            .single();

          if (admErr || !admission) {
            return new Response(JSON.stringify({ ok: false, error: "Admissions lead not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Check clashes
          const conflictCheck = await checkClassScheduleConflicts({
            sessionDate,
            startTime,
            endTime,
            instructorId: instructorId || null,
          });

          if (conflictCheck.hasConflict && !override) {
            return new Response(
              JSON.stringify({
                ok: false,
                hasConflict: true,
                error: `Schedule clash detected: ${conflictCheck.conflicts[0]?.message}`,
                conflicts: conflictCheck.conflicts,
              }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }

          // Google Calendar & Meet Conference Generation
          let effectiveMeetLink = meetingLink || null;
          let calEventId: string | null = null;
          let calSyncStatus: "synced" | "pending" | "failed" = "pending";
          let calError: string | null = null;

          const demoTitle = title || `Live Demo: ${admission.selected_program_title} (${admission.student_name})`;

          try {
            const attendees: string[] = [];
            if (admission.email) attendees.push(admission.email);
            if (instructorId) {
              const { data: inst } = await client.from("admin_users").select("email").eq("id", instructorId).maybeSingle();
              if (inst?.email) attendees.push(inst.email);
            }

            const calResult = await createGoogleCalendarEvent({
              title: demoTitle,
              sessionDate,
              startTime,
              endTime,
              timezone: "Asia/Karachi",
              attendees,
              createMeetConference: true,
            });

            if (calResult.success) {
              calEventId = calResult.eventId || null;
              calSyncStatus = "synced";
              if (calResult.meetLink) {
                effectiveMeetLink = calResult.meetLink;
              }
            } else {
              calSyncStatus = calResult.configured ? "failed" : "pending";
              calError = calResult.error || null;
            }
          } catch (calErr: any) {
            console.warn("Calendar integration fallback on demo schedule:", calErr);
            calSyncStatus = "failed";
            calError = calErr?.message || "Calendar integration error";
          }

          // Insert demo class session
          const nowIso = new Date().toISOString();
          const { data: newSession, error: sessErr } = await client
            .from("class_sessions")
            .insert({
              title: demoTitle,
              session_date: sessionDate,
              start_time: startTime,
              end_time: endTime,
              timezone: "Asia/Karachi",
              meeting_link: effectiveMeetLink,
              status: "scheduled",
              session_type: "demo",
              instructor_id: instructorId || null,
              instructor_name: instructorName || null,
              google_calendar_event_id: calEventId,
              google_calendar_sync_status: calSyncStatus,
              google_calendar_error: calError,
              is_override: conflictCheck.hasConflict && override,
              override_reason: conflictCheck.hasConflict && override ? overrideReason : null,
              override_by: conflictCheck.hasConflict && override ? auth.admin.user.id : null,
            })
            .select()
            .single();

          if (sessErr || !newSession) {
            return new Response(
              JSON.stringify({ ok: false, error: sessErr?.message || "Failed to create demo class session" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // Update admission record
          const demoScheduledAt = `${sessionDate}T${startTime}:00+05:00`;
          await client
            .from("admissions_requests")
            .update({
              status: "demo_scheduled",
              demo_scheduled_at: demoScheduledAt,
              demo_meeting_link: effectiveMeetLink,
              demo_instructor_id: instructorId || null,
              demo_class_session_id: newSession.id,
              updated_at: nowIso,
            })
            .eq("id", admissionId);

          // Record audit activity
          await client.from("admissions_activity").insert({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "demo_scheduled",
            note: `Demo scheduled for ${sessionDate} ${startTime}-${endTime} PKT with instructor ${instructorName || "Assigned Faculty"}`,
          });

          // Queue automated reminders (Lead student 24h/1h/15m + Instructor 10m + Admin 10m)
          const sessionTimestamp = new Date(demoScheduledAt).getTime();
          if (!isNaN(sessionTimestamp)) {
            // Student lead reminders
            const leadOffsets = [
              { keySuffix: "24h", offsetMs: 24 * 60 * 60 * 1000, label: "24-hour" },
              { keySuffix: "1h", offsetMs: 60 * 60 * 1000, label: "1-hour" },
              { keySuffix: "15m", offsetMs: 15 * 60 * 1000, label: "15-minute" },
            ];

            for (const off of leadOffsets) {
              const schedFor = new Date(sessionTimestamp - off.offsetMs).toISOString();
              await client
                .from("crm_reminders")
                .insert({
                  type: "demo_reminder",
                  entity_type: "admissions_request",
                  entity_id: admissionId,
                  recipient: admission.email,
                  recipient_name: admission.student_name,
                  channel: "email",
                  scheduled_for: schedFor,
                  status: "scheduled",
                  idempotency_key: `rem:demo:${admissionId}:${off.keySuffix}:${admission.email}`,
                  payload: {
                    classTitle: demoTitle,
                    sessionDate,
                    startTime,
                    endTime,
                    meetingLink: effectiveMeetLink,
                    label: off.label,
                  },
                })
                .select("id")
                .maybeSingle();
            }

            // 10-Minute Alert for Instructor
            if (instructorId) {
              const { data: inst } = await client.from("admin_users").select("email, full_name").eq("id", instructorId).maybeSingle();
              if (inst?.email) {
                const tenMinBeforeIso = new Date(sessionTimestamp - 10 * 60 * 1000).toISOString();
                await client
                  .from("crm_reminders")
                  .insert({
                    type: "class_reminder",
                    entity_type: "class_session",
                    entity_id: newSession.id,
                    recipient: inst.email,
                    recipient_name: inst.full_name || instructorName || "Instructor",
                    channel: "email",
                    scheduled_for: tenMinBeforeIso,
                    status: "scheduled",
                    idempotency_key: `rem:demo:${newSession.id}:10m_instructor:${inst.email}`,
                    payload: {
                      recipientRole: "instructor",
                      classTitle: demoTitle,
                      sessionDate,
                      startTime,
                      endTime,
                      meetingLink: effectiveMeetLink,
                      label: "10-minute Demo Alert",
                    },
                  })
                  .select("id")
                  .maybeSingle();
              }
            }
          }

          return new Response(
            JSON.stringify({
              ok: true,
              success: true,
              session: newSession,
              meetingLink: effectiveMeetLink,
              calendarSyncStatus: calSyncStatus,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Update Demo Outcome
        if (body.action === "update-demo-outcome") {
          const parsed = updateDemoOutcomeSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const { outcome, notes, nextFollowUpAt } = parsed.data;
          const nowIso = new Date().toISOString();

          const updatePayload: Record<string, any> = {
            demo_outcome: outcome,
            updated_at: nowIso,
          };

          if (outcome === "completed") {
            updatePayload.status = "demo_completed";
          } else if (outcome === "cancelled") {
            updatePayload.status = "closed";
            updatePayload.closed_reason = notes || "Demo cancelled";
          }

          if (notes) {
            updatePayload.admin_notes = notes;
          }
          if (nextFollowUpAt) {
            updatePayload.next_follow_up_at = nextFollowUpAt;
          }

          const { data: updated, error: updErr } = await client
            .from("admissions_requests")
            .update(updatePayload)
            .eq("id", admissionId)
            .select()
            .single();

          if (updErr || !updated) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to update demo outcome" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await client.from("admissions_activity").insert({
            admission_id: admissionId,
            admin_user_id: auth.admin.user.id,
            action_type: "demo_outcome_updated",
            note: `Demo outcome recorded: ${outcome}${notes ? ` - ${notes}` : ""}`,
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, admission: updated }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Convert to Enrolled Student (New Student or Canonical Link to Existing Student)
        if (body.action === "convert-to-student") {
          // Check if linking to an existing canonical student
          if (body.existingStudentId) {
            const existingStudentId = body.existingStudentId;
            const { data: student, error: stErr } = await client
              .from("students")
              .select("*")
              .eq("id", existingStudentId)
              .single();

            if (stErr || !student) {
              return new Response(JSON.stringify({ ok: false, error: "Target student record not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
              });
            }

            const nowIso = new Date().toISOString();
            const programSlug = body.programSlug || "custom-program";
            const programTitle = body.programTitle || "Custom Program";
            const programType = body.programType || "live_batch";
            const agreedFee = Number(body.agreedFee) || 0;
            const discount = Number(body.discount) || 0;
            const billingDay = Number(body.billingDay) || student.billing_day || 1;

            // 1. Create Enrollment
            const { data: enrollment, error: enrErr } = await client
              .from("enrollments")
              .insert({
                student_id: student.id,
                batch_id: body.batchId || null,
                program_slug: programSlug,
                program_title: programTitle,
                program_type: programType,
                delivery_mode: body.mode || "group",
                instructor_id: body.instructorId || null,
                instructor_name: body.instructorName || null,
                agreed_fee: agreedFee,
                discount,
                billing_day: billingDay,
                enrollment_date: body.enrollmentDate || nowIso.split("T")[0],
                status: "active",
                notes: body.notes || null,
              })
              .select()
              .single();

            if (enrErr || !enrollment) {
              return new Response(JSON.stringify({ ok: false, error: "Failed to create enrollment" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
              });
            }

            // 2. Create Billing Plan
            await client.from("billing_plans").insert({
              student_id: student.id,
              enrollment_id: enrollment.id,
              plan_type: "monthly",
              amount: Math.max(0, agreedFee - discount),
              currency: "PKR",
              billing_day: billingDay,
              status: "active",
              start_date: body.enrollmentDate || nowIso.split("T")[0],
            });

            // 3. Create Initial Fee Invoice (if requested)
            let invoice: any = null;
            if (body.createInitialInvoice !== false) {
              const invoiceNumber = await generateInvoiceNumber();
              const initialAmount = Math.max(0, agreedFee - discount);
              const { data: inv } = await client
                .from("fee_invoices")
                .insert({
                  invoice_number: invoiceNumber,
                  student_id: student.id,
                  enrollment_id: enrollment.id,
                  billing_month: nowIso.substring(0, 7),
                  amount_due: initialAmount,
                  amount_paid: 0,
                  balance: initialAmount,
                  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  status: "due",
                  notes: `Enrollment fee for ${programTitle}`,
                })
                .select()
                .single();
              invoice = inv;
            }

            // 4. Update lead
            await client
              .from("admissions_requests")
              .update({
                status: "enrolled",
                converted_student_id: student.id,
                enrollment_date: nowIso,
                updated_at: nowIso,
              })
              .eq("id", admissionId);

            // 5. Activity and Audit Log
            await client.from("admissions_activity").insert({
              admission_id: admissionId,
              admin_user_id: auth.admin.user.id,
              action_type: "lead_converted_to_student",
              note: `Lead linked to existing canonical student ${student.student_id} (${student.full_name}) and enrolled into ${programTitle}`,
            });

            await logCrmAction({
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email,
              action: "lead_linked_to_existing_student",
              entity: "students",
              entityId: student.id,
              details: { leadId: admissionId, studentId: student.student_id, programTitle },
            });

            return new Response(
              JSON.stringify({ ok: true, student, enrollment, invoice }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          }

          // Otherwise, create brand new student via convertLeadToStudentTx
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
          try {
            const txResult = await convertLeadToStudentTx({
              leadId: admissionId,
              fullName: conv.fullName,
              email: conv.email,
              phone: conv.phone,
              whatsapp: conv.whatsapp,
              guardianName: conv.guardianName,
              guardianPhone: conv.guardianPhone,
              guardianEmail: conv.guardianEmail,
              age: conv.age,
              country: conv.country,
              city: conv.city,
              programSlug: conv.programSlug,
              programTitle: conv.programTitle,
              programType: conv.programType,
              batchId: conv.batchId,
              instructorId: conv.instructorId,
              instructorName: conv.instructorName,
              agreedFee: conv.agreedFee,
              discount: conv.discount,
              billingDay: conv.billingDay,
              enrollmentDate: conv.enrollmentDate,
              schedule: conv.schedule,
              notes: conv.notes,
              createInitialInvoice: conv.createInitialInvoice,
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email,
            });

            return new Response(
              JSON.stringify({
                ok: true,
                student: txResult.student,
                enrollment: txResult.enrollment,
                invoice: txResult.invoice,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            if (err.message === "LEAD_ALREADY_CONVERTED") {
              return new Response(
                JSON.stringify({ ok: false, error: "This lead has already been converted to a student." }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
            if (err.message === "LEAD_NOT_FOUND") {
              return new Response(
                JSON.stringify({ ok: false, error: "Admissions lead record not found." }),
                { status: 404, headers: { "Content-Type": "application/json" } },
              );
            }
            console.error("Conversion transaction error:", err);
            return new Response(
              JSON.stringify({ ok: false, error: err.message || "Failed to convert lead to student" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Action: Retry Delivery Logs
        if (body.action === "retry-delivery" || !body.action) {
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

          const retryResult = await retryAdmissionsDeliveries(admissionId, admission, body.channels);
          return new Response(JSON.stringify(retryResult), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: false, error: "Unsupported action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
