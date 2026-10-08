/**
 * TechBuilt Open School — Admissions Webhook v2
 * Google Apps Script Web App for Google Sheets Mirror & Notification Delivery
 *
 * Capabilities:
 * 1. Health check via GET request (`doGet`).
 * 2. Idempotent append to Google Sheets locating `referenceId` by header name (`doPost`).
 * 3. Never assumes `referenceId` is Column A; detects existing header row dynamically.
 * 4. Migration-safe: Preserves legacy sheet columns; adds `referenceId` at end if missing.
 * 5. Prevents duplicate row appends and duplicate notification emails on replay.
 * 6. Structured JSON responses with channel breakdown (sheet, adminEmail, learnerEmail).
 * 7. Full backwards compatibility with legacy form payloads.
 */

// Configuration — can also be overridden via Script Properties (NOTIFY_EMAIL)
const DEFAULT_NOTIFY_EMAIL = "admissions@techbuiltopenschool.com";

const CANONICAL_HEADERS = [
  "referenceId",
  "submittedAt",
  "submissionKind",
  "applicationType",
  "selectedProgram",
  "studentName",
  "email",
  "phone",
  "country",
  "city",
  "age",
  "educationLevel",
  "institution",
  "skillLevel",
  "learningGoal",
  "learningPreference",
  "preferredDays",
  "preferredTime",
  "timezone",
  "guardianName",
  "guardianPhone",
  "guardianEmail",
  "notes",
  "sourcePage",
  "status",
];

function getNotifyEmail() {
  try {
    const props = PropertiesService.getScriptProperties();
    const configured = props.getProperty("NOTIFY_EMAIL");
    if (configured && configured.trim() !== "") {
      return configured.trim();
    }
  } catch (e) {
    // Fall back to constant if properties unavailable
  }
  return DEFAULT_NOTIFY_EMAIL;
}

/**
 * Normalizes header string for fuzzy matching (lowercase, no spaces, no underscores).
 */
function normalizeHeaderName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Locates the 1-based column index matching any of the candidate names.
 * Returns -1 if not found.
 */
function findHeaderColumnIndex(headers, candidateNames) {
  const normalizedCandidates = candidateNames.map(normalizeHeaderName);
  for (let i = 0; i < headers.length; i++) {
    const norm = normalizeHeaderName(headers[i]);
    if (normalizedCandidates.indexOf(norm) !== -1) {
      return i + 1; // 1-based index for Google Sheets
    }
  }
  return -1;
}

/**
 * Migration-safe value extractor mapping payload fields to any header name.
 */
function extractValueForHeader(headerName, data, referenceId) {
  const norm = normalizeHeaderName(headerName);

  switch (norm) {
    case "referenceid":
    case "ref":
    case "refid":
      return referenceId;

    case "submittedat":
    case "timestamp":
    case "date":
    case "time":
    case "createdat":
      return data.createdAt || data.submittedAt || new Date().toISOString();

    case "submissionkind":
    case "submissiontype":
    case "kind":
    case "type":
      return data.submissionKind || (data.formType === "Free Demo" ? "demo" : "application");

    case "applicationtype":
    case "coursetype":
    case "category":
      return data.applicationType || data.formType || data.courseType || "General Admissions Inquiry";

    case "selectedprogram":
    case "program":
    case "course":
    case "subject":
    case "selected":
      return data.selectedProgram || data.selected || "General Admissions Inquiry";

    case "studentname":
    case "fullname":
    case "name":
    case "learnername":
      return data.studentName || data.fullName || "";

    case "email":
    case "emailaddress":
      return data.email || "";

    case "phone":
    case "whatsapp":
    case "phonenumber":
    case "contact":
    case "mobile":
      return data.phone || data.whatsapp || "";

    case "country":
      return data.country || "";

    case "city":
      return data.city || "";

    case "age":
      return data.age || "";

    case "educationlevel":
    case "grade":
    case "level":
    case "class":
      return data.educationLevel || data.grade || "";

    case "institution":
    case "school":
    case "college":
    case "university":
      return data.institution || "";

    case "skilllevel":
    case "experience":
      return data.skillLevel || "";

    case "learninggoal":
    case "goal":
      return data.learningGoal || data.goal || "";

    case "learningpreference":
    case "format":
    case "classtype":
      return data.learningPreference || data.classType || "";

    case "preferreddays":
    case "days":
      return data.preferredDays || "";

    case "preferredtime":
    case "timepreference":
    case "timewindow":
      return data.preferredTime || "";

    case "timezone":
      return data.timezone || "";

    case "guardianname":
    case "parentname":
      return data.guardianName || "";

    case "guardianphone":
    case "parentphone":
      return data.guardianPhone || "";

    case "guardianemail":
    case "parentemail":
      return data.guardianEmail || "";

    case "notes":
    case "message":
    case "comments":
    case "additionalrequirements":
      return data.notes || data.message || "";

    case "sourcepage":
    case "source":
    case "page":
      return data.sourcePage || "Admissions Endpoint";

    case "status":
      return data.status || "new";

    default:
      return data[headerName] || "";
  }
}

/**
 * Health check endpoint for testing deployment status.
 */
function doGet(e) {
  const healthResponse = {
    ok: true,
    version: "2.0.0",
    service: "TBOS Admissions Webhook v2",
    timestamp: new Date().toISOString(),
    status: "active",
  };

  return ContentService.createTextOutput(JSON.stringify(healthResponse)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Main Webhook Receiver
 */
function doPost(e) {
  try {
    if (!e) {
      return createJsonResponse({ ok: false, error: "Empty request event" }, 400);
    }

    let rawContents = "";
    if (e.postData && e.postData.contents) {
      rawContents = e.postData.contents;
    } else if (e.postContents) {
      rawContents = e.postContents;
    }

    if (!rawContents) {
      return createJsonResponse({ ok: false, error: "No post data payload provided" }, 400);
    }

    const data = JSON.parse(rawContents);

    // Extract reference ID or generate fallback
    const referenceId = (
      data.referenceId ||
      data.ref ||
      "TBOS-EXT-" + new Date().getTime().toString(36).toUpperCase()
    ).trim();

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    let lastCol = sheet.getLastColumn();

    let currentHeaders = [];

    // 1. Ensure Header Row exists or read existing headers
    if (lastRow === 0 || lastCol === 0) {
      sheet.appendRow(CANONICAL_HEADERS);
      sheet
        .getRange(1, 1, 1, CANONICAL_HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#0b192c")
        .setFontColor("#ffffff");
      currentHeaders = CANONICAL_HEADERS.slice();
      lastCol = CANONICAL_HEADERS.length;
    } else {
      // Read Row 1 headers dynamically (Migration-safe: never clear or overwrite existing sheet)
      const rawHeaderValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      currentHeaders = rawHeaderValues.map(function (h) {
        return String(h || "").trim();
      });
    }

    // 2. Locate referenceId column dynamically by header name
    let refColIndex = findHeaderColumnIndex(currentHeaders, [
      "referenceId",
      "reference_id",
      "reference id",
      "ref",
      "refId",
    ]);

    if (refColIndex === -1) {
      // Migration safe: Add referenceId column at the end without reordering legacy columns
      const newRefCol = currentHeaders.length + 1;
      sheet.getRange(1, newRefCol).setValue("referenceId").setFontWeight("bold");
      currentHeaders.push("referenceId");
      refColIndex = newRefCol;
    }

    // 3. Dynamic Idempotency Check: Verify if referenceId already exists in located column
    if (lastRow > 1) {
      const refColValues = sheet.getRange(2, refColIndex, lastRow - 1, 1).getValues();
      for (let i = 0; i < refColValues.length; i++) {
        const existingRef = String(refColValues[i][0] || "").trim();
        if (existingRef && existingRef.toUpperCase() === referenceId.toUpperCase()) {
          // Idempotent hit: Record already mirrored!
          return createJsonResponse({
            ok: true,
            duplicate: true,
            referenceId: referenceId,
            sheet: {
              status: "success",
              rowIndex: i + 2,
              refColumn: refColIndex,
              note: "Existing row matched referenceId dynamically; retained idempotently",
            },
            adminEmail: {
              status: "skipped",
              note: "Skipped email to prevent duplicate notification",
            },
            learnerEmail: {
              status: "skipped",
              note: "Skipped email to prevent duplicate notification",
            },
          });
        }
      }
    }

    // 4. Map values against actual sheet headers to preserve existing schema order
    const rowValues = currentHeaders.map(function (colName) {
      return extractValueForHeader(colName, data, referenceId);
    });

    // 5. Append row to sheet
    sheet.appendRow(rowValues);
    const newRowIndex = sheet.getLastRow();

    // 6. Send Admin Notification Email via MailApp
    let adminEmailStatus = "skipped";
    let adminEmailError = null;

    try {
      const recipient = getNotifyEmail();
      const isDemo =
        (data.submissionKind || "").toLowerCase() === "demo" ||
        (data.formType || "").toLowerCase() === "free demo";

      const studentName = data.studentName || data.fullName || "Prospective Student";
      const programTitle = data.selectedProgram || data.selected || "Admissions Inquiry";

      const subject = isDemo
        ? "TBOS Free Demo Request — " + programTitle + " (" + referenceId + ")"
        : "TBOS New Application — " + programTitle + " (" + referenceId + ")";

      const bodyLines = [
        "TECHBUILT OPEN SCHOOL — " + (isDemo ? "FREE DEMO REQUEST" : "NEW APPLICATION"),
        "==================================================",
        "Reference ID: " + referenceId,
        "Student Name: " + studentName,
        "Program / Course: " + programTitle,
        "Category: " + (data.applicationType || data.formType || "Admissions"),
        "Email: " + (data.email || "N/A"),
        "Phone / WhatsApp: " + (data.phone || data.whatsapp || "N/A"),
        "Location: " + (data.country || "") + (data.city ? ", " + data.city : ""),
        "Education Level: " + (data.educationLevel || data.grade || "N/A"),
        "Age: " + (data.age || "N/A"),
        data.guardianName
          ? "Parent / Guardian: " +
            data.guardianName +
            " (" +
            (data.guardianPhone || "No phone") +
            ")"
          : null,
        data.preferredTime
          ? "Preferred Timing: " + (data.preferredDays || "") + " " + data.preferredTime
          : null,
        data.notes
          ? "Applicant Notes: " + data.notes
          : data.message
            ? "Message: " + data.message
            : null,
        "Source Page: " + (data.sourcePage || "Direct"),
        "Google Sheet Row: #" + newRowIndex,
        "==================================================",
      ].filter(Boolean);

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        body: bodyLines.join("\n"),
      });

      adminEmailStatus = "success";
    } catch (mailErr) {
      adminEmailStatus = "failed";
      adminEmailError = String(mailErr);
    }

    return createJsonResponse({
      ok: true,
      duplicate: false,
      referenceId: referenceId,
      sheet: {
        status: "success",
        rowIndex: newRowIndex,
        refColumn: refColIndex,
      },
      adminEmail: {
        status: adminEmailStatus,
        error: adminEmailError,
      },
      learnerEmail: {
        status: "skipped",
        note: "Learner acknowledgement dispatched via academy mail service",
      },
    });
  } catch (err) {
    return createJsonResponse({
      ok: false,
      error: String(err),
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
