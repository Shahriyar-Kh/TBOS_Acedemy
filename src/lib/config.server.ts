import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers / Node runtimes, env binds per request or at runtime.
// Module-scope reads resolve to undefined if evaluated early — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a server handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  const smtpPortRaw = process.env.SMTP_PORT?.trim();
  const smtpPort = smtpPortRaw ? parseInt(smtpPortRaw, 10) : 465;
  const smtpSecureRaw = process.env.SMTP_SECURE?.trim();
  const smtpSecure = smtpSecureRaw !== undefined ? smtpSecureRaw === "true" : true;

  return {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,

    // Post-submission secondary integrations (Phase 7)
    googleScriptUrl: process.env.GOOGLE_SCRIPT_URL?.trim(),
    smtpHost: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    smtpPort: isNaN(smtpPort) ? 465 : smtpPort,
    smtpSecure,
    smtpUser: process.env.SMTP_USER?.trim(),
    smtpAppPassword: process.env.SMTP_APP_PASSWORD?.trim(),
    admissionsNotificationEmail: process.env.ADMISSIONS_NOTIFICATION_EMAIL?.trim(),
  };
}
