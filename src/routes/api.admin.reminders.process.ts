import crypto from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { getServerConfig } from "@/lib/config.server";
import nodemailer from "nodemailer";
import { escapeHtml, logCrmAction, checkRateLimit } from "@/lib/crm.server";

export async function handleRemindersProcessRequest(request: Request): Promise<Response> {
  // 1. Prohibit secret transmission in URL query parameters
  const url = new URL(request.url);
  if (url.searchParams.has("secret") || url.searchParams.has("cron_secret") || url.searchParams.has("key")) {
    return new Response(
      JSON.stringify({ ok: false, error: "Query parameter authentication forbidden. Use Authorization header." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Authentication: Require dedicated server-side CRON_SECRET or Admin Session
  // CRON_SECRET must be configured server-side and be at least 32 characters long.
  const rawCronSecret = process.env.CRON_SECRET?.trim();
  const isCronConfigured = Boolean(rawCronSecret && rawCronSecret.length >= 32);

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  let isAuthorized = false;
  let actorEmail = "system_cron";
  let adminUserId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    if (!isCronConfigured) {
      return new Response(
        JSON.stringify({ ok: false, error: "Reminder processor is not configured." }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const providedToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (providedToken) {
      const hashProvided = crypto.createHash("sha256").update(providedToken).digest();
      const hashExpected = crypto.createHash("sha256").update(rawCronSecret!).digest();
      if (crypto.timingSafeEqual(hashProvided, hashExpected)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized: Invalid CRON_SECRET Bearer token." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
  } else {
    // Check if authenticated admin session exists
    const auth = await verifyAdminRequest(request, ["owner", "admin"]);
    if (auth.ok) {
      isAuthorized = true;
      actorEmail = auth.admin.user.email || "admin@techbuiltos.online";
      adminUserId = auth.admin.user.id;
    } else {
      // Neither Bearer token nor valid admin session provided.
      // If server-side cron secret is unconfigured/weak, fail closed with 503:
      if (!isCronConfigured) {
        return new Response(
          JSON.stringify({ ok: false, error: "Reminder processor is not configured." }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized: Valid admin credentials or CRON_SECRET Bearer token required." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 3. Rate-limit execution to protect against replay / denial-of-service
  const rateLimit = await checkRateLimit("reminders_process_cron", 15, 60);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "Too many processing requests. Please retry in a few moments." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  // 4. Verify Database Availability
  const { client } = getSupabaseServerClient();
  if (!client) {
    return new Response(JSON.stringify({ ok: false, error: "Database unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const nowIso = now.toISOString();

        // ==============================================================================
        // 1. Queue Generation: Scan and materialize scheduled reminders
        // ==============================================================================

        // A. Class Reminders: scheduled sessions in the next 48 hours
        try {
          const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split("T")[0];
          const todayStr = now.toISOString().split("T")[0];

          const { data: sessions } = await client
            .from("class_sessions")
            .select("*, batches(id, name, program_title, meeting_link)")
            .gte("session_date", todayStr)
            .lte("session_date", in48h)
            .in("status", ["scheduled", "rescheduled"]);

          if (sessions && sessions.length > 0) {
            for (const sess of sessions) {
              // Combine session_date and start_time (Asia/Karachi UTC+5)
              const sessionTimeStr = `${sess.session_date}T${sess.start_time}:00+05:00`;
              const sessionTimestamp = new Date(sessionTimeStr).getTime();

              if (isNaN(sessionTimestamp)) continue;

              // Enrolled students for this batch
              const recipients: Array<{ email: string; name: string }> = [];
              if (sess.batch_id) {
                const { data: enrollments } = await client
                  .from("enrollments")
                  .select("students(email, full_name, status)")
                  .eq("batch_id", sess.batch_id)
                  .eq("status", "active");

                if (enrollments) {
                  for (const enr of enrollments) {
                    const st = enr.students as any;
                    if (st && st.status === "active" && st.email) {
                      recipients.push({ email: st.email, name: st.full_name });
                    }
                  }
                }
              }

              // Reminder offsets: 24 hours, 1 hour, 15 minutes before class
              const offsets = [
                { keySuffix: "24h", offsetMs: 24 * 60 * 60 * 1000, label: "24-hour" },
                { keySuffix: "1h", offsetMs: 60 * 60 * 1000, label: "1-hour" },
                { keySuffix: "15m", offsetMs: 15 * 60 * 1000, label: "15-minute" },
              ];

              for (const off of offsets) {
                const scheduledFor = new Date(sessionTimestamp - off.offsetMs).toISOString();

                for (const recipient of recipients) {
                  const idempKey = `rem:class:${sess.id}:${off.keySuffix}:${recipient.email}`;
                  await client
                    .from("crm_reminders")
                    .insert({
                      type: "class_reminder",
                      entity_type: "class_session",
                      entity_id: sess.id,
                      recipient: recipient.email,
                      recipient_name: recipient.name,
                      channel: "email",
                      scheduled_for: scheduledFor,
                      status: "scheduled",
                      idempotency_key: idempKey,
                      payload: {
                        classTitle: sess.title,
                        sessionDate: sess.sessionDate || sess.session_date,
                        startTime: sess.start_time,
                        endTime: sess.end_time,
                        meetingLink: sess.meeting_link || (sess.batches as any)?.meeting_link,
                        label: off.label,
                      },
                    })
                    .select("id")
                    .maybeSingle(); // If collision with unique idempotency_key, insert is safely ignored
                }
              }
            }
          }
        } catch (queueErr) {
          console.warn("Class reminders queue scan warning:", queueErr);
        }

        // B. Fee Due Reminders: unpaid invoices
        try {
          const { data: invoices } = await client
            .from("fee_invoices")
            .select("*, students(email, full_name, phone)")
            .gt("balance", 0)
            .in("status", ["due", "overdue"]);

          if (invoices && invoices.length > 0) {
            for (const inv of invoices) {
              const st = inv.students as any;
              if (!st?.email) continue;

              const dueTime = new Date(`${inv.due_date}T09:00:00+05:00`).getTime();
              if (isNaN(dueTime)) continue;

              const feeOffsets = [
                { keySuffix: "3d_before", offsetMs: 3 * 24 * 60 * 60 * 1000, label: "Upcoming (3 days)" },
                { keySuffix: "on_due", offsetMs: 0, label: "Due Today" },
                { keySuffix: "3d_overdue", offsetMs: -3 * 24 * 60 * 60 * 1000, label: "Overdue Notice" },
              ];

              for (const off of feeOffsets) {
                const scheduledFor = new Date(dueTime - off.offsetMs).toISOString();
                const idempKey = `rem:fee:${inv.id}:${off.keySuffix}:${st.email}`;

                await client
                  .from("crm_reminders")
                  .insert({
                    type: "fee_reminder",
                    entity_type: "fee_invoice",
                    entity_id: inv.id,
                    recipient: st.email,
                    recipient_name: st.full_name,
                    channel: "email",
                    scheduled_for: scheduledFor,
                    status: "scheduled",
                    idempotency_key: idempKey,
                    payload: {
                      invoiceNumber: inv.invoice_number,
                      balance: inv.balance,
                      dueDate: inv.due_date,
                      label: off.label,
                    },
                  })
                  .select("id")
                  .maybeSingle();
              }
            }
          }
        } catch (feeQueueErr) {
          console.warn("Fee reminders queue scan warning:", feeQueueErr);
        }

        // ==============================================================================
        // 2. Dispatch Engine: Process due reminders
        // ==============================================================================

        const { data: dueReminders, error: readErr } = await client
          .from("crm_reminders")
          .select("*")
          .in("status", ["scheduled", "failed"])
          .lt("attempts", 3)
          .lte("scheduled_for", nowIso)
          .order("scheduled_for", { ascending: true })
          .limit(50);

        if (readErr || !dueReminders) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to read due reminders" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let sentCount = 0;
        let failedCount = 0;
        const config = getServerConfig();

        let transporter: any = null;
        if (config.smtpUser && config.smtpAppPassword) {
          try {
            transporter = nodemailer.createTransport({
              host: config.smtpHost,
              port: config.smtpPort,
              secure: config.smtpSecure,
              auth: { user: config.smtpUser, pass: config.smtpAppPassword },
            });
          } catch (tErr) {
            console.error("Transporter creation failed:", tErr);
          }
        }

        for (const rem of dueReminders) {
          // Atomically claim reminder into processing state
          const { data: claimed } = await client
            .from("crm_reminders")
            .update({ status: "processing", updated_at: new Date().toISOString() })
            .eq("id", rem.id)
            .eq("status", "scheduled")
            .select("id")
            .maybeSingle();

          if (!claimed) {
            // Already claimed by a concurrent process
            continue;
          }

          try {
            const safeName = escapeHtml(rem.recipient_name || "Student");
            const safeRecipient = escapeHtml(rem.recipient);
            let emailSubject = "TechBuilt Open School Notification";
            let emailHtml = "";

            if (rem.type === "class_reminder") {
              const p = rem.payload || {};
              const safeTitle = escapeHtml(p.classTitle || "Live Class");
              emailSubject = `TBOS Class Reminder: ${p.classTitle} (${p.label || "Upcoming"})`;
              emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #0B192C; margin-top: 0;">Class Reminder: ${safeTitle}</h2>
                  <p>Hello <strong>${safeName}</strong>,</p>
                  <p>This is a reminder that your live session is starting soon.</p>
                  <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
                    <div><strong>Date:</strong> ${escapeHtml(p.sessionDate || "")}</div>
                    <div><strong>Time:</strong> ${escapeHtml(p.startTime || "")} - ${escapeHtml(p.endTime || "")} (PKT)</div>
                  </div>
                  ${
                    p.meetingLink
                      ? `<div style="text-align: center; margin: 24px 0;">
                          <a href="${escapeHtml(p.meetingLink)}" style="background: #008DDA; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Join Live Classroom
                          </a>
                        </div>`
                      : ""
                  }
                  <p style="font-size: 12px; color: #64748b;">TechBuilt Open School Academic Operations</p>
                </div>
              `;
            } else if (rem.type === "fee_reminder") {
              const p = rem.payload || {};
              emailSubject = `TBOS Tuition Notice: Invoice ${p.invoiceNumber} (${p.label || "Due"})`;
              emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #0B192C; margin-top: 0;">Tuition Fee Notification</h2>
                  <p>Hello <strong>${safeName}</strong>,</p>
                  <p>This is an automated notification regarding tuition invoice <strong>${escapeHtml(p.invoiceNumber || "")}</strong>.</p>
                  <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
                    <div><strong>Outstanding Balance:</strong> PKR ${Number(p.balance || 0).toLocaleString()}</div>
                    <div><strong>Due Date:</strong> ${escapeHtml(p.dueDate || "")}</div>
                  </div>
                  <p style="font-size: 13px; color: #475569;">Please submit your fee via Bank Transfer, JazzCash, or EasyPaisa and share the deposit confirmation with admissions.</p>
                </div>
              `;
            } else {
              emailSubject = "TBOS Notification";
              emailHtml = `<p>Notification for ${safeName}</p>`;
            }

            if (transporter && rem.channel === "email") {
              await transporter.sendMail({
                from: `"TechBuilt Open School" <${config.smtpUser}>`,
                to: rem.recipient,
                subject: emailSubject,
                html: emailHtml,
              });
            }

            // Log successful delivery
            await client.from("message_logs").insert({
              channel: rem.channel,
              recipient: rem.recipient,
              recipient_name: rem.recipient_name,
              subject: emailSubject,
              content: emailSubject,
              status: "sent",
              created_by: adminUserId,
            });

            await client
              .from("crm_reminders")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", rem.id);

            sentCount++;
          } catch (dispatchErr: any) {
            failedCount++;
            const newAttempts = (rem.attempts || 0) + 1;
            const finalStatus = newAttempts >= (rem.max_attempts || 3) ? "failed" : "scheduled";

            await client
              .from("crm_reminders")
              .update({
                status: finalStatus,
                attempts: newAttempts,
                last_error: dispatchErr.message || "Dispatch failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", rem.id);
          }
        }

        await logCrmAction({
          adminUserId,
          actorEmail,
          action: "process_crm_reminders",
          entity: "crm_reminders",
          details: {
            dueFound: dueReminders.length,
            sentCount,
            failedCount,
          },
        });

  return new Response(
    JSON.stringify({
      ok: true,
      dueFound: dueReminders.length,
      sentCount,
      failedCount,
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

export const Route = createFileRoute("/api/admin/reminders/process")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        return handleRemindersProcessRequest(request);
      },
    },
  },
});
