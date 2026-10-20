import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { createClassSessionSchema } from "@/lib/crmSchemas";
import { checkClassScheduleConflicts, logCrmAction, createClassSessionsTx } from "@/lib/crm.server";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar.server";

export const Route = createFileRoute("/api/admin/timetable")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
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

        const url = new URL(request.url);
        const dateFrom = url.searchParams.get("from") || "";
        const dateTo = url.searchParams.get("to") || "";
        const batchId = url.searchParams.get("batchId") || "";
        const instructorId = url.searchParams.get("instructorId") || "";

        let query = client
          .from("class_sessions")
          .select("*, batches(id, name, program_title), students(id, full_name, student_id, email), class_attendance(*, students(id, full_name, email, phone))")
          .order("session_date", { ascending: true })
          .order("start_time", { ascending: true });

        if (dateFrom) query = query.gte("session_date", dateFrom);
        if (dateTo) query = query.lte("session_date", dateTo);
        if (batchId) query = query.eq("batch_id", batchId);
        if (instructorId) query = query.eq("instructor_id", instructorId);

        // If instructor role, limit to classes where they are the instructor
        if (auth.admin.admin.role === "instructor") {
          query = query.eq("instructor_id", auth.admin.user.id);
        }

        const { data: sessions, error } = await query;
        if (error) {
          console.error("Timetable query error:", error);
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch classes" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const todayStr = new Date().toISOString().split("T")[0];
        const allSessions = sessions || [];
        const todaySessions = allSessions.filter((s) => s.session_date === todayStr);
        const upcomingSessions = allSessions.filter((s) => s.session_date > todayStr);

        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            sessions: allSessions,
            todaySessions,
            upcomingSessions,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
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

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Action 1: Check Conflicts Pre-flight
        if (body.action === "check-conflicts") {
          const { sessionDate, startTime, endTime, instructorId, batchId, studentId, excludeSessionId } = body;
          if (!sessionDate || !startTime || !endTime) {
            return new Response(JSON.stringify({ ok: false, error: "Missing required date/time parameters" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const conflictResult = await checkClassScheduleConflicts({
            sessionDate,
            startTime,
            endTime,
            instructorId: instructorId || null,
            batchId: batchId || null,
            studentId: studentId || null,
            excludeSessionId: excludeSessionId || null,
          });

          return new Response(JSON.stringify({ ok: true, success: true, ...conflictResult }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Action 2: Schedule Single or Recurring Sessions
        const parsed = createClassSessionSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        const d = parsed.data;

        // Perform conflict check before inserting
        const conflictCheck = await checkClassScheduleConflicts({
          sessionDate: d.sessionDate,
          startTime: d.startTime,
          endTime: d.endTime,
          instructorId: d.instructorId || null,
          batchId: d.batchId || null,
          studentId: d.studentId || null,
        });

        const isOverrideAllowed = Boolean(d.override || body.ignoreWarnings);
        if (conflictCheck.hasConflict && !isOverrideAllowed) {
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

        // Google Calendar & Meet Integration (with graceful fallback)
        let effectiveMeetLink = d.meetingLink || null;
        let calEventId: string | null = null;
        let calSyncStatus: "synced" | "pending" | "failed" = "pending";
        let calError: string | null = null;

        try {
          const attendees: string[] = [];
          if (d.instructorId) {
            const { data: inst } = await client.from("admin_users").select("email").eq("id", d.instructorId).maybeSingle();
            if (inst?.email) attendees.push(inst.email);
          }
          if (d.studentId) {
            const { data: st } = await client.from("students").select("email").eq("id", d.studentId).maybeSingle();
            if (st?.email) attendees.push(st.email);
          }

          const calResult = await createGoogleCalendarEvent({
            title: d.title,
            sessionDate: d.sessionDate,
            startTime: d.startTime,
            endTime: d.endTime,
            timezone: d.timezone || "Asia/Karachi",
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
          console.warn("Google Calendar integration fallback:", calErr?.message);
          calSyncStatus = "failed";
          calError = calErr?.message || "Calendar integration error";
        }

        // Atomic transactional creation of single or recurring sessions
        const repeatWeeks = Math.min(12, Math.max(1, Number(body.repeatWeeks) || 1));
        const overrideReason = d.overrideReason || body.overrideReason || null;
        const sessionType = body.sessionType || (repeatWeeks > 1 ? "recurring_occurrence" : "single_session");

        try {
          const txResult = await createClassSessionsTx({
            batchId: d.batchId || null,
            enrollmentId: d.enrollmentId || null,
            studentId: d.studentId || null,
            instructorId: d.instructorId || null,
            instructorName: d.instructorName || null,
            title: d.title,
            sessionDate: d.sessionDate,
            startTime: d.startTime,
            endTime: d.endTime,
            timezone: d.timezone || "Asia/Karachi",
            meetingLink: effectiveMeetLink,
            status: d.status || "scheduled",
            topicCovered: d.topicCovered || null,
            homework: d.homework || null,
            instructorNotes: d.instructorNotes || null,
            repeatWeeks,
            override: isOverrideAllowed,
            overrideReason,
            adminUserId: auth.admin.user.id,
            adminEmail: auth.admin.user.email,
          });

          // Update created sessions with calendar metadata and session_type
          if (txResult.session_ids && txResult.session_ids.length > 0) {
            await client
              .from("class_sessions")
              .update({
                session_type: sessionType,
                google_calendar_event_id: calEventId,
                google_calendar_sync_status: calSyncStatus,
                google_calendar_error: calError,
              })
              .in("id", txResult.session_ids);
          }

          return new Response(
            JSON.stringify({
              ok: true,
              success: true,
              count: txResult.created_count,
              sessionIds: txResult.session_ids,
              isOverride: txResult.is_override,
              meetingLink: effectiveMeetLink,
              calendarSyncStatus: calSyncStatus,
              calendarEventId: calEventId,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (errMsg.includes("SCHEDULE_CLASH_DETECTED")) {
            return new Response(
              JSON.stringify({
                ok: false,
                hasConflict: true,
                error: errMsg.replace(/^.*SCHEDULE_CLASH_DETECTED:\s*/, ""),
              }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }
          if (errMsg.includes("MANDATORY_OVERRIDE_REASON_REQUIRED")) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: "An administrative override reason is mandatory when resolving schedule clashes.",
              }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({ ok: false, error: errMsg || "Failed to schedule class session" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
