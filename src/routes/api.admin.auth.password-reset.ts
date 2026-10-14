import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { getServerConfig } from "@/lib/config.server";
import nodemailer from "nodemailer";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  logCrmAction,
  checkRateLimit,
  escapeHtml,
} from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/auth/password-reset")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
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

        // Action 1: Request Password Reset
        if (body.action === "request-reset") {
          const email = body.email?.toLowerCase().trim();
          if (!email || !email.includes("@")) {
            return new Response(JSON.stringify({ ok: false, error: "Please enter a valid email address." }), {
              status: 422,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 1. IP & Email Rate Limiting (5 attempts / 15 minutes)
          const clientIp =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("cf-connecting-ip") ||
            "127.0.0.1";

          const [emailLimit, ipLimit] = await Promise.all([
            checkRateLimit(`pwd_reset:email:${email}`, 5, 15 * 60),
            checkRateLimit(`pwd_reset:ip:${clientIp}`, 5, 15 * 60),
          ]);

          if (!emailLimit.allowed || !ipLimit.allowed) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: "Too many password reset requests. Please wait 15 minutes before trying again.",
              }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }

          // 2. Check if admin user exists and is active
          const { data: adminUser } = await client
            .from("admin_users")
            .select("id, email, is_active")
            .eq("email", email)
            .maybeSingle();

          if (adminUser && adminUser.is_active) {
            // Generate cryptographically secure token & SHA-256 hash
            const { rawToken, tokenHash } = generatePasswordResetToken();
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

            await client.from("password_reset_tokens").insert({
              email,
              token_hash: tokenHash,
              expires_at: expiresAt.toISOString(),
              used: false,
            });

            // Send email with reset link
            const config = getServerConfig();
            if (config.smtpUser && config.smtpAppPassword) {
              try {
                const transporter = nodemailer.createTransport({
                  host: config.smtpHost,
                  port: config.smtpPort,
                  secure: config.smtpSecure,
                  auth: { user: config.smtpUser, pass: config.smtpAppPassword },
                });

                const resetUrl = `https://techbuiltos.online/admin/reset-password?token=${rawToken}`;
                const safeEmail = escapeHtml(email);

                await transporter.sendMail({
                  from: `"TBOS Security" <${config.smtpUser}>`,
                  to: email,
                  subject: "TBOS Administrator Password Reset Request",
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #0B192C; margin-top: 0;">Password Reset Request</h2>
                      <p>A password reset was requested for your TBOS administrator account (<strong>${safeEmail}</strong>).</p>
                      <p>Click the button below to set a new password. This link is valid for <strong>30 minutes</strong> and can only be used once:</p>
                      <div style="margin: 28px 0; text-align: center;">
                        <a href="${resetUrl}" style="background: #008DDA; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                          Reset Administrator Password
                        </a>
                      </div>
                      <p style="font-size: 12px; color: #64748b;">Or copy and paste this link into your browser: <br/><a href="${resetUrl}" style="color: #008DDA;">${resetUrl}</a></p>
                      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
                    </div>
                  `,
                });
              } catch (err) {
                console.error("Failed to send reset email:", err);
              }
            }

            await logCrmAction({
              actorEmail: email,
              action: "request_password_reset",
              entity: "password_reset_tokens",
            });
          }

          // Generic response: Never disclose account existence
          return new Response(
            JSON.stringify({
              ok: true,
              message:
                "If an active administrator account exists for this email, password reset instructions have been sent.",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action 2: Confirm Password Reset with Token
        if (body.action === "confirm-reset") {
          const { token, newPassword } = body;
          if (!token || typeof token !== "string") {
            return new Response(JSON.stringify({ ok: false, error: "Reset token is required." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (!newPassword || newPassword.length < 8) {
            return new Response(
              JSON.stringify({ ok: false, error: "Password must be at least 8 characters long." }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          const tokenHash = hashPasswordResetToken(token);
          const nowIso = new Date().toISOString();

          // Query matching active token (must not be used and must not be expired)
          const { data: tokenRecord, error: tokenErr } = await client
            .from("password_reset_tokens")
            .select("*")
            .eq("token_hash", tokenHash)
            .eq("used", false)
            .gt("expires_at", nowIso)
            .maybeSingle();

          if (tokenErr || !tokenRecord) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: "Invalid or expired password reset link. Please request a new one.",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const targetEmail = tokenRecord.email.toLowerCase().trim();

          // Find auth user ID in Supabase
          const { data: adminUser } = await client
            .from("admin_users")
            .select("id")
            .eq("email", targetEmail)
            .single();

          if (!adminUser) {
            return new Response(JSON.stringify({ ok: false, error: "User record not found." }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Update password in Supabase Auth
          const { error: authUpdateErr } = await client.auth.admin.updateUserById(adminUser.id, {
            password: newPassword,
          });

          if (authUpdateErr) {
            console.error("Auth password update error:", authUpdateErr);
            return new Response(
              JSON.stringify({ ok: false, error: "Failed to update password. Please try again." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // Invalidate used token
          await client
            .from("password_reset_tokens")
            .update({ used: true })
            .eq("id", tokenRecord.id);

          // Invalidate all other pending tokens and revoke sessions for this email
          await client
            .from("password_reset_tokens")
            .update({ used: true })
            .eq("email", targetEmail)
            .neq("id", tokenRecord.id);

          // Atomically activate admin user account upon password setup
          await client
            .from("admin_users")
            .update({ is_active: true, updated_at: nowIso })
            .eq("id", adminUser.id);

          // Mark invitation as accepted if this was an invitation activation
          await client
            .from("admin_invitations")
            .update({ accepted: true, updated_at: nowIso })
            .eq("email", targetEmail);

          try {
            await client.auth.admin.signOut(adminUser.id);
          } catch {
            // SignOut may not be supported on all Auth tiers, ignore
          }

          await logCrmAction({
            actorEmail: targetEmail,
            action: "confirm_password_reset",
            entity: "password_reset_tokens",
            entityId: tokenRecord.id,
          });

          return new Response(
            JSON.stringify({
              ok: true,
              message: "Password updated successfully. You can now sign in.",
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
