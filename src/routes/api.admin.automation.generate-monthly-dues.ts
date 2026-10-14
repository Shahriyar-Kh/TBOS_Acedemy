import crypto from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import { generateMonthlyDuesBatch, logCrmAction } from "@/lib/crm.server";

export async function handleGenerateMonthlyDuesRequest(request: Request): Promise<Response> {
  // 1. Prohibit query parameter secrets
  const url = new URL(request.url);
  if (url.searchParams.has("secret") || url.searchParams.has("cron_secret") || url.searchParams.has("key")) {
    return new Response(
      JSON.stringify({ ok: false, error: "Query parameter authentication forbidden. Use Authorization header." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Authentication: Require dedicated server-side CRON_SECRET or Admin Session
  const rawCronSecret = process.env.CRON_SECRET?.trim();
  const isCronConfigured = Boolean(rawCronSecret && rawCronSecret.length >= 32);

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  let isAuthorized = false;
  let actorEmail = "system_cron";
  let adminUserId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    if (!isCronConfigured) {
      return new Response(
        JSON.stringify({ ok: false, error: "Monthly dues automation is not configured." }),
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
    const auth = await verifyAdminRequest(request, ["owner", "admin"]);
    if (auth.ok) {
      isAuthorized = true;
      actorEmail = auth.admin.user.email || "admin@techbuiltos.online";
      adminUserId = auth.admin.user.id;
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: "Authentication required via Bearer CRON_SECRET or Admin Session." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 3. Execution
  let body: any = {};
  if (request.method === "POST") {
    try {
      body = await request.json();
    } catch {
      // Allow empty body
    }
  }

  const now = new Date();
  const targetMonth = body.billingMonth || url.searchParams.get("month") || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueDay = Number(body.dueDay) || 10;

  try {
    const count = await generateMonthlyDuesBatch(targetMonth, dueDay);

    await logCrmAction({
      adminUserId,
      actorEmail,
      action: "automation_generate_monthly_dues",
      entity: "fee_invoices",
      details: { targetMonth, dueDay, count },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        count,
        generatedCount: count,
        billingMonth: targetMonth,
        dueDay,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Failed to generate monthly dues." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const Route = createFileRoute("/api/admin/automation/generate-monthly-dues")({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => handleGenerateMonthlyDuesRequest(request),
      POST: ({ request }: { request: Request }) => handleGenerateMonthlyDuesRequest(request),
    },
  },
});

