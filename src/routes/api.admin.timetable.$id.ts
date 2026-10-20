import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateClassSessionSchema, recordAttendanceSchema, rescheduleClassSessionSchema } from "@/lib/crmSchemas";
import { logCrmAction, checkClassScheduleConflicts } from "@/lib/crm.server";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from "@/lib/googleCalendar.server";

export const Route = createFileRoute("/api/admin/timetable/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "instructor"]);
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

        const sessionId = params.id;
        const { data: session, error } = await client
          .from("class_sessions")
          .select("*, batches(*, enrollments(*, students(*))), students(*), class_attendance(*, students(*))")
          .eq("id", sessionId)
          .single();

        if (error || !session) {
          return new Response(JSON.stringify({ ok: false, error: "Class session not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, session }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      PATCH: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "instructor"]);
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

        const sessionId = params.id;
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = updateClassSessionSchema.safeParse(body);
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
        if (d.sessionDate !== undefined) updates.session_date = d.sessionDate;
        if (d.startTime !== undefined) updates.start_time = d.startTime;
        if (d.endTime !== undefined) updates.end_time = d.endTime;
        if (d.instructorId !== undefined) updates.instructor_id = d.instructorId;
        if (d.instructorName !== undefined) updates.instructor_name = d.instructorName;
        if (d.meetingLink !== undefined) updates.meeting_link = d.meetingLink;
        if (d.status !== undefined) updates.status = d.status;
        if (d.topicCovered !== undefined) updates.topic_covered = d.topicCovered;
        if (d.homework !== undefined) updates.homework = d.homework;
        if (d.instructorNotes !== undefined) updates.instructor_notes = d.instructorNotes;

        const { data: updated, error: updateErr } = await client
          .from("class_sessions")
          .update(updates)
          .eq("id", sessionId)
          .select()
          .single();

        if (updateErr || !updated) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to update session" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "update_class_session",
          entity: "class_sessions",
          entityId: sessionId,
          details: updates,
        });

        return new Response(
          JSON.stringify({ ok: true, session: updated }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request, params }: { request: Request; params: { id: string } }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "instructor"]);
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

        const sessionId = params.id;
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Action: Record Attendance
        if (body.action === "record-attendance") {
          const parsed = recordAttendanceSchema.safeParse({
            classSessionId: sessionId,
            attendees: body.attendees,
          });

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const attendees = parsed.data.attendees;
          for (const att of attendees) {
            await client.from("class_attendance").upsert(
              {
                class_session_id: sessionId,
                student_id: att.studentId,
                status: att.status,
                notes: att.notes || null,
                recorded_at: new Date().toISOString(),
              },
              { onConflict: "class_session_id,student_id" },
            );
          }

          // Mark session as completed
          await client
            .from("class_sessions")
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq("id", sessionId);

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "record_attendance",
            entity: "class_sessions",
            entityId: sessionId,
            details: { count: attendees.length },
          });

          return new Response(
            JSON.stringify({ ok: true, message: "Attendance recorded successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Reschedule Session
        if (body.action === "reschedule") {
          const parsed = rescheduleClassSessionSchema.safeParse({
            sessionId,
            ...body,
          });

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const { newSessionDate, newStartTime, newEndTime, reason, override, overrideReason } = parsed.data;

          // Fetch current session
          const { data: currentSession, error: curErr } = await client
            .from("class_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

          if (curErr || !currentSession) {
            return new Response(JSON.stringify({ ok: false, error: "Class session not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Check conflict on target slot
          const conflictCheck = await checkClassScheduleConflicts({
            sessionDate: newSessionDate,
            startTime: newStartTime,
            endTime: newEndTime,
            instructorId: currentSession.instructor_id,
            batchId: currentSession.batch_id,
            studentId: currentSession.student_id,
            excludeSessionId: sessionId,
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

          // Update Google Calendar event if synced
          if (currentSession.google_calendar_event_id) {
            try {
              await updateGoogleCalendarEvent(currentSession.google_calendar_event_id, {
                sessionDate: newSessionDate,
                startTime: newStartTime,
                endTime: newEndTime,
                timezone: currentSession.timezone || "Asia/Karachi",
              });
            } catch (calErr) {
              console.warn("Failed to update Google Calendar on reschedule:", calErr);
            }
          }

          // Update session
          const nowIso = new Date().toISOString();
          const { data: rescheduled, error: reschedErr } = await client
            .from("class_sessions")
            .update({
              session_date: newSessionDate,
              start_time: newStartTime,
              end_time: newEndTime,
              status: "rescheduled",
              is_override: conflictCheck.hasConflict && override,
              override_reason: conflictCheck.hasConflict && override ? overrideReason : null,
              override_by: conflictCheck.hasConflict && override ? auth.admin.user.id : null,
              instructor_notes: currentSession.instructor_notes
                ? `${currentSession.instructor_notes}\n[Rescheduled]: ${reason}`
                : `[Rescheduled]: ${reason}`,
              updated_at: nowIso,
            })
            .eq("id", sessionId)
            .select()
            .single();

          if (reschedErr || !rescheduled) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to reschedule session" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Re-queue or cancel stale reminders
          await client
            .from("crm_reminders")
            .update({ status: "cancelled", updated_at: nowIso })
            .eq("entity_id", sessionId)
            .eq("status", "scheduled");

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "reschedule_class_session",
            entity: "class_sessions",
            entityId: sessionId,
            details: { newSessionDate, newStartTime, newEndTime, reason },
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, session: rescheduled }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Retry Calendar Sync
        if (body.action === "retry-calendar-sync") {
          const { data: session, error: sessErr } = await client
            .from("class_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

          if (sessErr || !session) {
            return new Response(JSON.stringify({ ok: false, error: "Session not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          const attendees: string[] = [];
          if (session.instructor_id) {
            const { data: inst } = await client.from("admin_users").select("email").eq("id", session.instructor_id).maybeSingle();
            if (inst?.email) attendees.push(inst.email);
          }
          if (session.student_id) {
            const { data: st } = await client.from("students").select("email").eq("id", session.student_id).maybeSingle();
            if (st?.email) attendees.push(st.email);
          }

          const calResult = await createGoogleCalendarEvent({
            title: session.title,
            sessionDate: session.session_date,
            startTime: session.start_time,
            endTime: session.end_time,
            timezone: session.timezone || "Asia/Karachi",
            attendees,
            createMeetConference: true,
          });

          const currentRetries = (session.sync_retry_count || 0) + 1;
          const updates: Record<string, any> = {
            sync_retry_count: currentRetries,
            updated_at: new Date().toISOString(),
          };

          if (calResult.success) {
            updates.google_calendar_event_id = calResult.eventId;
            updates.google_calendar_sync_status = "synced";
            updates.google_calendar_error = null;
            if (calResult.meetLink && !session.meeting_link) {
              updates.meeting_link = calResult.meetLink;
            }
          } else {
            updates.google_calendar_sync_status = "failed";
            updates.google_calendar_error = calResult.error || "Calendar sync failed";
          }

          const { data: updatedSession } = await client
            .from("class_sessions")
            .update(updates)
            .eq("id", sessionId)
            .select()
            .single();

          return new Response(
            JSON.stringify({
              ok: true,
              success: calResult.success,
              syncStatus: updates.google_calendar_sync_status,
              session: updatedSession,
              error: calResult.error,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(JSON.stringify({ ok: false, error: "Unsupported action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      },

      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        // Cancel session flow with reason & cleanup
        const auth = await verifyAdminRequest(request, ["owner", "admin", "instructor"]);
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

        const sessionId = params.id;
        const url = new URL(request.url);
        const reason = url.searchParams.get("reason") || "Cancelled by administrator";

        // Fetch session
        const { data: session } = await client
          .from("class_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (!session) {
          return new Response(JSON.stringify({ ok: false, error: "Class session not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Cancel Google Calendar event if synced
        if (session.google_calendar_event_id) {
          try {
            await deleteGoogleCalendarEvent(session.google_calendar_event_id);
          } catch (calErr) {
            console.warn("Failed to delete Google Calendar event on session cancellation:", calErr);
          }
        }

        const nowIso = new Date().toISOString();

        // Mark session as cancelled
        const { error: cancelErr } = await client
          .from("class_sessions")
          .update({
            status: "cancelled",
            instructor_notes: session.instructor_notes
              ? `${session.instructor_notes}\n[Cancelled]: ${reason}`
              : `[Cancelled]: ${reason}`,
            updated_at: nowIso,
          })
          .eq("id", sessionId);

        if (cancelErr) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to cancel class session" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Cancellation safety: cancel queued reminders
        await client
          .from("crm_reminders")
          .update({ status: "cancelled", updated_at: nowIso })
          .eq("entity_id", sessionId)
          .eq("status", "scheduled");

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "cancel_class_session",
          entity: "class_sessions",
          entityId: sessionId,
          details: { reason },
        });

        return new Response(
          JSON.stringify({ ok: true, message: "Class session cancelled successfully", sessionId }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
