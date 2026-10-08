/**
 * TechBuilt Open School — Admissions Webhook v2.1
 * Google Apps Script Web App for Google Sheets Mirror & Notification Delivery
 *
 * Guarantees:
 * 1. GET health endpoint for deployment verification.
 * 2. Idempotent Sheet mirroring keyed by referenceId.
 * 3. Migration-safe dynamic header lookup; no fixed-column assumptions.
 * 4. Admin notification via Google MailApp.
 * 5. Learner/guardian acknowledgement via Google MailApp.
 * 6. Per-reference delivery state in Script Properties so duplicate webhook
 *    retries can re-attempt only channels that have not succeeded.
 * 7. Structured JSON channel statuses for the Cloudflare Worker.
 */

const DEFAULT_NOTIFY_EMAIL = "admissions@techbuiltopenschool.com";
const DELIVERY_STATE_PREFIX = "TBOS_DELIVERY_";

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
    if (configured && configured.trim() !== "") return configured.trim();
  } catch (e) {
    // Fall back to constant if Script Properties are unavailable.
  }
  return DEFAULT_NOTIFY_EMAIL;
}

function normalizeHeaderName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderColumnIndex(headers, candidateNames) {
  const normalizedCandidates = candidateNames.map(normalizeHeaderName);
  for (let i = 0; i < headers.length; i++) {
    if (normalizedCandidates.indexOf(normalizeHeaderName(headers[i])) !== -1) {
      return i + 1;
    }
  }
  return -1;
}

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

function deliveryStateKey(referenceId) {
  return DELIVERY_STATE_PREFIX + String(referenceId || "").toUpperCase();
}

function readDeliveryState(referenceId) {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(deliveryStateKey(referenceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    return null;
  }
}

function writeDeliveryState(referenceId, state) {
  try {
    PropertiesService.getScriptProperties().setProperty(
      deliveryStateKey(referenceId),
      JSON.stringify({
        adminEmailStatus: state.adminEmailStatus || "skipped",
        learnerEmailStatus: state.learnerEmailStatus || "skipped",
        learnerRecipientType: state.learnerRecipientType || "learner",
        rowIndex: state.rowIndex || null,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch (e) {
    // Delivery still succeeds even if audit state cannot be stored.
  }
}

function isDemoRequest(data) {
  return (
    String(data.submissionKind || "").toLowerCase() === "demo" ||
    String(data.formType || "").toLowerCase() === "free demo"
  );
}

function isGeneralInquiry(data) {
  return (
    String(data.applicationType || "").toLowerCase() === "general admissions inquiry" ||
    String(data.selectedProgram || data.selected || "").toLowerCase().indexOf("enquiry") !== -1
  );
}

function sendAdminNotification(data, referenceId, rowIndex) {
  try {
    const recipient = getNotifyEmail();
    const isDemo = isDemoRequest(data);
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
      rowIndex ? "Google Sheet Row: #" + rowIndex : null,
      "==================================================",
    ].filter(Boolean);

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: bodyLines.join("\n"),
    });

    return { status: "success", recipientType: "admin", error: null };
  } catch (err) {
    return {
      status: "failed",
      recipientType: "admin",
      error: String(err).slice(0, 200),
    };
  }
}

function resolveLearnerRecipient(data) {
  const learnerEmail = String(data.email || "").trim();
  const guardianEmail = String(data.guardianEmail || "").trim();
  const age = Number(data.age);
  const isMinor = Number.isFinite(age) && age > 0 && age < 18;

  if (isMinor && guardianEmail.indexOf("@") > 0) {
    return {
      email: guardianEmail,
      recipientType: "guardian",
      greetingName:
        data.guardianName || "Parent/Guardian of " + (data.studentName || data.fullName || "the learner"),
      cc: learnerEmail && learnerEmail.toLowerCase() !== guardianEmail.toLowerCase() ? learnerEmail : "",
    };
  }

  return {
    email: learnerEmail,
    recipientType: "learner",
    greetingName: data.studentName || data.fullName || "Learner",
    cc: "",
  };
}

function sendLearnerAcknowledgement(data, referenceId) {
  const recipient = resolveLearnerRecipient(data);

  if (!recipient.email || recipient.email.indexOf("@") < 1) {
    return {
      status: "skipped",
      recipientType: recipient.recipientType,
      error: "No valid learner or guardian email available",
    };
  }

  try {
    const isDemo = isDemoRequest(data);
    const isInquiry = !isDemo && isGeneralInquiry(data);
    const programTitle = data.selectedProgram || data.selected || "Admissions Inquiry";

    const subject = isDemo
      ? "TBOS — Free Demo Request Received (" + referenceId + ")"
      : isInquiry
        ? "TBOS — Inquiry Received (" + referenceId + ")"
        : "TBOS — Application Received (" + referenceId + ")";

    const intro = isDemo
      ? 'Thank you for requesting a Free Demo session for "' + programTitle + '".'
      : isInquiry
        ? 'Thank you for contacting TechBuilt Open School regarding "' + programTitle + '".'
        : 'Thank you for submitting your admissions application for "' + programTitle + '".';

    const nextSteps = isDemo
      ? [
          "1. Your preferred demo availability has been recorded.",
          "2. The final demo date and time is not confirmed yet.",
          "3. Admissions will contact you by WhatsApp or email to confirm the session details.",
          "4. The Free Demo is one trial session; ongoing programs remain paid where applicable.",
        ]
      : [
          "1. Admissions will review your request and learning requirements.",
          "2. We may contact you by WhatsApp or email with course, schedule, prerequisite, or fee details.",
          "3. Submitting this request does not guarantee admission or immediate enrollment.",
        ];

    const bodyLines = [
      "Dear " + recipient.greetingName + ",",
      "",
      intro,
      "",
      "Official Reference ID: " + referenceId,
      "",
      "What happens next:",
    ]
      .concat(nextSteps)
      .concat([
        "",
        "For quick assistance, contact TBOS Admissions on WhatsApp: +92 329 5448590",
        "https://wa.me/923295448590",
        "",
        "Warm regards,",
        "Admissions Team",
        "TechBuilt Open School",
      ]);

    const mailOptions = {
      to: recipient.email,
      subject: subject,
      body: bodyLines.join("\n"),
    };

    if (recipient.cc) mailOptions.cc = recipient.cc;

    MailApp.sendEmail(mailOptions);

    return {
      status: "success",
      recipientType: recipient.recipientType,
      error: null,
    };
  } catch (err) {
    return {
      status: "failed",
      recipientType: recipient.recipientType,
      error: String(err).slice(0, 200),
    };
  }
}

function deliverNotifications(data, referenceId, rowIndex, previousState) {
  const prior = previousState || {};

  const adminResult =
    prior.adminEmailStatus === "success"
      ? { status: "success", recipientType: "admin", error: null }
      : sendAdminNotification(data, referenceId, rowIndex);

  const learnerResult =
    prior.learnerEmailStatus === "success"
      ? {
          status: "success",
          recipientType: prior.learnerRecipientType || "learner",
          error: null,
        }
      : sendLearnerAcknowledgement(data, referenceId);

  writeDeliveryState(referenceId, {
    adminEmailStatus: adminResult.status,
    learnerEmailStatus: learnerResult.status,
    learnerRecipientType: learnerResult.recipientType,
    rowIndex: rowIndex,
  });

  return {
    adminEmail: adminResult,
    learnerEmail: learnerResult,
  };
}

function doGet() {
  return createJsonResponse({
    ok: true,
    version: "2.1.0",
    service: "TBOS Admissions Webhook v2.1",
    timestamp: new Date().toISOString(),
    status: "active",
  });
}

function doPost(e) {
  try {
    if (!e) {
      return createJsonResponse({ ok: false, error: "Empty request event" });
    }

    let rawContents = "";
    if (e.postData && e.postData.contents) {
      rawContents = e.postData.contents;
    } else if (e.postContents) {
      rawContents = e.postContents;
    }

    if (!rawContents) {
      return createJsonResponse({ ok: false, error: "No post data payload provided" });
    }

    const data = JSON.parse(rawContents);
    const referenceId = String(
      data.referenceId ||
        data.ref ||
        "TBOS-EXT-" + new Date().getTime().toString(36).toUpperCase(),
    ).trim();

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let lastRow = sheet.getLastRow();
    let lastCol = sheet.getLastColumn();
    let currentHeaders = [];

    if (lastRow === 0 || lastCol === 0) {
      sheet.appendRow(CANONICAL_HEADERS);
      sheet
        .getRange(1, 1, 1, CANONICAL_HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#0b192c")
        .setFontColor("#ffffff");
      currentHeaders = CANONICAL_HEADERS.slice();
      lastRow = sheet.getLastRow();
      lastCol = CANONICAL_HEADERS.length;
    } else {
      currentHeaders = sheet
        .getRange(1, 1, 1, lastCol)
        .getValues()[0]
        .map(function (h) {
          return String(h || "").trim();
        });
    }

    let refColIndex = findHeaderColumnIndex(currentHeaders, [
      "referenceId",
      "reference_id",
      "reference id",
      "ref",
      "refId",
    ]);

    if (refColIndex === -1) {
      const newRefCol = currentHeaders.length + 1;
      sheet.getRange(1, newRefCol).setValue("referenceId").setFontWeight("bold");
      currentHeaders.push("referenceId");
      refColIndex = newRefCol;
      lastCol = currentHeaders.length;
    }

    let existingRowIndex = null;
    if (lastRow > 1) {
      const refColValues = sheet.getRange(2, refColIndex, lastRow - 1, 1).getValues();
      for (let i = 0; i < refColValues.length; i++) {
        const existingRef = String(refColValues[i][0] || "").trim();
        if (existingRef && existingRef.toUpperCase() === referenceId.toUpperCase()) {
          existingRowIndex = i + 2;
          break;
        }
      }
    }

    if (existingRowIndex) {
      const previousState = readDeliveryState(referenceId);

      if (!previousState) {
        // Legacy rows predate v2.1 delivery state. Preserve idempotency rather
        // than risk duplicate email notifications.
        return createJsonResponse({
          ok: true,
          duplicate: true,
          referenceId: referenceId,
          sheet: {
            status: "success",
            rowIndex: existingRowIndex,
            refColumn: refColIndex,
          },
          adminEmail: {
            status: "skipped",
            note: "Legacy duplicate retained without resending notification",
          },
          learnerEmail: {
            status: "skipped",
            recipientType: "learner",
            note: "Legacy duplicate retained without resending acknowledgement",
          },
        });
      }

      const retryDelivery = deliverNotifications(
        data,
        referenceId,
        existingRowIndex,
        previousState,
      );

      return createJsonResponse({
        ok: true,
        duplicate: true,
        referenceId: referenceId,
        sheet: {
          status: "success",
          rowIndex: existingRowIndex,
          refColumn: refColIndex,
        },
        adminEmail: retryDelivery.adminEmail,
        learnerEmail: retryDelivery.learnerEmail,
      });
    }

    const rowValues = currentHeaders.map(function (colName) {
      return extractValueForHeader(colName, data, referenceId);
    });

    sheet.appendRow(rowValues);
    const newRowIndex = sheet.getLastRow();

    const delivery = deliverNotifications(data, referenceId, newRowIndex, null);

    return createJsonResponse({
      ok: true,
      duplicate: false,
      referenceId: referenceId,
      sheet: {
        status: "success",
        rowIndex: newRowIndex,
        refColumn: refColIndex,
      },
      adminEmail: delivery.adminEmail,
      learnerEmail: delivery.learnerEmail,
    });
  } catch (err) {
    return createJsonResponse({
      ok: false,
      error: String(err).slice(0, 200),
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
