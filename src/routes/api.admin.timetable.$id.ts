import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { updateClassSessionSchema, recordAttendanceSchema } from "@/lib/crmSchemas";
import { logCrmAction } from "@/lib/crm.server";

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
          .select("*, batches(*, enrollments(*, students(*))), class_attendance(*, students(*))")
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
        // Record Attendance
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

        return new Response(JSON.stringify({ ok: false, error: "Unsupported action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

