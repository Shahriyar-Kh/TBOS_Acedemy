import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { createStudentSchema, createStudentFullSchema } from "@/lib/crmSchemas";
import { generateStudentId, logCrmAction, createStudentFullTx, checkStudentDuplicate } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/students")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
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

        const url = new URL(request.url);

        // Sub-action: Proactive Duplicate Detection Pre-flight
        if (url.searchParams.get("action") === "check-duplicate" || url.searchParams.has("checkDuplicate")) {
          const email = url.searchParams.get("email");
          const phone = url.searchParams.get("phone");
          const excludeId = url.searchParams.get("excludeId");

          const dupResult = await checkStudentDuplicate({
            email,
            phone,
            excludeStudentId: excludeId,
          });

          return new Response(JSON.stringify({ ok: true, ...dupResult }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const search = url.searchParams.get("q")?.trim() || "";
        const statusFilter = url.searchParams.get("status")?.trim() || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
        const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get("limit") || "25", 10) || 25));
        const offset = (page - 1) * limit;

        let query = client
          .from("students")
          .select("*, enrollments(*), fee_invoices(*)", { count: "exact" })
          .order("created_at", { ascending: false });

        if (statusFilter && statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        if (search) {
          const sanitized = search.replace(/[%_,()]/g, " ").trim();
          if (sanitized) {
            query = query.or(
              `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,student_id.ilike.%${sanitized}%`,
            );
          }
        }

        query = query.range(offset, offset + limit - 1);
        const { data: students, count: totalCount, error } = await query;

        if (error) {
          console.error("Students query error:", error);
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch students" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Aggregate Status Metrics
        const [
          { count: activeCount },
          { count: onHoldCount },
          { count: graduatedCount },
          { count: withdrawnCount },
          { count: archivedCount },
        ] = await Promise.all([
          client.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
          client.from("students").select("*", { count: "exact", head: true }).in("status", ["on_hold", "paused"]),
          client.from("students").select("*", { count: "exact", head: true }).in("status", ["graduated", "completed"]),
          client.from("students").select("*", { count: "exact", head: true }).in("status", ["withdrawn", "dropped", "cancelled"]),
          client.from("students").select("*", { count: "exact", head: true }).eq("status", "archived"),
        ]);

        return new Response(
          JSON.stringify({
            ok: true,
            students: students || [],
            totalCount: totalCount || 0,
            page,
            limit,
            stats: {
              total: totalCount || 0,
              active: activeCount || 0,
              onHold: onHoldCount || 0,
              graduated: graduatedCount || 0,
              withdrawn: withdrawnCount || 0,
              archived: archivedCount || 0,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
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

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Malformed JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Check Duplicate Action via POST
        if (body.action === "check-duplicate") {
          const dupResult = await checkStudentDuplicate({
            email: body.email,
            phone: body.phone,
            excludeStudentId: body.excludeId,
          });
          return new Response(JSON.stringify({ ok: true, ...dupResult }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Bulk CSV import
        if (body.action === "import-csv" && Array.isArray(body.rows)) {
          const rows = body.rows;
          const inserted: any[] = [];
          const failed: any[] = [];

          for (let i = 0; i < rows.length; i++) {
            const rawRow = rows[i];
            const parsed = createStudentSchema.safeParse({
              fullName: rawRow.fullName || rawRow.name,
              email: rawRow.email,
              phone: rawRow.phone,
              whatsapp: rawRow.whatsapp || rawRow.phone,
              guardianName: rawRow.guardianName,
              guardianPhone: rawRow.guardianPhone,
              guardianEmail: rawRow.guardianEmail,
              address: rawRow.address,
              country: rawRow.country || "Pakistan",
              city: rawRow.city,
              status: rawRow.status || "active",
              billingDay: Number(rawRow.billingDay) || 1,
              notes: rawRow.notes,
            });

            if (!parsed.success) {
              failed.push({
                row: i + 1,
                data: rawRow,
                errors: parsed.error.errors.map((e) => e.message),
              });
              continue;
            }

            // Check duplicate
            const dup = await checkStudentDuplicate({
              email: parsed.data.email,
              phone: parsed.data.phone,
            });

            if (dup.isDuplicate) {
              failed.push({
                row: i + 1,
                data: rawRow,
                errors: [`Student with ${dup.matchedBy} already exists (${dup.existingStudent?.student_id})`],
              });
              continue;
            }

            const studentId = await generateStudentId();
            const { data: newStudent, error: insertErr } = await client
              .from("students")
              .insert({
                student_id: studentId,
                full_name: parsed.data.fullName,
                email: parsed.data.email.toLowerCase().trim(),
                phone: parsed.data.phone,
                whatsapp: parsed.data.whatsapp || parsed.data.phone,
                guardian_name: parsed.data.guardianName || null,
                guardian_phone: parsed.data.guardianPhone || null,
                guardian_email: parsed.data.guardianEmail || null,
                address: parsed.data.address || null,
                country: parsed.data.country || "Pakistan",
                city: parsed.data.city || null,
                timezone: parsed.data.timezone || "Asia/Karachi",
                status: parsed.data.status || "active",
                billing_day: parsed.data.billingDay || 1,
                notes: parsed.data.notes || null,
              })
              .select()
              .single();

            if (insertErr || !newStudent) {
              failed.push({
                row: i + 1,
                data: rawRow,
                errors: [insertErr?.message || "Database insert failed"],
              });
            } else {
              inserted.push(newStudent);
            }
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "import_students_csv",
            entity: "students",
            details: { importedCount: inserted.length, failedCount: failed.length },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              importedCount: inserted.length,
              failedCount: failed.length,
              inserted,
              failed,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Multi-section Complete Student Wizard Action (Section B)
        if (body.action === "create-student-full") {
          const parsed = createStudentFullSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({
                ok: false,
                success: false,
                error: parsed.error.errors[0]?.message || "Validation failed",
                details: parsed.error.errors,
              }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          // Proactive duplicate detection
          const dup = await checkStudentDuplicate({
            email: parsed.data.email,
            phone: parsed.data.phone,
          });

          if (dup.isDuplicate) {
            return new Response(
              JSON.stringify({
                ok: false,
                success: false,
                error: `A student with this ${dup.matchedBy} is already registered (${dup.existingStudent?.student_id}: ${dup.existingStudent?.full_name}).`,
                matchedBy: dup.matchedBy,
                existingStudent: dup.existingStudent,
              }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }

          try {
            const result = await createStudentFullTx({
              ...parsed.data,
              actorId: auth.admin.user.id,
              actorEmail: auth.admin.user.email,
            });

            return new Response(
              JSON.stringify({
                ok: true,
                success: true,
                ...result,
              }),
              { status: 201, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            const status = err.message.includes("already exists") ? 409 : 400;
            return new Response(
              JSON.stringify({
                ok: false,
                success: false,
                error: err.message || "Failed to create student",
              }),
              { status, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Single student creation
        const parsed = createStudentSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: parsed.error.errors[0]?.message || "Validation failed",
            }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }

        // Proactive duplicate check
        const dup = await checkStudentDuplicate({
          email: parsed.data.email,
          phone: parsed.data.phone,
        });

        if (dup.isDuplicate) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Student with this ${dup.matchedBy} already exists (${dup.existingStudent?.student_id}).`,
              matchedBy: dup.matchedBy,
              existingStudent: dup.existingStudent,
            }),
            { status: 409, headers: { "Content-Type": "application/json" } },
          );
        }

        const studentId = await generateStudentId();
        const { data: newStudent, error: insertError } = await client
          .from("students")
          .insert({
            student_id: studentId,
            full_name: parsed.data.fullName,
            email: parsed.data.email.toLowerCase().trim(),
            phone: parsed.data.phone,
            whatsapp: parsed.data.whatsapp || parsed.data.phone,
            guardian_name: parsed.data.guardianName || null,
            guardian_phone: parsed.data.guardianPhone || null,
            guardian_email: parsed.data.guardianEmail || null,
            guardian_relationship: parsed.data.guardianRelationship || null,
            emergency_contact: parsed.data.emergencyContact || null,
            date_of_birth: parsed.data.dateOfBirth || null,
            age: parsed.data.age || null,
            address: parsed.data.address || null,
            country: parsed.data.country || "Pakistan",
            city: parsed.data.city || null,
            timezone: parsed.data.timezone || "Asia/Karachi",
            status: parsed.data.status || "active",
            enrollment_date: parsed.data.enrollmentDate,
            billing_day: parsed.data.billingDay || 1,
            notes: parsed.data.notes || null,
            lead_id: parsed.data.leadId || null,
          })
          .select()
          .single();

        if (insertError || !newStudent) {
          console.error("Student insert error:", insertError);
          return new Response(
            JSON.stringify({ ok: false, error: "Failed to create student record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        await logCrmAction({
          adminUserId: auth.admin.user.id,
          actorEmail: auth.admin.user.email,
          action: "create_student",
          entity: "students",
          entityId: newStudent.id,
          details: { studentId: newStudent.student_id, name: newStudent.full_name },
        });

        return new Response(
          JSON.stringify({ ok: true, success: true, student: newStudent }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
