# Google Sheets + Gmail Integration

Application and contact forms submit to a **Google Apps Script Web App**, which:

1. Appends each submission as a row in a Google Sheet (with timestamp, form type, source page)
2. Sends a formatted Gmail notification to your academy inbox

## 1. Create the Google Sheet

Create a sheet (e.g. "TechBuilt Leads"). The script writes the header row automatically.

## 2. Add the Apps Script

In the sheet: **Extensions → Apps Script**, paste the code below, set `NOTIFY_EMAIL`, then
**Deploy → New deployment → Web app** → Execute as **Me**, Access **Anyone** → copy the URL.

```javascript
const NOTIFY_EMAIL = "admissions@techbuiltopenschool.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postContents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    const headers = [
      "submittedAt","formType","sourcePage","fullName","guardianName","email","whatsapp",
      "country","city","grade","courseType","selected","goal","preferredTime","classType","message"
    ];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    sheet.appendRow(headers.map(function (h) { return data[h] || ""; }));

    const body = headers.map(function (h) { return h + ": " + (data[h] || "-"); }).join("\n");
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "New " + (data.formType || "form") + " submission — " + (data.fullName || "Lead"),
      body: "A new submission was received:\n\n" + body
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Connect it to the site

Add an environment variable (Vercel/Netlify or `.env`):

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

Also update real contact details in `src/data/site.ts` (email, WhatsApp number, phone, socials).

That's it — submissions now flow into Google Sheets with Gmail notifications.
