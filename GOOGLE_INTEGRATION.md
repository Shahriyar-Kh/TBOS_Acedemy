# Google Sheets + Gmail Integration (Webhook v2)

TechBuilt Open School implements a resilient **HTTPS-First Webhook v2** architecture for Google Sheets mirroring and backup email delivery.

## Architecture & Guarantees

1. **Supabase is the primary source of truth.** When a student applies, requests a demo, or contacts admissions, their record is first written directly to PostgreSQL (`public.admissions_requests`).
2. **Secondary Mirroring:** After primary persistence, the server initiates an HTTPS-first call to Google Apps Script.
3. **Idempotency & Deduplication:** Webhook v2 locates the `referenceId` column dynamically by header name. If the header is missing, it appends a new `referenceId` column without reordering or deleting legacy columns. If the lead was already mirrored, it safely avoids duplicate row appends and skips duplicate notification emails.
4. **SMTP Fallback Gating:** If Google Apps Script successfully processed the lead and sent the notification email, SMTP admin notification is skipped to avoid duplicate inboxes. If the Webhook fails or is unconfigured, the system automatically falls back to SMTP.
5. **Audit Logging:** Every attempt (success, failed, skipped) is recorded in `public.admissions_delivery_log`.

---

## 1. Create or Open the Google Sheet

1. Create a Google Sheet (e.g., "TBOS Admissions & Leads").
2. The script automatically sets up the header row on first execution:
   `referenceId`, `submittedAt`, `submissionKind`, `applicationType`, `selectedProgram`, `studentName`, `email`, `phone`, `country`, `city`, `age`, `educationLevel`, `institution`, `skillLevel`, `learningGoal`, `learningPreference`, `preferredDays`, `preferredTime`, `timezone`, `guardianName`, `guardianPhone`, `guardianEmail`, `notes`, `sourcePage`, `status`.

---

## 2. Deploy Webhook v2 (`TBOS_Admissions_Webhook.gs`)

1. In your Google Sheet, navigate to **Extensions → Apps Script**.
2. Replace any existing script with the full code from:
   `integrations/google-apps-script/TBOS_Admissions_Webhook.gs`
3. Optionally set Script Properties:
   - Key: `NOTIFY_EMAIL`
   - Value: `admissions@techbuiltopenschool.com` (or your destination inbox)
4. If an existing TBOS Web App deployment already provides the production `/exec` URL, use **Deploy → Manage deployments → Edit**, select **New version**, keep the deployment type as **Web app**, keep **Execute as: Me** and **Who has access: Anyone**, then deploy. This preserves the existing production `/exec` URL used by `GOOGLE_SCRIPT_URL`.
5. Only use **Deploy → New deployment** when there is no existing production Web App deployment. In that case select type **Web app**, description `TBOS Admissions Webhook v2`, **Execute as: Me**, **Who has access: Anyone**, deploy, authorize permissions, and copy the new Web App URL.

---

## 3. Verify Health Check

Open the Web App URL in your browser or run curl:

```bash
curl -L https://script.google.com/macros/s/XXXXX/exec
```

Expected response:

```json
{
  "ok": true,
  "version": "2.0.0",
  "service": "TBOS Admissions Webhook v2",
  "timestamp": "2026-10-08T...",
  "status": "active"
}
```

---

## 4. Configure Environment Variables

Add the Web App URL to your server environment:

```env
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

_(Note: Never expose `GOOGLE_SCRIPT_URL` as a client-side `VITE_` variable. Mirroring is strictly executed server-side with timeout handling and exponential backoff retries.)_
