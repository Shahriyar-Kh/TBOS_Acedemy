# TBOS Admin Admissions CRM Setup & User Bootstrap

This document details how to configure administrator accounts, client authentication, and operational security for the TechBuilt Open School Admissions CRM.

---

## 1. Architecture Overview

The TBOS Admin CRM consists of:
- **Client Auth**: Supabase Auth (email/password) using public browser credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- **Server Authorization**: Server endpoint checks (`/api/admin/*`) validating that the authenticated user UUID exists in `public.admin_users`, has `is_active = true`, and has an authorized role (`owner`, `admin`, `admissions`).
- **No Public Signup**: Admin accounts cannot be created by visitors or self-registration. Accounts are provisioned through the Supabase Dashboard.
- **Row Level Security (RLS)**: Public anonymous browser visitors cannot read or modify `admissions_requests`, `admin_users`, or `admissions_activity`. All administrative mutations pass through server endpoints using the elevated Secret key after token verification.

---

## 2. Environment Configuration

In your deployment environment or local `.env.local`, configure the following variables:

```bash
# ==============================================================================
# 1. SERVER-ONLY (Keep private — Never prefix with VITE_ or bundle into client)
# ==============================================================================
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_your_server_secret_key"

# ==============================================================================
# 2. CLIENT AUTH (Public browser-safe keys)
# ==============================================================================
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_publishable_key"
```

> [!CAUTION]
> Never prefix `SUPABASE_SECRET_KEY` with `VITE_`. Only public keys (`sb_publishable_...` or legacy `anon` key) are safe for the client bundle.

---

## 3. Initial Admin User Bootstrap Workflow

Follow these steps to create your initial administrator / owner account:

### Step 1: Create Supabase Auth User
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. In the sidebar, navigate to **Authentication** → **Users**.
4. Click **Add User** → **Create User**.
5. Enter the administrator's email and a secure password (minimum 8 characters).
6. Click **Create User**.
7. Copy the newly created user's **User UID** (a UUID like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Step 2: Grant Administrator Privileges
1. In the sidebar, navigate to **SQL Editor** → **New Query**.
2. Run the following SQL query, replacing `<AUTH-USER-UUID>` and `<OWNER-EMAIL>` with the values from Step 1:

```sql
insert into public.admin_users (
  id,
  email,
  role,
  is_active
)
values (
  '<AUTH-USER-UUID>',
  '<OWNER-EMAIL>',
  'owner',
  true
)
on conflict (id) do update set
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();
```

Allowed roles:
- `owner`: Full administrative privileges, user management, and admissions oversight.
- `admin`: Full admissions and demo scheduling management.
- `admissions`: Admissions counseling, notes, follow-up, and demo scheduling.

### Step 3: Log In to the Admin Portal
1. Navigate to:
   ```
   http://localhost:8080/admin/login
   ```
2. Enter the administrator's email and password.
3. Upon successful verification, you will be redirected to the Admissions Dashboard at `/admin/admissions`.

---

## 4. Admin CRM Features & Capabilities

- **Admissions Dashboard (`/admin/admissions`)**:
  - Live statistics ribbon (New Requests, Demo Requests, Scheduled Demos, Enrolled, Follow-ups Due).
  - Search by student name, email, phone, or program title.
  - Multi-status filter (`new`, `contacted`, `qualified`, `demo_requested`, `demo_scheduled`, `demo_completed`, `enrolled`, `closed`).
  - Slide-over detail drawer displaying full application details, contact actions (WhatsApp 1-click chat, Email), and private admin notes.
  - Next follow-up scheduling with status alerts (`Due Soon`, `Overdue`, `Upcoming`).
- **Free Demo Pipeline (`/admin/demos`)**:
  - Dedicated scheduling panel for 1-on-1 trial classes.
  - Schedule meeting date & time and attach Google Meet / Zoom links.
  - Mark completed trials.
- **Activity Audit Trail (`public.admissions_activity`)**:
  - Automatically records timestamped audit trails of all status transitions, follow-up dates, demo schedules, and note updates.
