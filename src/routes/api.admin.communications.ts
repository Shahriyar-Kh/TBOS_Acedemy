import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { getServerConfig } from "@/lib/config.server";
import nodemailer from "nodemailer";
import { logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/communications")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
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

        const [
          { data: templates },
          { data: logs },
        ] = await Promise.all([
          client.from("message_templates").select("*").order("name"),
          client.from("message_logs").select("*").order("created_at", { ascending: false }).limit(100),
        ]);

        return new Response(
          JSON.stringify({
            ok: true,
            templates: templates || [],
            logs: logs || [],
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

        // Action: Log WhatsApp Click-to-Chat
        if (body.action === "log-whatsapp") {
          const { recipient, recipientName, content } = body;
          await client.from("message_logs").insert({
            channel: "whatsapp",
            recipient: recipient || "unknown",
            recipient_name: recipientName || null,
            content: content || "",
            status: "prepared_link",
            created_by: auth.admin.user.id,
          });

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Action: Send Email
        if (body.action === "send-email") {
          const { recipients, subject, content } = body;
          if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return new Response(JSON.stringify({ ok: false, error: "No recipients specified" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (!subject || !content) {
            return new Response(JSON.stringify({ ok: false, error: "Subject and content are required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const config = getServerConfig();
          if (!config.smtpUser || !config.smtpAppPassword) {
            return new Response(
              JSON.stringify({ ok: false, error: "SMTP credentials not configured on server" }),
              { status: 503, headers: { "Content-Type": "application/json" } },
            );
          }

          const transporter = nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpSecure,
            auth: {
              user: config.smtpUser,
              pass: config.smtpAppPassword,
            },
            connectionTimeout: 8000,
          });

          let sentCount = 0;
          let failCount = 0;
          const errors: string[] = [];

          for (const rcpt of recipients) {
            const email = rcpt.email?.trim();
            if (!email) continue;

            // Template interpolation for individual recipients
            const personalizedContent = content
              .replace(/{{studentName}}/g, rcpt.name || "Student")
              .replace(/{{programName}}/g, rcpt.programName || "TBOS Academy Program")
              .replace(/{{feeAmount}}/g, rcpt.feeAmount || "")
              .replace(/{{dueDate}}/g, rcpt.dueDate || "")
              .replace(/{{classTime}}/g, rcpt.classTime || "")
              .replace(/{{meetingLink}}/g, rcpt.meetingLink || "");

            try {
              await transporter.sendMail({
                from: `"TechBuilt Open School" <${config.smtpUser}>`,
                to: email,
                subject,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                    <div style="background: #0B192C; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">TechBuilt Open School</h2>
                    </div>
                    <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
                      ${personalizedContent.replace(/\n/g, "<br>")}
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin: 0;">
                        TechBuilt Open School · techbuiltopenschool@gmail.com · +92 329 5448590
                      </p>
                    </div>
                  </div>
                `,
              });

              sentCount++;
              await client.from("message_logs").insert({
                channel: "email",
                recipient: email,
                recipient_name: rcpt.name || null,
                subject,
                content: personalizedContent,
                status: "sent",
                created_by: auth.admin.user.id,
              });
            } catch (err: any) {
              failCount++;
              const errMsg = err?.message || "Send error";
              errors.push(`${email}: ${errMsg}`);
              await client.from("message_logs").insert({
                channel: "email",
                recipient: email,
                recipient_name: rcpt.name || null,
                subject,
                content: personalizedContent,
                status: "failed",
                error_message: errMsg,
                created_by: auth.admin.user.id,
              });
            }
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "send_email_broadcast",
            entity: "message_logs",
            details: { totalRecipients: recipients.length, sentCount, failCount, subject },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              sentCount,
              failCount,
              errors: errors.slice(0, 5),
            }),
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

