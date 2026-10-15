import { test, expect } from "@playwright/test";
import { Client } from "pg";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import {
  createSupabaseTestServer,
  createSignedTestToken,
  createExpiredTestToken,
  createForgedMockSignatureToken,
  TEST_DB_URL,
  type SupabaseTestServerInstance,
} from "../helpers/supabaseTestServer";

test.describe("Phase 17 — Strict Supabase Authentication Security & Forged Token Rejection", () => {
  test.describe.configure({ mode: "serial" });

  let testServer: SupabaseTestServerInstance;
  let pgClient: Client;

  const validAdminUser = {
    id: "a1111111-1111-1111-1111-111111111111",
    email: "security-owner@test.local",
    role: "owner",
  };

  const nonAdminUser = {
    id: "b2222222-2222-2222-2222-222222222222",
    email: "stranger@test.local",
  };

  const deactivatedAdminUser = {
    id: "c3333333-3333-3333-3333-333333333333",
    email: "deactivated-admin@test.local",
    role: "admin",
  };

  const instructorUser = {
    id: "d4444444-4444-4444-4444-444444444444",
    email: "instructor@test.local",
    role: "instructor",
  };

  test.beforeAll(async () => {
    // Configure environment to point to our test Supabase HTTP service
    process.env.SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.SUPABASE_SECRET_KEY = "test-secret-key-security-verification-min-32-chars!";

    // Start local test Supabase service
    testServer = createSupabaseTestServer({
      port: 54321,
      jwtSecret: "tbos-secure-test-jwt-secret-key-minimum-32-chars-long!",
    });
    await testServer.start();

    // Connect to PostgreSQL to seed test records
    pgClient = new Client({ connectionString: TEST_DB_URL });
    await pgClient.connect();

    // Seed auth.users and admin_users in PostgreSQL
    await pgClient.query(`
      INSERT INTO auth.users (id, email)
      VALUES
        ('${validAdminUser.id}', '${validAdminUser.email}'),
        ('${deactivatedAdminUser.id}', '${deactivatedAdminUser.email}'),
        ('${instructorUser.id}', '${instructorUser.email}')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

      INSERT INTO public.admin_users (id, email, role, is_active)
      VALUES
        ('${validAdminUser.id}', '${validAdminUser.email}', '${validAdminUser.role}', true),
        ('${deactivatedAdminUser.id}', '${deactivatedAdminUser.email}', '${deactivatedAdminUser.role}', false),
        ('${instructorUser.id}', '${instructorUser.email}', '${instructorUser.role}', true)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email, role = EXCLUDED.role, is_active = EXCLUDED.is_active;
    `);
  });

  test.afterAll(async () => {
    if (pgClient) {
      await pgClient.query(`
        DELETE FROM public.admin_users WHERE id IN (
          '${validAdminUser.id}',
          '${deactivatedAdminUser.id}',
          '${instructorUser.id}'
        );
        DELETE FROM auth.users WHERE id IN (
          '${validAdminUser.id}',
          '${deactivatedAdminUser.id}',
          '${instructorUser.id}'
        );
      `);
      await pgClient.end();
    }
    if (testServer) {
      await testServer.stop();
    }
  });

  // ============================================================================
  // Test 1: Fabricated JWT ending in .mock-signature is strictly rejected (401)
  // ============================================================================
  test("1. Fabricated JWT with .mock-signature is rejected with HTTP 401", async () => {
    const forgedToken = createForgedMockSignatureToken({
      sub: validAdminUser.id,
      email: validAdminUser.email,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/me", {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });

    const result = await verifyAdminRequest(fakeReq);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
      expect(result.error).toMatch(/Invalid or expired session/i);
    }
  });

  // ============================================================================
  // Test 2: Expired JWT is rejected with HTTP 401
  // ============================================================================
  test("2. Expired JWT is rejected with HTTP 401", async () => {
    const expiredToken = createExpiredTestToken({
      sub: validAdminUser.id,
      email: validAdminUser.email,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/me", {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    const result = await verifyAdminRequest(fakeReq);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
      expect(result.error).toMatch(/Invalid or expired session/i);
    }
  });

  // ============================================================================
  // Test 3: Malformed JWT is rejected with HTTP 401
  // ============================================================================
  test("3. Malformed JWT is rejected with HTTP 401", async () => {
    const malformedTokens = [
      "not-a-token",
      "header.payload",
      "header..signature",
      "invalid-base64.invalid-base64.invalid-sig",
    ];

    for (const t of malformedTokens) {
      const fakeReq = new Request("http://localhost:5173/api/admin/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const result = await verifyAdminRequest(fakeReq);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(401);
      }
    }
  });

  // ============================================================================
  // Test 4: Valid authenticated token from non-admin user receives HTTP 403
  // ============================================================================
  test("4. Valid authenticated non-admin user receives HTTP 403", async () => {
    const nonAdminToken = createSignedTestToken({
      sub: nonAdminUser.id,
      email: nonAdminUser.email,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/me", {
      headers: { Authorization: `Bearer ${nonAdminToken}` },
    });

    const result = await verifyAdminRequest(fakeReq);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toMatch(/Access denied/i);
    }
  });

  // ============================================================================
  // Test 5: Deactivated admin receives HTTP 403
  // ============================================================================
  test("5. Deactivated admin receives HTTP 403", async () => {
    const deactivatedToken = createSignedTestToken({
      sub: deactivatedAdminUser.id,
      email: deactivatedAdminUser.email,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/me", {
      headers: { Authorization: `Bearer ${deactivatedToken}` },
    });

    const result = await verifyAdminRequest(fakeReq);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toMatch(/deactivated/i);
    }
  });

  // ============================================================================
  // Test 6: Role unauthorized receives HTTP 403
  // ============================================================================
  test("6. Role unauthorized for owner-only action receives HTTP 403", async () => {
    const instructorToken = createSignedTestToken({
      sub: instructorUser.id,
      email: instructorUser.email,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/users", {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });

    // Only "owner" allowed
    const result = await verifyAdminRequest(fakeReq, ["owner"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toMatch(/Insufficient permissions/i);
    }
  });

  // ============================================================================
  // Test 7: Valid authenticated admin token succeeds with verified admin identity
  // ============================================================================
  test("7. Valid authenticated admin token succeeds with HTTP 200 equivalent", async () => {
    const validToken = createSignedTestToken({
      sub: validAdminUser.id,
      email: validAdminUser.email,
      role: validAdminUser.role,
    });

    const fakeReq = new Request("http://localhost:5173/api/admin/me", {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    const result = await verifyAdminRequest(fakeReq);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.admin.user.id).toBe(validAdminUser.id);
      expect(result.admin.user.email).toBe(validAdminUser.email);
      expect(result.admin.admin.role).toBe("owner");
      expect(result.admin.admin.is_active).toBe(true);
    }
  });

  // ============================================================================
  // Test 8: Endpoints reject header.payload.mock-signature and prevent DB creation
  // ============================================================================
  test("8. Forged header.payload.mock-signature token is rejected across all admin API endpoints", async () => {
    const forgedToken = createForgedMockSignatureToken({
      sub: validAdminUser.id,
      email: validAdminUser.email,
    });

    const endpoints = [
      { method: "GET", path: "/api/admin/me" },
      { method: "GET", path: "/api/admin/students" },
      { method: "GET", path: "/api/admin/fees" },
      { method: "GET", path: "/api/admin/timetable" },
    ];

    for (const ep of endpoints) {
      const fakeReq = new Request(`http://localhost:5173${ep.path}`, {
        method: ep.method,
        headers: { Authorization: `Bearer ${forgedToken}` },
      });
      const authRes = await verifyAdminRequest(fakeReq);
      expect(authRes.ok).toBe(false);
      if (!authRes.ok) {
        expect(authRes.status).toBe(401);
      }
    }

    // Attempt mutation: POST with forged token
    const testHackerEmail = `hacker-${Date.now()}@test.local`;
    const postReq = new Request("http://localhost:5173/api/admin/students", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${forgedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Hacker Injected Student",
        email: testHackerEmail,
        phone: "+923000000000",
      }),
    });

    const postAuth = await verifyAdminRequest(postReq);
    expect(postAuth.ok).toBe(false);
    if (!postAuth.ok) {
      expect(postAuth.status).toBe(401);
    }

    // Verify database: no record was created
    const hackerCheck = await pgClient.query(
      "SELECT * FROM public.students WHERE email = $1",
      [testHackerEmail]
    );
    expect(hackerCheck.rows.length).toBe(0);
  });
});
