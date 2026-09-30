import nodemailer from "nodemailer";
import { getServerConfig } from "./config.server";
import type { AdmissionsRequestRecord } from "./supabase.server";

export interface EmailSendResult {
  status: "success" | "failed" | "skipped";
  recipientType?: "admin" | "learner" | "guardian";
  errorSummary?: string | null;
}

/**
 * HTML escape helper to prevent HTML injection in emails.
 */
export function escapeHtml(str?: string | number | null): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const WHATSAPP_DISPLAY = "+92 329 5448590";
const WHATSAPP_LINK = "https://wa.me/923295448590";

function createTransporter() {
  const config = getServerConfig();
  if (!config.smtpUser || !config.smtpAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpAppPassword,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
}

/**
 * Send admin notification email for a new admission or free demo request.
 */
export async function sendAdminNotificationEmail(
  admission: AdmissionsRequestRecord,
  referenceId?: string,
): Promise<EmailSendResult> {
  const config = getServerConfig();
  const toEmail = config.admissionsNotificationEmail || config.smtpUser;

  if (!config.smtpUser || !config.smtpAppPassword || !toEmail) {
    return {
      status: "skipped",
      recipientType: "admin",
      errorSummary: "SMTP or notification email not configured",
    };
  }

  const isDemo = admission.submission_kind === "demo";
  const ref = referenceId || (admission.id ? `TBOS-${admission.id.slice(0, 8).toUpperCase()}` : "TBOS-NEW");
  const programTitle = admission.selected_program_title || "General Admissions Inquiry";

  const subject = isDemo
    ? `TBOS Free Demo Request — ${programTitle}`
    : `TBOS New Application — ${programTitle}`;

  const plainText = [
    `TECHBUILT OPEN SCHOOL — ${isDemo ? "FREE DEMO REQUEST" : "NEW APPLICATION"}`,
    "==================================================",
    `Reference ID: ${ref}`,
    `Student Name: ${admission.student_name}`,
    `Submission Type: ${isDemo ? "Free Demo Request" : "Standard Application"}`,
    `Application Type: ${admission.application_type}`,
    `Selected Program: ${programTitle}`,
    `Email: ${admission.email}`,
    `Phone / WhatsApp: ${admission.phone}`,
    `Location: ${admission.country}${admission.city ? `, ${admission.city}` : ""}`,
    `Age: ${admission.age ?? "Not specified"}`,
    `Education Level: ${admission.education_level}`,
    admission.skill_level ? `Skill Level: ${admission.skill_level}` : null,
    admission.learning_preference ? `Learning Format: ${admission.learning_preference}` : null,
    admission.learning_goal ? `Learning Goal: ${admission.learning_goal}` : null,
    isDemo && admission.preferred_days ? `Preferred Days: ${admission.preferred_days}` : null,
    isDemo && admission.preferred_time ? `Preferred Time: ${admission.preferred_time}` : null,
    isDemo && admission.timezone ? `Timezone: ${admission.timezone}` : null,
    admission.guardian_name ? `Guardian Name: ${admission.guardian_name}` : null,
    admission.guardian_phone ? `Guardian Phone: ${admission.guardian_phone}` : null,
    admission.guardian_email ? `Guardian Email: ${admission.guardian_email}` : null,
    admission.notes ? `Applicant Notes: ${admission.notes}` : null,
    `Source Page: ${admission.source_page || "Direct"}`,
    "==================================================",
    "Review this request in the TBOS Admin CRM.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f8fafc; padding: 24px; margin: 0;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="background-color: #0b192c; padding: 24px 32px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">TECHBUILT OPEN SCHOOL</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">
          ${isDemo ? "New Free Demo Request" : "New Admissions Application"} • Reference: <strong>${escapeHtml(ref)}</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #0f172a;">
          ${escapeHtml(programTitle)}
        </h2>
        <table width="100%" border="0" cellpadding="6" cellspacing="0" style="font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td width="35%" style="color: #64748b; font-weight: 600;">Student Name</td>
            <td style="color: #0f172a; font-weight: 600;">${escapeHtml(admission.student_name)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 600;">Email</td>
            <td><a href="mailto:${escapeHtml(admission.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(admission.email)}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 600;">Phone / WhatsApp</td>
            <td><a href="https://wa.me/${escapeHtml(admission.phone.replace(/[^0-9]/g, ""))}" style="color: #16a34a; text-decoration: none; font-weight: 600;">${escapeHtml(admission.phone)}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 600;">Location</td>
            <td style="color: #334155;">${escapeHtml(admission.country)}${admission.city ? `, ${escapeHtml(admission.city)}` : ""}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 600;">Age & Grade</td>
            <td style="color: #334155;">${admission.age ? `${escapeHtml(admission.age)} yrs • ` : ""}${escapeHtml(admission.education_level)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 600;">Category</td>
            <td style="color: #334155;">${escapeHtml(admission.application_type)}</td>
          </tr>
          ${
            admission.learning_preference
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600;">Format</td>
                  <td style="color: #334155;">${escapeHtml(admission.learning_preference)}</td>
                </tr>`
              : ""
          }
          ${
            admission.learning_goal
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600;">Learning Goal</td>
                  <td style="color: #334155;">${escapeHtml(admission.learning_goal)}</td>
                </tr>`
              : ""
          }
          ${
            isDemo && (admission.preferred_days || admission.preferred_time)
              ? `<tr style="border-bottom: 1px solid #f1f5f9; background: #faf5ff;">
                  <td style="color: #7e22ce; font-weight: 600;">Preferred Schedule</td>
                  <td style="color: #6b21a8; font-weight: 500;">
                    ${escapeHtml(admission.preferred_days || "Any day")} • ${escapeHtml(admission.preferred_time || "Any time")}${admission.timezone ? ` (${escapeHtml(admission.timezone)})` : ""}
                  </td>
                </tr>`
              : ""
          }
          ${
            admission.guardian_name
              ? `<tr style="border-bottom: 1px solid #f1f5f9; background: #fffbeb;">
                  <td style="color: #b45309; font-weight: 600;">Parent / Guardian</td>
                  <td style="color: #92400e;">
                    ${escapeHtml(admission.guardian_name)}
                    ${admission.guardian_phone ? ` • ${escapeHtml(admission.guardian_phone)}` : ""}
                    ${admission.guardian_email ? ` • ${escapeHtml(admission.guardian_email)}` : ""}
                  </td>
                </tr>`
              : ""
          }
          ${
            admission.notes
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600;">Notes</td>
                  <td style="color: #475569; font-style: italic;">"${escapeHtml(admission.notes)}"</td>
                </tr>`
              : ""
          }
        </table>

        <div style="margin-top: 24px; padding: 14px 18px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <strong>Next Action:</strong> Review this request in the TBOS Admin CRM to schedule demo or update admissions status.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { status: "skipped", recipientType: "admin", errorSummary: "Transporter could not be initialized" };
    }

    await transporter.sendMail({
      from: `"TBOS Admissions" <${config.smtpUser}>`,
      to: toEmail,
      subject,
      text: plainText,
      html,
    });

    return { status: "success", recipientType: "admin" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Admin notification email failed (secondary integration):", errorMsg);
    return {
      status: "failed",
      recipientType: "admin",
      errorSummary: errorMsg.slice(0, 200),
    };
  }
}

/**
 * Send acknowledgement email to the learner or guardian.
 */
export async function sendLearnerAcknowledgementEmail(
  admission: AdmissionsRequestRecord,
  referenceId?: string,
): Promise<EmailSendResult> {
  const config = getServerConfig();
  if (!config.smtpUser || !config.smtpAppPassword) {
    return {
      status: "skipped",
      recipientType: "learner",
      errorSummary: "SMTP not configured",
    };
  }

  const isDemo = admission.submission_kind === "demo";
  const ref = referenceId || (admission.id ? `TBOS-${admission.id.slice(0, 8).toUpperCase()}` : "TBOS-NEW");
  const programTitle = admission.selected_program_title || "General Admissions Inquiry";

  // Minor learner check: if minor and guardianEmail exists, prefer sending to guardian
  const isMinor = Boolean(admission.age && admission.age < 18);
  const hasGuardianEmail = Boolean(admission.guardian_email && admission.guardian_email.includes("@"));

  let targetEmail = admission.email;
  let recipientType: "learner" | "guardian" = "learner";
  let greetingName = admission.student_name;
  let ccEmails: string[] | undefined = undefined;

  if (isMinor && hasGuardianEmail) {
    targetEmail = admission.guardian_email!.trim();
    recipientType = "guardian";
    greetingName = admission.guardian_name ? admission.guardian_name : `Parent/Guardian of ${admission.student_name}`;
    // CC student email if distinct and present
    if (admission.email && admission.email.toLowerCase() !== targetEmail.toLowerCase()) {
      ccEmails = [admission.email.trim()];
    }
  }

  const subject = isDemo
    ? "TBOS — Free Demo Request Received"
    : "TBOS — Application Received";

  const plainText = isDemo
    ? [
        `Dear ${greetingName},`,
        "",
        `Thank you for requesting a Free Demo session at TechBuilt Open School for "${programTitle}".`,
        "",
        `Your Reference ID is: ${ref}`,
        "",
        "What happens next:",
        "1. Our admissions team has recorded your preferred demo schedule.",
        "2. Please note that the final demo date and time is NOT yet confirmed.",
        "3. An admissions coordinator will contact you via WhatsApp or email to confirm your exact meeting time and share the video link.",
        "4. The Free Demo is a trial session to assess the student's level and discuss goals. Full enrollment in our academy programs remains paid where applicable.",
        "",
        `If you have questions or wish to connect immediately, message our admissions office on WhatsApp: ${WHATSAPP_DISPLAY}`,
        `Direct WhatsApp link: ${WHATSAPP_LINK}`,
        "",
        "Warm regards,",
        "Admissions Team",
        "TechBuilt Open School",
      ].join("\n")
    : [
        `Dear ${greetingName},`,
        "",
        `Thank you for submitting your admissions application to TechBuilt Open School for "${programTitle}".`,
        "",
        `Your Reference ID is: ${ref}`,
        "",
        "What happens next:",
        "1. Our admissions team will review your application and background details.",
        "2. An admissions advisor will reach out to you via WhatsApp or email regarding course suitability, prerequisites, and cohort schedule.",
        "3. Submission of this form indicates interest and does not constitute guaranteed admission or immediate enrollment.",
        "",
        `For quick questions or immediate assistance, message us on WhatsApp: ${WHATSAPP_DISPLAY}`,
        `Direct WhatsApp link: ${WHATSAPP_LINK}`,
        "",
        "Warm regards,",
        "Admissions Team",
        "TechBuilt Open School",
      ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 24px; margin: 0;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="background-color: #0b192c; padding: 28px 32px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">TECHBUILT OPEN SCHOOL</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">
          International Online Academy • Computer Science, Academic Tutoring & Skill Development
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; margin: 0 0 16px;">Dear <strong>${escapeHtml(greetingName)}</strong>,</p>

        <p style="font-size: 14px; color: #334155; margin: 0 0 20px;">
          ${
            isDemo
              ? `Thank you for requesting a <strong>Free Demo session</strong> for <strong>${escapeHtml(programTitle)}</strong>.`
              : `Thank you for submitting your admissions application for <strong>${escapeHtml(programTitle)}</strong>.`
          }
        </p>

        <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; display: block;">Application Reference ID</span>
          <span style="font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: 1px;">${escapeHtml(ref)}</span>
        </div>

        <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          What Happens Next
        </h3>

        ${
          isDemo
            ? `
        <ul style="font-size: 13px; color: #475569; padding-left: 20px; margin: 0 0 24px; line-height: 1.7;">
          <li><strong>Schedule Review:</strong> Our admissions desk has recorded your preferred demo availability.</li>
          <li><strong>Confirmation Required:</strong> Please note that your final demo date and time is <em>not yet confirmed</em>. An admissions coordinator will contact you to confirm the exact session slot.</li>
          <li><strong>Trial Session Scope:</strong> The Free Demo is a 1-on-1 trial session designed to assess the learner's baseline and answer questions. Full ongoing courses remain paid where applicable.</li>
        </ul>
            `
            : `
        <ul style="font-size: 13px; color: #475569; padding-left: 20px; margin: 0 0 24px; line-height: 1.7;">
          <li><strong>Admissions Review:</strong> Our academic team will review your application details and learning preferences.</li>
          <li><strong>Contact:</strong> An admissions coordinator may reach out to you via WhatsApp or email to provide course details, fee structure, and upcoming cohort dates.</li>
          <li><strong>Application Policy:</strong> Submitting an inquiry or application signifies your interest and does not guarantee immediate admission.</li>
        </ul>
            `
        }

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 13px; color: #166534; font-weight: 500;">
            Need quick answers or want to discuss timing directly?
          </p>
          <a href="${WHATSAPP_LINK}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600;">
            Chat on WhatsApp (${WHATSAPP_DISPLAY})
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; margin: 24px 0 0; border-top: 1px solid #e2e8f0; pt-4; padding-top: 16px;">
          Warm regards,<br>
          <strong>Admissions Office</strong><br>
          TechBuilt Open School
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return {
        status: "skipped",
        recipientType,
        errorSummary: "Transporter could not be initialized",
      };
    }

    await transporter.sendMail({
      from: `"TechBuilt Open School" <${config.smtpUser}>`,
      to: targetEmail,
      cc: ccEmails,
      subject,
      text: plainText,
      html,
    });

    return { status: "success", recipientType };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Learner acknowledgement email failed (secondary integration):", errorMsg);
    return {
      status: "failed",
      recipientType,
      errorSummary: errorMsg.slice(0, 200),
    };
  }
}
