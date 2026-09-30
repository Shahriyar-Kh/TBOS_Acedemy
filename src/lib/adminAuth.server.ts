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

/**
 * Validates the caller's Bearer token with Supabase Auth,
 * then checks public.admin_users for active status and allowed role.
 */
export async function verifyAdminRequest(
  request: Request,
  allowedRoles: Array<"owner" | "admin" | "admissions"> = ["owner", "admin", "admissions"],
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
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session. Please sign in again." };
  }

  const userId = userData.user.id;

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

  if (!allowedRoles.includes(adminRecord.role as "owner" | "admin" | "admissions")) {
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
        id: userData.user.id,
        email: userData.user.email,
      },
      admin: adminRecord as AdminUserRecord,
    },
  };
}
