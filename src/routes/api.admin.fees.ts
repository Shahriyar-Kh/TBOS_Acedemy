import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import {
  recordPaymentSchema,
  createManualInvoiceSchema,
  updateInvoiceSchema,
  voidInvoiceSchema,
  reversePaymentSchema,
} from "@/lib/crmSchemas";
import {
  generateInvoiceNumber,
  logCrmAction,
  recordPaymentTx,
  reverseFeePaymentTx,
  voidFeeInvoiceTx,
} from "@/lib/crm.server";

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

        // Fetch recent payments with reversal details
        const { data: payments } = await client
          .from("fee_payments")
          .select("*, students(id, student_id, full_name), fee_invoices(invoice_number, billing_month)")
          .order("payment_date", { ascending: false })
          .limit(60);

        // Calculate KPI revenue statistics
        const allInvoices = invoices || [];
        const expectedRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_due) || 0), 0);
        const collectedRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
        const outstandingBalance = allInvoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
        const overdueCount = allInvoices.filter((inv) => inv.status === "overdue" || (inv.balance > 0 && new Date(inv.due_date) < new Date())).length;
        const todayStr = new Date().toISOString().split("T")[0];
        const dueTodayCount = allInvoices.filter((inv) => inv.due_date === todayStr && inv.balance > 0).length;

        // Current Month Metrics
        const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
        const currentMonthInvoices = allInvoices.filter((inv) => inv.billing_month === currentMonthStr && inv.status !== "voided");
        const monthInvoiced = currentMonthInvoices.reduce((acc, inv) => acc + (Number(inv.amount_due) || 0), 0);
        const monthCollected = currentMonthInvoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
        const monthOutstanding = currentMonthInvoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
        const collectionRate = monthInvoiced > 0 ? Math.round((monthCollected / monthInvoiced) * 100) : 0;

        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            invoices: allInvoices,
            payments: payments || [],
            totalCount: allInvoices.length,
            stats: {
              totalInvoiced: expectedRevenue,
              totalCollected: collectedRevenue,
              totalPending: outstandingBalance,
              totalOverdue: overdueCount,
              expectedRevenue,
              collectedRevenue,
              outstandingBalance,
              overdueCount,
              dueTodayCount,
              currentMonth: currentMonthStr,
              monthInvoiced,
              monthCollected,
              monthOutstanding,
              collectionRate,
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

        // Action: Create Manual Invoice
        if (body.action === "create-invoice") {
          const parsed = createManualInvoiceSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const d = parsed.data;
          const invoiceNumber = await generateInvoiceNumber();

          const { data: newInvoice, error: insErr } = await client
            .from("fee_invoices")
            .insert({
              invoice_number: invoiceNumber,
              student_id: d.studentId,
              enrollment_id: d.enrollmentId || null,
              billing_month: d.billingMonth,
              amount_due: d.amountDue,
              amount_paid: 0,
              balance: d.amountDue,
              due_date: d.dueDate,
              status: "due",
              notes: d.notes || null,
            })
            .select("*, students(id, student_id, full_name, email)")
            .single();

          if (insErr || !newInvoice) {
            console.error("Create invoice error:", insErr);
            return new Response(
              JSON.stringify({ ok: false, error: insErr?.message || "Failed to create invoice" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "create_fee_invoice",
            entity: "fee_invoices",
            entityId: newInvoice.id,
            details: { invoiceNumber, amountDue: d.amountDue, studentId: d.studentId },
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, invoice: newInvoice }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Update Unpaid Invoice
        if (body.action === "update-invoice") {
          const parsed = updateInvoiceSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const { invoiceId, amountDue, dueDate, notes } = parsed.data;

          // Fetch existing invoice
          const { data: existing, error: findErr } = await client
            .from("fee_invoices")
            .select("*")
            .eq("id", invoiceId)
            .single();

          if (findErr || !existing) {
            return new Response(JSON.stringify({ ok: false, error: "Invoice not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (existing.status === "voided" || existing.status === "paid") {
            return new Response(
              JSON.stringify({ ok: false, error: `Cannot edit ${existing.status} invoice.` }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const newAmountDue = amountDue !== undefined ? amountDue : Number(existing.amount_due);
          const currentPaid = Number(existing.amount_paid) || 0;
          if (newAmountDue < currentPaid) {
            return new Response(
              JSON.stringify({ ok: false, error: "New amount cannot be less than already paid amount." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const newBalance = Math.max(0, newAmountDue - currentPaid);
          const updates: Record<string, any> = {
            amount_due: newAmountDue,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          };
          if (dueDate !== undefined) updates.due_date = dueDate;
          if (notes !== undefined) updates.notes = notes;

          const { data: updated, error: updErr } = await client
            .from("fee_invoices")
            .update(updates)
            .eq("id", invoiceId)
            .select()
            .single();

          if (updErr || !updated) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to update invoice" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "update_fee_invoice",
            entity: "fee_invoices",
            entityId: invoiceId,
            details: updates,
          });

          return new Response(
            JSON.stringify({ ok: true, success: true, invoice: updated }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Void Invoice (with mandatory reason)
        if (body.action === "void-invoice") {
          const parsed = voidInvoiceSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          try {
            const result = await voidFeeInvoiceTx({
              invoiceId: parsed.data.invoiceId,
              reason: parsed.data.reason,
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            });

            return new Response(
              JSON.stringify({ ok: true, success: true, ...result }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            if (errMsg.includes("CANNOT_VOID_INVOICE_WITH_ACTIVE_PAYMENTS")) {
              return new Response(
                JSON.stringify({
                  ok: false,
                  error: "Active payments exist on this invoice. Please reverse all active payments before voiding.",
                }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(
              JSON.stringify({ ok: false, error: errMsg || "Failed to void invoice" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Action: Reverse Payment (Mistake correction without overwriting ledger history)
        if (body.action === "reverse-payment") {
          const parsed = reversePaymentSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message || "Validation failed" }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          try {
            const result = await reverseFeePaymentTx({
              paymentId: parsed.data.paymentId,
              reason: parsed.data.reason,
              adminUserId: auth.admin.user.id,
              actorEmail: auth.admin.user.email || "admin@techbuiltos.online",
            });

            return new Response(
              JSON.stringify({ ok: true, success: true, ...result }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            if (errMsg.includes("PAYMENT_ALREADY_REVERSED")) {
              return new Response(
                JSON.stringify({ ok: false, error: "This payment has already been reversed." }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
            if (errMsg.includes("CANNOT_REVERSE_A_REVERSAL")) {
              return new Response(
                JSON.stringify({ ok: false, error: "A reversal entry cannot be reversed." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(
              JSON.stringify({ ok: false, error: errMsg || "Failed to reverse payment" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
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
                success: true,
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

          const { data: activeEnrollments, error: enrErr } = await client
            .from("enrollments")
            .select("*, students(id, status, full_name, billing_day)")
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
            if (enr.students?.status !== "active") {
              skippedCount++;
              continue;
            }

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

            const [yearStr, monthStr] = targetMonth.split("-");
            const billingDay = Math.min(28, Math.max(1, enr.students?.billing_day || enr.billing_day || 1));
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
              success: true,
              billingMonth: targetMonth,
              createdCount,
              generatedCount: createdCount,
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
