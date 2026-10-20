# Google Calendar & Google Meet Integration Setup Guide

This guide describes how to configure automated Google Calendar event scheduling and Google Meet video conference link generation for the TechBuilt Open School (TBOS) Academy CRM.

---

## 1. Overview & Architecture

TBOS Academy uses **Google Service Account OAuth 2.0 JWT Bearer Assertion (RFC 7523)** to securely interface with the Google Calendar API v3 without requiring user browser sign-ins or recurring manual authorizations.

When a class session or demo is created:
1. The server signs a short-lived RS256 JWT using the Google Service Account private key.
2. The server exchanges the JWT for a Google OAuth2 access token.
3. The server calls the Google Calendar API with `conferenceDataVersion=1`.
4. Google creates the calendar event and automatically provisions a unique Google Meet video room.
5. The Google Meet link (`https://meet.google.com/xxx-yyyy-zzz`) is saved directly into `class_sessions.meeting_link` and attendees receive invitations.

### Graceful Fallback Mode
If Google Calendar credentials are not configured in production, the application **automatically falls back to manual meeting link entry** and marks the calendar status as `pending`. No class creation, demo scheduling, or student operation is blocked.

---

## 2. Google Cloud Platform Setup

### Step 1: Create or Select GCP Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your organization or create a new project: `tbos-academy-prod`.

### Step 2: Enable Google Calendar API
1. Navigate to **APIs & Services** > **Library**.
2. Search for **Google Calendar API**.
3. Click **Enable**.

### Step 3: Create Service Account
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **Service Account**.
3. Fill in details:
   - **Service Account Name**: `tbos-calendar-sync`
   - **Service Account ID**: `tbos-calendar-sync@tbos-academy-prod.iam.gserviceaccount.com`
4. Click **Create and Continue**.
5. Role: Can be left default (Calendar permissions are granted at the calendar level).
6. Click **Done**.

### Step 4: Generate Service Account Key (JSON)
1. In **Credentials**, click on the newly created service account.
2. Go to the **Keys** tab.
3. Click **Add Key** > **Create new key** > Select **JSON** > Click **Create**.
4. Download the JSON key file safely. It contains:
   - `client_email`
   - `private_key`

---

## 3. Share Calendar with Service Account

To allow the Service Account to manage events:
1. Open [Google Calendar](https://calendar.google.com/) under the TBOS Academy administrator/operations Google account.
2. Next to your primary calendar (or dedicated `TBOS Academy Live Classes` calendar), click the three dots > **Settings and sharing**.
3. Scroll to **Share with specific people or groups**.
4. Click **Add people and groups**.
5. Enter the Service Account email address:
   `tbos-calendar-sync@tbos-academy-prod.iam.gserviceaccount.com`
6. Under **Permissions**, select **Make changes to events**.
7. Click **Send**.
8. Under **Integrate calendar**, copy the **Calendar ID** (e.g., `c_xxxxxxxx@group.calendar.google.com` or `primary`).

---

## 4. Configure Environment Variables

Set the following environment variables in your hosting environment (Cloudflare Workers / Pages / Node.js) or local `.env`:

```bash
# Service Account client email from downloaded JSON key
GOOGLE_SERVICE_ACCOUNT_EMAIL="tbos-calendar-sync@tbos-academy-prod.iam.gserviceaccount.com"

# Private key from JSON key (include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
# Note: In Cloudflare Secrets or single-line envs, newlines can be escaped as \n
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Target Google Calendar ID (Defaults to "primary" if omitted)
GOOGLE_CALENDAR_ID="primary"
```

---

## 5. Automated Reminders & Verification

- **10-Minute Instructor & Admin Notification**:
  - The TBOS automated engine dispatches an alert email to the instructor and owner/admin exactly 10 minutes prior to class start.
- **Sync Status**:
  - `class_sessions.google_calendar_sync_status` tracks sync status: `pending`, `synced`, `failed`, or `cancelled`.
  - In the admin Timetable UI, any failed sync displays an alert badge and a **Retry Sync** button.

---

## 6. Troubleshooting

| Symptom | Root Cause | Fix |
|---|---|---|
| `GOOGLE_CREDENTIALS_NOT_CONFIGURED` | Missing `GOOGLE_SERVICE_ACCOUNT_EMAIL` or `GOOGLE_PRIVATE_KEY` | Configure secrets in dashboard or `.env`. Manual meet links work in the meantime. |
| `Google Calendar API error (404)` | Calendar ID not found or not shared | Ensure target calendar is shared with the service account with "Make changes to events" permission. |
| `Google OAuth2 token exchange failed (400)` | Invalid private key format or clock drift | Ensure private key starts with `-----BEGIN PRIVATE KEY-----` and `\n` newlines are preserved. |
