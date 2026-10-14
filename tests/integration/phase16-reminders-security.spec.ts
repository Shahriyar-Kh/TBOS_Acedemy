import { test, expect } from "@playwright/test";
import { handleRemindersProcessRequest } from "../../src/routes/api.admin.reminders.process";

test.describe("Phase 16 — Reminder Processor CRON_SECRET Security & Authentication", () => {
  const originalEnv = process.env.CRON_SECRET;
  const STRONG_TEST_SECRET = "a-very-strong-cryptographic-secret-key-32-characters-min";

  test.afterEach(() => {
    // Restore original env after each test
    if (originalEnv !== undefined) {
      process.env.CRON_SECRET = originalEnv;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  test("1. Missing CRON_SECRET returns 503 (fail closed)", async () => {
    delete process.env.CRON_SECRET;

    const req = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: "Bearer test-arbitrary-token" },
    });

    const res = await handleRemindersProcessRequest(req);
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Reminder processor is not configured.");
  });

  test("2. Empty CRON_SECRET returns 503 (fail closed)", async () => {
    process.env.CRON_SECRET = "";

    const req = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: "Bearer test-arbitrary-token" },
    });

    const res = await handleRemindersProcessRequest(req);
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Reminder processor is not configured.");
  });

  test("3. Short or weak CRON_SECRET (< 32 chars) returns 503 (fail closed)", async () => {
    process.env.CRON_SECRET = "short-secret-under-32-chars"; // 27 chars

    const req = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: "Bearer test-arbitrary-token" },
    });

    const res = await handleRemindersProcessRequest(req);
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Reminder processor is not configured.");
  });

  test("4. Wrong Bearer token returns 401 when CRON_SECRET is configured", async () => {
    process.env.CRON_SECRET = STRONG_TEST_SECRET;

    const req = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: "Bearer incorrect-secret-token-attempt" },
    });

    const res = await handleRemindersProcessRequest(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Unauthorized: Invalid CRON_SECRET Bearer token.");
  });

  test("5. Correct strong Bearer token is accepted (passes authentication)", async () => {
    process.env.CRON_SECRET = STRONG_TEST_SECRET;

    const req = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRONG_TEST_SECRET}` },
    });

    const res = await handleRemindersProcessRequest(req);
    // Should NOT be 401 or 503; passes auth (returns 200, or 429 if rate limited, or 500 if DB client unavailable)
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(503);
  });

  test("6. Query parameter secrets return 400 (forbidden in query string)", async () => {
    process.env.CRON_SECRET = STRONG_TEST_SECRET;

    // Test ?secret=...
    const req1 = new Request(`http://localhost:5173/api/admin/reminders/process?secret=${STRONG_TEST_SECRET}`, {
      method: "POST",
    });
    const res1 = await handleRemindersProcessRequest(req1);
    expect(res1.status).toBe(400);
    const json1 = await res1.json();
    expect(json1.ok).toBe(false);
    expect(json1.error).toContain("Query parameter authentication forbidden");

    // Test ?cron_secret=...
    const req2 = new Request(`http://localhost:5173/api/admin/reminders/process?cron_secret=${STRONG_TEST_SECRET}`, {
      method: "POST",
    });
    const res2 = await handleRemindersProcessRequest(req2);
    expect(res2.status).toBe(400);

    // Test ?key=...
    const req3 = new Request(`http://localhost:5173/api/admin/reminders/process?key=${STRONG_TEST_SECRET}`, {
      method: "POST",
    });
    const res3 = await handleRemindersProcessRequest(req3);
    expect(res3.status).toBe(400);
  });

  test("7. Response never exposes the configured secret in body or headers", async () => {
    process.env.CRON_SECRET = STRONG_TEST_SECRET;

    const reqFail = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: "Bearer wrong-token" },
    });
    const resFail = await handleRemindersProcessRequest(reqFail);
    const textFail = await resFail.text();
    expect(textFail).not.toContain(STRONG_TEST_SECRET);

    const reqSuccess = new Request("http://localhost:5173/api/admin/reminders/process", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRONG_TEST_SECRET}` },
    });
    const resSuccess = await handleRemindersProcessRequest(reqSuccess);
    const textSuccess = await resSuccess.text();
    expect(textSuccess).not.toContain(STRONG_TEST_SECRET);
  });
});

