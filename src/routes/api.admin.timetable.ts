import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { createClassSessionSchema } from "@/lib/crmSchemas";
import { checkClassScheduleConflicts, logCrmAction } from "@/lib/crm.server";

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

        // Support recurring class generation (e.g., repeat weekly for N weeks)
        const repeatWeeks = Math.min(12, Math.max(1, Number(body.repeatWeeks) || 1));
        const createdSessions: any[] = [];

        for (let week = 0; week < repeatWeeks; week++) {
          const sessionDateObj = new Date(d.sessionDate);
          sessionDateObj.setDate(sessionDateObj.getDate() + week * 7);
          const computedDate = sessionDateObj.toISOString().split("T")[0];

          if (week > 0 && !isOverrideAllowed) {
            const weekConflict = await checkClassScheduleConflicts({
              sessionDate: computedDate,
              startTime: d.startTime,
              endTime: d.endTime,
              instructorId: d.instructorId || null,
              batchId: d.batchId || null,
              studentId: d.studentId || null,
            });
            if (weekConflict.hasConflict) {
              return new Response(
                JSON.stringify({
                  ok: false,
                  hasConflict: true,
                  error: `Schedule clash in recurring week ${week + 1}: ${weekConflict.conflicts[0]?.message}`,
                  conflicts: weekConflict.conflicts,
                }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
          }

          const { data: newSession, error: insErr } = await client
            .from("class_sessions")
            .insert({
              batch_id: d.batchId || null,
              enrollment_id: d.enrollmentId || null,
              student_id: d.studentId || null,
              instructor_id: d.instructorId || null,
              instructor_name: d.instructorName || null,
              title: repeatWeeks > 1 ? `${d.title} (Week ${week + 1})` : d.title,
              session_date: computedDate,
              start_time: d.startTime,
              end_time: d.endTime,
              timezone: d.timezone || "Asia/Karachi",
              meeting_link: d.meetingLink || null,
              status: d.status || "scheduled",
              topic_covered: d.topicCovered || null,
              homework: d.homework || null,
              instructor_notes: d.instructorNotes || null,
              is_override: Boolean(conflictCheck.hasConflict && isOverrideAllowed),
              override_reason: conflictCheck.hasConflict && isOverrideAllowed ? (d.overrideReason || "Override confirmed by administrator") : null,
              override_by: conflictCheck.hasConflict && isOverrideAllowed ? auth.admin.user.id : null,
            })
            .select()
            .single();

          if (!insErr && newSession) {
            createdSessions.push(newSession);
          }
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: conflictCheck.hasConflict && isOverrideAllowed ? "schedule_clash_override" : "create_class_session",
          entity: "class_sessions",
          details: {
            title: d.title,
            sessionDate: d.sessionDate,
            count: createdSessions.length,
            isOverride: Boolean(conflictCheck.hasConflict && isOverrideAllowed),
            overrideReason: d.overrideReason || null,
          },
        });

        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            createdSessions,
            count: createdSessions.length,
            recurringCount: createdSessions.length,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

