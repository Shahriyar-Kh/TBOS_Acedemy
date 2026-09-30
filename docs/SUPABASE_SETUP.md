# Supabase Admissions Persistence Setup

This document details the configuration and operational setup for Supabase PostgreSQL persistence at TechBuilt Open School (`TBOS_Acedemy`).

---

## 1. Architecture Overview

- **Primary Source of Truth**: Supabase PostgreSQL table `public.admissions_requests`.
- **Server Endpoint**: `POST /api/admissions` validates input, verifies minor/guardian constraints, resolves program metadata, and inserts via a server-only Supabase client with the service-role key.
- **Secondary Mirror**: Google Apps Script / Google Sheets (`VITE_GOOGLE_SCRIPT_URL`) runs as an asynchronous, best-effort backup. If the backup fails, user admissions success is never blocked or reverted.
- **Security & RLS**: Row Level Security (RLS) is enabled with all public permissions revoked. Anonymous browser visitors cannot read, list, update, or delete admissions records.

---

## 2. Required Environment Variables

Configure these variables in your deployment environment or local `.env.local` (never commit real keys to Git):

```bash
# Supabase Project Settings -> API
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# Secondary Mirror (Optional)
VITE_GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/your-deployment-id/exec"
```

> [!CAUTION]
> Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`. It must remain strictly server-side.

---

## 3. Database Migration

The schema definition is located at:
[`supabase/migrations/20260930000001_create_admissions_requests.sql`](file:///D:/Client_Projects/TBOS_Acedemy/supabase/migrations/20260930000001_create_admissions_requests.sql)

### Applying via Supabase SQL Editor:
1. Open the Supabase Dashboard for your project.
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of `supabase/migrations/20260930000001_create_admissions_requests.sql`.
4. Click **Run**.

### Applying via Supabase CLI:
```bash
supabase db push
# or
supabase migration up
```

---

## 4. Verification Steps

### A. Verify Table and RLS
In the Supabase Dashboard, navigate to **Database** -> **Tables** -> `admissions_requests`:
- Confirm RLS is marked **Enabled**.
- Confirm no policies allow public `anon` access to `SELECT`, `UPDATE`, or `DELETE`.

### B. Verify Anonymous Access is Blocked
You can verify that anonymous clients cannot read records by running this in the browser console or cURL with your public `anon` key:
```bash
curl -X GET 'https://your-project-id.supabase.co/rest/v1/admissions_requests' \
  -H "apikey: your-public-anon-key" \
  -H "Authorization: Bearer your-public-anon-key"
```
*Expected response*: Empty array `[]` or 401/403 Unauthorized.

### C. Test Submission
1. Submit an application on `/apply` or a trial demo on `/free-demo`.
2. Check the response in the Network tab: HTTP 201 Created with `{ "ok": true, "referenceId": "TBOS-XXXXXXXX" }`.
3. Check **Table Editor** -> `admissions_requests` in Supabase:
   - Row exists with the student's name, email, and selected program.
   - `submission_kind` is `"application"` or `"demo"`.
   - `status` is `"new"` or `"demo_requested"`.
   - `created_at` timestamp is populated.

---

## 5. CRM Status Pipeline

The `status` field supports the following stages for admissions management (Phase 6 Admin CRM):
- `new` — Newly submitted course/tutoring application.
- `contacted` — Admissions team has reached out via WhatsApp/email.
- `qualified` — Student prerequisites and scheduling preferences confirmed.
- `demo_requested` — Free demo trial session requested.
- `demo_scheduled` — Demo meeting link and date finalized with tutor.
- `demo_completed` — Demo session conducted.
- `enrolled` — Student enrolled in paid cohort or 1-on-1 tutoring.
- `closed` — Inquiry resolved or archived.
