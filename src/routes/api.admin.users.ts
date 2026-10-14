import crypto from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { getServerConfig } from "@/lib/config.server";
import nodemailer from "nodemailer";
import { generatePasswordResetToken, escapeHtml, logCrmAction } from "@/lib/crm.server";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
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

        const { data: users, error } = await client
          .from("admin_users")
          .select("id, email, role, is_active, full_name, phone, created_at, updated_at")
          .order("created_at", { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: "Failed to fetch users" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, users: users || [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      POST: async ({ request }: { request: Request }) => {
        // Only owner or admin can manage admin users
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
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

        // Action: Invite / Provision Admin User
        if (body.action === "invite-user") {
          const { email, role, fullName, phone } = body;
          if (!email || !email.includes("@")) {
            return new Response(JSON.stringify({ ok: false, error: "Valid email is required" }), {
              status: 422,
              headers: { "Content-Type": "application/json" },
            });
          }

          const targetEmail = email.toLowerCase().trim();
          const targetRole = role || "admin";

          // If role is 'owner', only existing owner can grant it
          if (targetRole === "owner" && auth.admin.admin.role !== "owner") {
            return new Response(
              JSON.stringify({ ok: false, error: "Only the system owner can provision another owner account" }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }

          // Check if already in admin_users
          const { data: existingAdmin } = await client
            .from("admin_users")
            .select("id, email, role")
            .eq("email", targetEmail)
            .maybeSingle();

          let userId: string;

          if (existingAdmin) {
            userId = existingAdmin.id;
            // Update role if changed
            await client
              .from("admin_users")
              .update({
                role: targetRole,
                is_active: true,
                full_name: fullName || null,
                phone: phone || null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId);
          } else {
            // Provision user in Supabase Auth via Admin API with high-entropy unexposed password
            const internalSecurePass = crypto.randomBytes(32).toString("hex") + "A1!";
            const { data: authUser, error: authErr } = await client.auth.admin.createUser({
              email: targetEmail,
              password: internalSecurePass,
              email_confirm: true,
            });

            if (authErr || !authUser?.user) {
              // User might already exist in auth.users
              const { data: listData } = await client.auth.admin.listUsers();
              const found = listData?.users.find((u) => u.email?.toLowerCase() === targetEmail);
              if (found) {
                userId = found.id;
              } else {
                return new Response(
                  JSON.stringify({ ok: false, error: `Auth creation failed: ${authErr?.message || "User could not be created"}` }),
                  { status: 500, headers: { "Content-Type": "application/json" } },
                );
              }
            } else {
              userId = authUser.user.id;
            }

            // Insert into admin_users table
            const { error: insErr } = await client.from("admin_users").insert({
              id: userId,
              email: targetEmail,
              role: targetRole,
              is_active: true,
              full_name: fullName || null,
              phone: phone || null,
            });

            if (insErr) {
              return new Response(
                JSON.stringify({ ok: false, error: `Failed to insert admin record: ${insErr.message}` }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }
          }

          // Generate cryptographic single-use invitation token (valid 48 hours)
          const { rawToken, tokenHash } = generatePasswordResetToken();
          const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

          await client.from("admin_invitations").insert({
            email: targetEmail,
            role: targetRole,
            full_name: fullName || null,
            phone: phone || null,
            token_hash: tokenHash,
            invited_by: auth.admin.user.id,
            expires_at: expiresAt,
            accepted: false,
          });

          // Also create matching password reset token entry so reset page accepts it
          await client.from("password_reset_tokens").insert({
            email: targetEmail,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used: false,
          });

          // Send notification/invitation email if SMTP configured
          const config = getServerConfig();
          const inviteUrl = `https://techbuiltos.online/admin/reset-password?token=${rawToken}&invitation=true`;

          if (config.smtpUser && config.smtpAppPassword) {
            try {
              const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpSecure,
                auth: { user: config.smtpUser, pass: config.smtpAppPassword },
              });

              const safeName = escapeHtml(fullName || targetEmail);
              const safeEmail = escapeHtml(targetEmail);
              const safeRole = escapeHtml(targetRole);

              await transporter.sendMail({
                from: `"TechBuilt Open School" <${config.smtpUser}>`,
                to: targetEmail,
                subject: "TBOS Administrator Portal Invitation",
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0B192C; margin-top: 0;">Welcome to TBOS Academy Management Portal</h2>
                    <p>Hello <strong>${safeName}</strong>,</p>
                    <p>You have been invited to the TBOS Academy Management Portal for <strong>${safeEmail}</strong> with role: <strong>${safeRole}</strong>.</p>
                    <p>Click the button below to activate your account and establish your administrator password. This invitation link is valid for <strong>48 hours</strong>:</p>
                    <div style="margin: 28px 0; text-align: center;">
                      <a href="${inviteUrl}" style="background: #008DDA; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Accept Invitation & Set Password
                      </a>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">Or copy and paste this link into your browser: <br/><a href="${inviteUrl}" style="color: #008DDA;">${inviteUrl}</a></p>
                  </div>
                `,
              });
            } catch (err) {
              console.error("Failed to send welcome email:", err);
            }
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "invite_admin_user",
            entity: "admin_users",
            entityId: userId,
            details: { email: targetEmail, role: targetRole },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              message: `Administrator invitation dispatched to ${targetEmail}`,
              userId,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Action: Update User Role or Status
        if (body.action === "update-user") {
          const { userId, role, isActive } = body;
          if (!userId) {
            return new Response(JSON.stringify({ ok: false, error: "User ID required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Fetch target user
          const { data: targetUser } = await client
            .from("admin_users")
            .select("*")
            .eq("id", userId)
            .single();

          if (!targetUser) {
            return new Response(JSON.stringify({ ok: false, error: "User not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Rule 1: shahriyarkhanpk1@gmail.com must never be deactivated or demoted
          if (targetUser.email === "shahriyarkhanpk1@gmail.com") {
            if (isActive === false || (role !== undefined && role !== "owner")) {
              return new Response(
                JSON.stringify({
                  ok: false,
                  error: "Primary owner shahriyarkhanpk1@gmail.com cannot be deactivated or demoted.",
                }),
                { status: 403, headers: { "Content-Type": "application/json" } },
              );
            }
          }

          // Rule 2: Only an owner can modify an owner's account or grant the owner role
          if (targetUser.role === "owner" && auth.admin.admin.role !== "owner") {
            return new Response(
              JSON.stringify({ ok: false, error: "Only an owner can modify another owner's account" }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }

          if (role === "owner" && auth.admin.admin.role !== "owner") {
            return new Response(
              JSON.stringify({ ok: false, error: "Only the system owner can grant the owner role" }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }

          // Rule 3: Final active owner protection
          if (targetUser.role === "owner" && targetUser.is_active) {
            if (isActive === false || (role !== undefined && role !== "owner")) {
              const { count: activeOwners } = await client
                .from("admin_users")
                .select("*", { count: "exact", head: true })
                .eq("role", "owner")
                .eq("is_active", true)
                .neq("id", userId);

              if (!activeOwners || activeOwners === 0) {
                return new Response(
                  JSON.stringify({
                    ok: false,
                    error: "Cannot deactivate or demote the final active owner account.",
                  }),
                  { status: 400, headers: { "Content-Type": "application/json" } },
                );
              }
            }
          }

          const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };
          if (role !== undefined) updates.role = role;
          if (isActive !== undefined) updates.is_active = isActive;

          const { data: updated, error } = await client
            .from("admin_users")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

          if (error) {
            return new Response(JSON.stringify({ ok: false, error: "Failed to update user" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          await logCrmAction({
            adminUserId: auth.admin.user.id,
            actorEmail: auth.admin.user.email,
            action: "update_admin_user",
            entity: "admin_users",
            entityId: userId,
            details: updates,
          });

          return new Response(JSON.stringify({ ok: true, user: updated }), {
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
