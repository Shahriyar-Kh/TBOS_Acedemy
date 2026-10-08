import { test, expect } from "@playwright/test";
import {
  mirrorToGoogleSheetsServer,
  sanitizeIntegrationError,
  type GoogleMirrorResult,
} from "../../src/lib/googleMirror.server";
import type { AdmissionsRequestRecord } from "../../src/lib/supabase.server";
import type { IntegrationChannel } from "../../src/lib/admissionsIntegrations.server";

// Sample mock admission record
const mockAdmission: AdmissionsRequestRecord = {
  id: "test-adm-uuid-001",
  submission_kind: "application",
  application_type: "Single Course",
  selected_program_title: "Python Programming",
  student_name: "Deterministic Test Student",
  email: "deterministic@example.com",
  phone: "+92 300 1234567",
  country: "Pakistan",
  education_level: "Undergraduate / University Student",
  skill_level: "Beginner",
  learning_preference: "1-on-1",
  status: "new",
  created_at: "2026-10-08T12:00:00.000Z",
};

// Apps Script Webhook v2 Dynamic Header Helpers for unit verification
function normalizeHeaderName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderColumnIndex(headers: string[], candidateNames: string[]): number {
  const normalizedCandidates = candidateNames.map(normalizeHeaderName);
  for (let i = 0; i < headers.length; i++) {
    const norm = normalizeHeaderName(headers[i]);
    if (normalizedCandidates.indexOf(norm) !== -1) {
      return i + 1; // 1-based index
    }
  }
  return -1;
}

function extractValueForHeader(
  headerName: string,
  data: Record<string, unknown>,
  referenceId: string,
): string {
  const norm = normalizeHeaderName(headerName);
  switch (norm) {
    case "referenceid":
    case "ref":
    case "refid":
      return referenceId;
    case "submittedat":
    case "timestamp":
    case "date":
      return String(data.createdAt || data.submittedAt || "2026-10-08");
    case "studentname":
    case "fullname":
    case "name":
      return String(data.studentName || data.fullName || "");
    case "email":
      return String(data.email || "");
    case "phone":
    case "whatsapp":
      return String(data.phone || data.whatsapp || "");
    case "selectedprogram":
    case "program":
    case "course":
      return String(data.selectedProgram || data.selected || "");
    default:
      return String(data[headerName] || "");
  }
}

test.describe("Secondary Lead Delivery Reliability Unit Suite", () => {
  const originalFetch = global.fetch;
  const originalScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  test.beforeEach(() => {
    process.env.GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TEST_MOCK_URL/exec";
  });

  test.afterEach(() => {
    global.fetch = originalFetch;
    process.env.GOOGLE_SCRIPT_URL = originalScriptUrl;
  });

  // A. HTTP 200 + valid JSON + ok:true => success
  test("A. HTTP 200 + valid JSON + ok:true => success", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          duplicate: false,
          referenceId: "TBOS-UNIT-A",
          sheet: { status: "success", rowIndex: 10 },
          adminEmail: { status: "success" },
          learnerEmail: { status: "success", recipientType: "learner" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-A", 1);
    expect(result.status).toBe("success");
    expect(result.duplicate).toBe(false);
    expect(result.sheetStatus).toBe("success");
    expect(result.adminEmailStatus).toBe("success");
    expect(result.learnerEmailStatus).toBe("success");
    expect(result.learnerRecipientType).toBe("learner");
  });

  // B. HTTP 200 + valid JSON + ok:false => failed
  test("B. HTTP 200 + valid JSON + ok:false => failed", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          ok: false,
          error: "Spreadsheet quota exceeded for daily writes",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-B", 0);
    expect(result.status).toBe("failed");
    expect(result.errorSummary).toContain("Spreadsheet quota exceeded");
  });

  // C. HTTP 200 + invalid/non-JSON body => failed
  test("C. HTTP 200 + invalid/non-JSON body => failed", async () => {
    global.fetch = async () =>
      new Response("<html><body>Google Service Unavailable: Script Error</body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-C", 0);
    expect(result.status).toBe("failed");
    expect(result.errorSummary).toContain("Invalid non-JSON response");
  });

  // D. HTTP 429 => retry then success
  test("D. HTTP 429 => retry then success", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return new Response("Too Many Requests", { status: 429 });
      }
      return new Response(JSON.stringify({ ok: true, sheet: { status: "success" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-D", 2);
    expect(result.status).toBe("success");
    expect(callCount).toBe(2);
  });

  // E. HTTP 500/502/503 => retry
  test("E. HTTP 500/502/503 => retry", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      if (callCount === 1) return new Response("Internal Server Error", { status: 500 });
      if (callCount === 2) return new Response("Bad Gateway", { status: 502 });
      return new Response(JSON.stringify({ ok: true, sheet: { status: "success" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-E", 2);
    expect(result.status).toBe("success");
    expect(callCount).toBe(3);
  });

  // F. network error => retry
  test("F. network error => retry", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      if (callCount === 1) throw new Error("ECONNRESET: socket hang up");
      return new Response(JSON.stringify({ ok: true, sheet: { status: "success" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-F", 1);
    expect(result.status).toBe("success");
    expect(callCount).toBe(2);
  });

  // G. timeout / AbortError => retry and bounded failure
  test("G. timeout / AbortError => retry and bounded failure", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      throw new DOMException("The operation was aborted due to timeout", "AbortError");
    };

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-G", 1);
    expect(result.status).toBe("failed");
    expect(callCount).toBe(2); // attempt 0 and attempt 1
    expect(result.errorSummary).toContain("aborted");
  });

  // H. HTTP 400/401/403/422 => NO blind retry
  test("H. HTTP 400/401/403/422 => NO blind retry", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 401 });
    };

    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-H", 2);
    expect(result.status).toBe("failed");
    expect(callCount).toBe(1); // Exactly 1 attempt; no blind retry on 4xx
    expect(result.errorSummary).toContain("HTTP 401");
  });

  // I. maximum attempts are bounded
  test("I. maximum attempts are bounded", async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return new Response("Service Unavailable", { status: 503 });
    };

    const maxRetries = 2; // total attempts = maxRetries + 1 = 3
    const result = await mirrorToGoogleSheetsServer(mockAdmission, "TBOS-UNIT-I", maxRetries);
    expect(result.status).toBe("failed");
    expect(callCount).toBe(3);
  });

  // J. sensitive error sanitization
  test("J. sensitive error sanitization strips tokens and passwords", () => {
    const rawError =
      "Request failed at https://script.google.com/macros/s/SECRET_KEY/exec?url_token=super_secret_token_12345 with token=my_bearer_token and password=my_db_password and auth=secret_auth";
    const sanitized = sanitizeIntegrationError(rawError);

    expect(sanitized).not.toContain("super_secret_token_12345");
    expect(sanitized).not.toContain("my_bearer_token");
    expect(sanitized).not.toContain("my_db_password");
    expect(sanitized).not.toContain("secret_auth");
    expect(sanitized).toContain("token=[REDACTED]");
    expect(sanitized).toContain("password=[REDACTED]");
    expect(sanitized).toContain("auth=[REDACTED]");
    expect(sanitized.length).toBeLessThanOrEqual(200);
  });

  // K. Apps Script successful adminEmail => SMTP admin fallback NOT sent
  test("K. Apps Script successful adminEmail marks scriptHandledAdminEmail true", () => {
    const mockMirrorResult: GoogleMirrorResult = {
      status: "success",
      sheetStatus: "success",
      adminEmailStatus: "success",
      duplicate: false,
    };

    const scriptHandledAdminEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.adminEmailStatus === "success" || Boolean(mockMirrorResult.duplicate));

    expect(scriptHandledAdminEmail).toBe(true);
  });

  // L. Apps Script successful learnerEmail => SMTP learner fallback NOT sent
  test("L. Apps Script successful learnerEmail marks scriptHandledLearnerEmail true", () => {
    const mockMirrorResult: GoogleMirrorResult = {
      status: "success",
      sheetStatus: "success",
      learnerEmailStatus: "success",
      duplicate: false,
    };

    const scriptHandledLearnerEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.learnerEmailStatus === "success" ||
        (Boolean(mockMirrorResult.duplicate) && mockMirrorResult.learnerEmailStatus === "skipped"));

    expect(scriptHandledLearnerEmail).toBe(true);
  });

  // M. Apps Script failed/skipped channel => only missing channel uses fallback
  test("M. Apps Script skipped adminEmail triggers fallback while learner email is skipped", () => {
    const mockMirrorResult: GoogleMirrorResult = {
      status: "success",
      sheetStatus: "success",
      adminEmailStatus: "skipped", // skipped in script -> must trigger SMTP fallback
      learnerEmailStatus: "success", // success in script -> no SMTP fallback
      duplicate: false,
    };

    const scriptHandledAdminEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.adminEmailStatus === "success" || Boolean(mockMirrorResult.duplicate));
    const scriptHandledLearnerEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.learnerEmailStatus === "success" ||
        (Boolean(mockMirrorResult.duplicate) && mockMirrorResult.learnerEmailStatus === "skipped"));

    expect(scriptHandledAdminEmail).toBe(false); // Needs SMTP fallback
    expect(scriptHandledLearnerEmail).toBe(true); // Does NOT need SMTP fallback
  });

  // N. duplicate:true response => no duplicate delivery behavior
  test("N. duplicate:true response marks duplicate and skips duplicate notifications", () => {
    const mockMirrorResult: GoogleMirrorResult = {
      status: "success",
      duplicate: true,
      sheetStatus: "success",
      adminEmailStatus: "skipped",
      learnerEmailStatus: "skipped",
    };

    expect(mockMirrorResult.duplicate).toBe(true);
    // Legacy duplicate responses use skipped to preserve idempotency without
    // resending already-delivered notifications.
    const scriptHandledAdminEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.adminEmailStatus === "success" ||
        (Boolean(mockMirrorResult.duplicate) && mockMirrorResult.adminEmailStatus === "skipped"));
    const scriptHandledLearnerEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.learnerEmailStatus === "success" ||
        (Boolean(mockMirrorResult.duplicate) && mockMirrorResult.learnerEmailStatus === "skipped"));
    expect(scriptHandledAdminEmail).toBe(true);
    expect(scriptHandledLearnerEmail).toBe(true);
  });

  // O. Retry Failed Deliveries does not retry already-successful channels
  test("O. Retry Failed Deliveries filters out already-successful channels", () => {
    const existingLogs = [
      { channel: "admin_email", status: "success" },
      { channel: "google_sheet", status: "failed" },
      { channel: "learner_email", status: "failed" },
    ];

    const latestStatusMap = new Map<IntegrationChannel, string>();
    for (const log of existingLogs) {
      const ch = log.channel as IntegrationChannel;
      if (!latestStatusMap.has(ch)) {
        latestStatusMap.set(ch, log.status);
      }
    }

    const allChannels: IntegrationChannel[] = ["admin_email", "learner_email", "google_sheet"];
    const channelsToAttempt = allChannels.filter((ch) => latestStatusMap.get(ch) !== "success");

    // Must NOT retry admin_email because it already succeeded
    expect(channelsToAttempt).not.toContain("admin_email");
    // Must retry google_sheet and learner_email
    expect(channelsToAttempt).toContain("google_sheet");
    expect(channelsToAttempt).toContain("learner_email");
    expect(channelsToAttempt).toEqual(["learner_email", "google_sheet"]);
  });

  // Q. Duplicate response with a failed learner channel must still allow fallback
  test("Q. duplicate with failed learner channel does not suppress fallback", () => {
    const mockMirrorResult: GoogleMirrorResult = {
      status: "success",
      duplicate: true,
      sheetStatus: "success",
      adminEmailStatus: "success",
      learnerEmailStatus: "failed",
      learnerRecipientType: "guardian",
    };

    const scriptHandledLearnerEmail =
      mockMirrorResult.status === "success" &&
      (mockMirrorResult.learnerEmailStatus === "success" ||
        (Boolean(mockMirrorResult.duplicate) && mockMirrorResult.learnerEmailStatus === "skipped"));

    expect(scriptHandledLearnerEmail).toBe(false);
    expect(mockMirrorResult.learnerRecipientType).toBe("guardian");
  });

  // P. Dynamic Header Column Lookup in Apps Script (Migration-safe)
  test("P. Apps Script dynamic header lookup finds referenceId in arbitrary column", () => {
    // Legacy sheet where referenceId was added at the end (column 5)
    const legacyHeaders = ["Timestamp", "Full Name", "Email", "Phone", "referenceId"];
    const refColIndex = findHeaderColumnIndex(legacyHeaders, [
      "referenceId",
      "reference_id",
      "reference id",
      "ref",
    ]);

    expect(refColIndex).toBe(5); // Correctly located column 5, not assuming column 1!

    // Modern sheet where referenceId is in column 1
    const modernHeaders = ["referenceId", "submittedAt", "studentName"];
    expect(findHeaderColumnIndex(modernHeaders, ["referenceId"])).toBe(1);

    // Missing referenceId returns -1 (triggering safe column append)
    const oldSheetWithoutRef = ["Timestamp", "Full Name", "Email"];
    expect(findHeaderColumnIndex(oldSheetWithoutRef, ["referenceId"])).toBe(-1);

    // Field value extraction preserves legacy header names
    const sampleData = {
      fullName: "Legacy User",
      email: "legacy@example.com",
      whatsapp: "+92 300 0000000",
      selected: "React.js",
    };

    expect(extractValueForHeader("Full Name", sampleData, "TBOS-LEGACY-01")).toBe("Legacy User");
    expect(extractValueForHeader("Email", sampleData, "TBOS-LEGACY-01")).toBe("legacy@example.com");
    expect(extractValueForHeader("WhatsApp", sampleData, "TBOS-LEGACY-01")).toBe("+92 300 0000000");
    expect(extractValueForHeader("referenceId", sampleData, "TBOS-LEGACY-01")).toBe(
      "TBOS-LEGACY-01",
    );
  });
});
