import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { getServerConfig } from "@/lib/config.server";
import nodemailer from "nodemailer";
import { logCrmAction } from "@/lib/crm.server";

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
          const { email, role, fullName, phone, temporaryPassword } = body;
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
            // Provision user in Supabase Auth via Admin API
            const passToUse = temporaryPassword || `TBOS#${Math.random().toString(36).slice(-8)}!2026`;
            const { data: authUser, error: authErr } = await client.auth.admin.createUser({
              email: targetEmail,
              password: passToUse,
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

          // Send notification/invitation email if SMTP configured
          const config = getServerConfig();
          if (config.smtpUser && config.smtpAppPassword) {
            try {
              const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpSecure,
                auth: { user: config.smtpUser, pass: config.smtpAppPassword },
              });

              await transporter.sendMail({
                from: `"TechBuilt Open School" <${config.smtpUser}>`,
                to: targetEmail,
                subject: "TBOS Administrator Portal Access Granted",
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0B192C;">Welcome to TBOS Academy Management Portal</h2>
                    <p>Your administrator access for <strong>${targetEmail}</strong> has been provisioned with role: <strong>${targetRole}</strong>.</p>
                    <p>You can sign in to the administrative portal at: <a href="https://techbuiltos.online/admin/login">https://techbuiltos.online/admin/login</a></p>
                    <p>If you need to set or reset your password, please use the "Forgot Password" link on the login page.</p>
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
              message: `Administrator access provisioned for ${targetEmail}`,
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

          // Prevent non-owners from modifying owner accounts
          const { data: targetUser } = await client
            .from("admin_users")
            .select("*")
            .eq("id", userId)
            .single();

          if (targetUser?.role === "owner" && auth.admin.admin.role !== "owner") {
            return new Response(
              JSON.stringify({ ok: false, error: "Only an owner can modify another owner's account" }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
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
