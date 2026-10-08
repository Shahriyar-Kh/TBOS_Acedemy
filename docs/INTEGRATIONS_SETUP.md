# TechBuilt Open School — Admissions Notifications & Integrations Setup

This document outlines the setup, configuration, and security architecture for admissions email notifications and the secondary Google Sheets server mirror.

---

## 1. Architecture Overview

TechBuilt Open School follows a strict primary-versus-secondary data persistence design:

1. **Primary Source of Truth**:
   - Supabase PostgreSQL (`public.admissions_requests`) is the authoritative database.
   - An admission or free demo inquiry is confirmed if and only if the Supabase record insertion succeeds.
   - The user immediately receives an HTTP 201 response with their public `referenceId` (e.g. `TBOS-A1B2C3D4`).

2. **Secondary Integrations (Best-Effort)**:
   - **Admin Notification Email**: Notifies the academy admissions inbox of new submissions.
   - **Learner / Guardian Acknowledgement Email**: Sends formal receipt confirmation and next steps.
   - **Google Sheets Mirror**: Best-effort server-side mirror via Google Apps Script.
   - **Delivery Logs (`public.admissions_delivery_log`)**: Records execution status (`success`, `failed`, or `skipped`) for every channel per admission.

> [!IMPORTANT]
> Secondary integration failures **NEVER** fail an admission. If SMTP is down or Google Apps Script times out, the admission remains valid in Supabase and the applicant sees a successful submission screen.

---

## 2. Gmail SMTP Setup (Nodemailer)

We use Gmail SMTP over port 465 (SSL/TLS) via Nodemailer.

### Step-by-Step Instructions:

1. **Use or Create a Dedicated Google Account**:
   - e.g. `admissions@techbuiltopenschool.com` or designated academy Gmail account.

2. **Enable 2-Step Verification (2FA)**:
   - Navigate to **Google Account Settings** → **Security**.
   - Under _How you sign in to Google_, enable **2-Step Verification**.

3. **Generate a Google App Password**:
   - In Google Account Settings, search for **App passwords** (or go to: `https://myaccount.google.com/apppasswords`).
   - Enter an App name (e.g., `TBOS Admissions Server`).
   - Click **Create**.
   - Copy the 16-character generated code (e.g., `abcd efgh ijkl mnop`).

> [!CAUTION]
> Never use your primary Google account password in configuration files. Only use a generated 16-character **Google App Password**.

4. **Set Environment Variables in `.env.local`**:

```env
# Gmail SMTP Configuration (Server-Only — Private)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-admissions-email@gmail.com
SMTP_APP_PASSWORD=abcdefghijklmnop
ADMISSIONS_NOTIFICATION_EMAIL=admissions@techbuiltopenschool.com
```

### Environment Variables Reference:

| Variable                        | Default                   | Description                               |
| ------------------------------- | ------------------------- | ----------------------------------------- |
| `SMTP_HOST`                     | `smtp.gmail.com`          | SMTP server host                          |
| `SMTP_PORT`                     | `465`                     | SMTP port (465 for SSL, 587 for TLS)      |
| `SMTP_SECURE`                   | `true`                    | Use SSL/TLS connection directly           |
| `SMTP_USER`                     | _(Required for email)_    | Gmail sender address                      |
| `SMTP_APP_PASSWORD`             | _(Required for email)_    | 16-character Google App Password          |
| `ADMISSIONS_NOTIFICATION_EMAIL` | Falls back to `SMTP_USER` | Recipient address for admin notifications |

---

## 3. Google Apps Script & Sheets Server Mirror (Webhook v2)

Submissions are mirrored to a Google Sheet using Google Apps Script Webhook v2 (`integrations/google-apps-script/TBOS_Admissions_Webhook.gs`).

### Webhook v2 Key Capabilities:

- **`doGet` Health Check**: Allows immediate validation of the deployment via browser or curl.
- **Idempotency via `referenceId`**: Column 1 stores the server-generated `referenceId`. Replays or retries safely check for duplicates without creating duplicate sheet rows or duplicate notification emails.
- **Structured Response Body**: Returns `{ ok: true, duplicate: boolean, referenceId: string, sheet: { status: "success" }, adminEmail: { status: "success" }, learnerEmail: { status: "skipped" } }` so the server can inspect exact channel outcomes.
- **SMTP Fallback Gating**: If Google Apps Script successfully processed the lead and dispatched the admin email, SMTP admin notification is skipped to prevent duplicate emails in the admissions inbox.
- **Transient Retries**: The server automatically retries transient errors (timeouts, network dropouts, 429 rate limits, and 5xx responses) with exponential backoff.

### Setup Instructions:

1. **Create or Open Your Google Sheet**:
   - Open your existing admissions sheet (e.g. "TechBuilt Leads").

2. **Deploy the Webhook v2 Script**:
   - In Google Sheets, open **Extensions** → **Apps Script**.
   - Paste the code from `integrations/google-apps-script/TBOS_Admissions_Webhook.gs`.
   - Optionally set Script Properties: `NOTIFY_EMAIL` = `admissions@techbuiltopenschool.com`.
   - Click **Deploy** → **New deployment**.
   - Select type: **Web app**.
   - Execute as: **Me** (your Google account).
   - Who has access: **Anyone** (allows webhook calls from our server).
   - Copy the Web App URL (ends with `/exec`).

3. **Verify with Health Check**:
   - Visit the URL in your browser. It should return `{ "ok": true, "version": "2.0.0", "status": "active" }`.

4. **Configure the Server-Only Environment Variable**:

```env
# Secondary Google Sheet Mirror (Server-Only — Private)
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

> [!NOTE]
> `GOOGLE_SCRIPT_URL` is private and executed strictly server-side. The client-side variable `VITE_GOOGLE_SCRIPT_URL` has been deprecated and disabled to prevent duplicate writes and protect the script URL.

---

## 4. Delivery Logs & Database Security

Secondary integration outcomes are tracked in `public.admissions_delivery_log`.

### Database Schema:

```sql
create table public.admissions_delivery_log (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions_requests(id) on delete cascade,
  channel text not null check (channel in ('admin_email', 'learner_email', 'google_sheet')),
  recipient_type text check (recipient_type is null or recipient_type in ('admin', 'learner', 'guardian', 'google_sheet')),
  status text not null check (status in ('success', 'failed', 'skipped')),
  error_summary text,
  created_at timestamptz not null default now()
);
```

### Security & Row Level Security (RLS):

- **RLS Enabled**: Yes.
- **Anonymous / Public Access**: Explicitly revoked (`NO SELECT`, `NO INSERT`, `NO UPDATE`, `NO DELETE`).
- **Authenticated Regular Users**: No direct access.
- **Elevated `service_role`**: Full management rights used by the server endpoints and Admin CRM API.
- **Cascade Deletion**: When an admission request is deleted, all corresponding delivery logs are automatically deleted via `on delete cascade`.

---

## 5. Admin CRM Integration View

Authorized admins can view the real-time delivery status of all 3 channels in the Admin Admissions CRM detail drawer:

- **Admin Email**: Shows `Sent`, `Failed`, or `Not Configured / Skipped`.
- **Learner / Guardian Email**: Shows `Sent`, `Failed`, or `Not Configured / Skipped`.
- **Google Sheet Mirror**: Shows `Sent`, `Failed`, or `Not Configured / Skipped`.

If an integration fails, a short sanitized error summary is displayed. Sensitive tokens, passwords, and server stack traces are never exposed.

---

## 6. Safe Verification & Testing

1. **Unconfigured State**:
   - If SMTP or Google Script credentials are absent, the application logs `skipped` in `admissions_delivery_log`.
   - The primary Supabase submission succeeds with HTTP 201.
2. **Honeypot Protection**:
   - Submissions with a populated `company` honeypot field return an immediate simulated success (`HTTP 200`, `TBOS-OK`) without creating database rows, sending emails, or triggering Google Sheets mirrors.
