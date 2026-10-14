import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { recordPaymentSchema } from "@/lib/crmSchemas";
import { generateInvoiceNumber, logCrmAction, recordPaymentTx } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/fees")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "accountant"]);
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
        const statusFilter = url.searchParams.get("status") || "all";
        const monthFilter = url.searchParams.get("month") || "";
        const search = url.searchParams.get("q")?.trim() || "";

        let invQuery = client
          .from("fee_invoices")
          .select("*, students(id, student_id, full_name, email, phone), enrollments(id, program_title, agreed_fee)")
          .order("due_date", { ascending: false });

        if (statusFilter !== "all") invQuery = invQuery.eq("status", statusFilter);
        if (monthFilter) invQuery = invQuery.eq("billing_month", monthFilter);

        const { data: invoices, error: invErr } = await invQuery;
        if (invErr) {
          console.error("Fee invoices query error:", invErr);
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch invoices" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Fetch recent payments
        const { data: payments } = await client
          .from("fee_payments")
          .select("*, students(id, student_id, full_name), fee_invoices(invoice_number, billing_month)")
          .order("payment_date", { ascending: false })
          .limit(50);

        // Calculate KPI revenue statistics
        const allInvoices = invoices || [];
        const expectedRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_due) || 0), 0);
        const collectedRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
        const outstandingBalance = allInvoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
        const overdueCount = allInvoices.filter((inv) => inv.status === "overdue" || (inv.balance > 0 && new Date(inv.due_date) < new Date())).length;
        const todayStr = new Date().toISOString().split("T")[0];
        const dueTodayCount = allInvoices.filter((inv) => inv.due_date === todayStr && inv.balance > 0).length;

        return new Response(
          JSON.stringify({
            ok: true,
            invoices: allInvoices,
            payments: payments || [],
            stats: {
              expectedRevenue,
              collectedRevenue,
              outstandingBalance,
              overdueCount,
              dueTodayCount,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin", "accountant"]);
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

        // Action: Record Payment
        if (body.action === "record-payment") {
          const parsed = recordPaymentSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const { invoiceId, studentId, amount, paymentDate, paymentMethod, referenceNumber, notes } = parsed.data;
          const idempotencyKey = body.idempotencyKey || null;

          try {
            const result = await recordPaymentTx({
              invoiceId,
              studentId,
              amount,
              paymentMethod,
              paymentDate,
              referenceNumber,
              notes,
              recordedBy: auth.admin.user.id,
              idempotencyKey,
              actorEmail: auth.admin.user.email,
            });

            return new Response(
              JSON.stringify({
                ok: true,
                payment: result.payment,
                invoice: result.invoice,
                is_duplicate: result.is_duplicate || false,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            if (err.message === "STUDENT_INVOICE_MISMATCH") {
              return new Response(
                JSON.stringify({ ok: false, error: "Student ID does not match invoice recipient." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
              );
            }
            if (err.message === "OVERPAYMENT_EXCEEDS_BALANCE") {
              return new Response(
                JSON.stringify({ ok: false, error: "Payment amount exceeds remaining invoice balance." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
              );
            }
            if (err.message === "INVOICE_NOT_FOUND") {
              return new Response(
                JSON.stringify({ ok: false, error: "Target invoice record not found." }),
                { status: 404, headers: { "Content-Type": "application/json" } },
              );
            }
            if (err.message === "INVALID_AMOUNT") {
              return new Response(
                JSON.stringify({ ok: false, error: "Payment amount must be greater than zero." }),
                { status: 422, headers: { "Content-Type": "application/json" } },
              );
            }
            console.error("Payment recording error:", err);
            return new Response(
              JSON.stringify({ ok: false, error: err.message || "Failed to record payment" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Action: Generate Monthly Dues (Idempotent)
        if (body.action === "generate-monthly-dues") {
          const targetMonth = body.billingMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

          // Find active enrollments
          const { data: activeEnrollments, error: enrErr } = await client
            .from("enrollments")
            .select("*, students(id, status, full_name)")
            .eq("status", "active")
            .gt("agreed_fee", 0);

          if (enrErr || !activeEnrollments) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to read active enrollments" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          let createdCount = 0;
          let skippedCount = 0;

          for (const enr of activeEnrollments) {
            // Check if student is active
            if (enr.students?.status !== "active") {
              skippedCount++;
              continue;
            }

            // Check if invoice for this student, enrollment and month already exists
            const { data: existing } = await client
              .from("fee_invoices")
              .select("id")
              .eq("student_id", enr.student_id)
              .eq("enrollment_id", enr.id)
              .eq("billing_month", targetMonth)
              .maybeSingle();

            if (existing) {
              skippedCount++;
              continue;
            }

            // Calculate due date (billing_day of targetMonth)
            const [yearStr, monthStr] = targetMonth.split("-");
            const billingDay = Math.min(28, Math.max(1, enr.billing_day || 1));
            const dueDate = `${yearStr}-${monthStr}-${String(billingDay).padStart(2, "0")}`;
            const invNumber = await generateInvoiceNumber();

            const { error: insErr } = await client.from("fee_invoices").insert({
              invoice_number: invNumber,
              student_id: enr.student_id,
              enrollment_id: enr.id,
              billing_month: targetMonth,
              amount_due: enr.agreed_fee,
              amount_paid: 0,
              balance: enr.agreed_fee,
              due_date: dueDate,
              status: "due",
              notes: `Monthly fee for ${enr.program_title} (${targetMonth})`,
            });

            if (!insErr) {
              createdCount++;
            }
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "generate_monthly_dues",
            entity: "fee_invoices",
            details: { targetMonth, createdCount, skippedCount },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              billingMonth: targetMonth,
              createdCount,
              skippedCount,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Waive or Refund invoice
        if (body.action === "waive-invoice") {
          const { invoiceId, reason, status } = body;
          if (!invoiceId) {
            return new Response(JSON.stringify({ ok: false, error: "Invoice ID required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const targetStatus = status === "refunded" ? "refunded" : "waived";

          const { data: updated, error: updErr } = await client
            .from("fee_invoices")
            .update({
              status: targetStatus,
              balance: 0,
              notes: reason ? `[${targetStatus.toUpperCase()}]: ${reason}` : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", invoiceId)
            .select()
            .single();

          if (updErr || !updated) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to update invoice status" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "waive_invoice",
            entity: "fee_invoices",
            entityId: invoiceId,
            details: { status: targetStatus, reason },
          });

          return new Response(JSON.stringify({ ok: true, invoice: updated }), {
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

