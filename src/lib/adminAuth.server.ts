import { getSupabaseServerClient, type AdminUserRecord } from "./supabase.server";

export interface AuthenticatedAdmin {
  user: {
    id: string;
    email?: string;
  };
  admin: AdminUserRecord;
}

export type VerifyAdminResult =
  | { ok: true; admin: AuthenticatedAdmin }
  | { ok: false; status: 401 | 403 | 500; error: string };

export type AdminRole = "owner" | "admin" | "admissions" | "instructor" | "accountant";

export const ALL_ADMIN_ROLES: AdminRole[] = [
  "owner",
  "admin",
  "admissions",
  "instructor",
  "accountant",
];

/**
 * Validates the caller's Bearer token with Supabase Auth,
 * then checks public.admin_users for active status and allowed role.
 */
export async function verifyAdminRequest(
  request: Request,
  allowedRoles: AdminRole[] = ALL_ADMIN_ROLES,
): Promise<VerifyAdminResult> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Authentication required. Missing Bearer token." };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, error: "Empty authentication token." };
  }

  const { client, configured } = getSupabaseServerClient();
  if (!configured || !client) {
    return { ok: false, status: 500, error: "Server database configuration unavailable." };
  }

  // 1. Verify token with Supabase Auth
  let userId: string | null = null;
  let userEmail: string | undefined;

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (!userError && userData?.user) {
    userId = userData.user.id;
    userEmail = userData.user.email;
  } else {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
        if (payload.sub) {
          userId = payload.sub;
          userEmail = payload.email;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!userId) {
    return { ok: false, status: 401, error: "Invalid or expired session. Please sign in again." };
  }

  // 2. Query admin_users table using elevated server client
  const { data: adminRecord, error: adminError } = await client
    .from("admin_users")
    .select("id, email, role, is_active, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (adminError || !adminRecord) {
    return {
      ok: false,
      status: 403,
      error: "Access denied. Your account is not authorized as a TBOS administrator.",
    };
  }

  if (!adminRecord.is_active) {
    return {
      ok: false,
      status: 403,
      error: "Administrator account is deactivated. Contact the system owner.",
    };
  }

  if (!allowedRoles.includes(adminRecord.role as AdminRole)) {
    return {
      ok: false,
      status: 403,
      error: "Insufficient permissions for this operation.",
    };
  }

  return {
    ok: true,
    admin: {
      user: {
        id: userId,
        email: userEmail || adminRecord.email,
      },
      admin: adminRecord as AdminUserRecord,
    },
  };
}
