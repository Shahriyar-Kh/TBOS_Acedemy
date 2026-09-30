# Production Runbook — TechBuilt Open School (TBOS)

## 1. Architecture Overview
- **Framework:** TanStack Start (React 19, TypeScript, TanStack Router)
- **Server Engine:** Nitro SSR compiled with `cloudflare-module` preset
- **Deployment Platform:** Cloudflare Workers (`techbuilt-os`)
- **Primary Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Asset Delivery:** Cloudflare Edge Assets Binding (`env.ASSETS`) with global CDN caching and HTTP/3 support
- **Custom Domain:** `https://techbuiltos.online`
- **Fallback / Preview Domain:** `https://techbuilt-os.feelwise.workers.dev`

---

## 2. Environment Variables & Secret Configuration
The Worker utilizes runtime environment variable bindings provided securely via Wrangler:

| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase project REST URL | Public / Runtime Env |
| `SUPABASE_SECRET_KEY` | Elevated Supabase Secret Key (replaces legacy service_role) | Encrypted Secret |
| `VITE_SUPABASE_URL` | Client-accessible Supabase project URL | Public / Client Env |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Supabase anonymous API key | Public / Client Env |

### Optional Secondary Integrations (Phase 7)
- `GOOGLE_SCRIPT_URL` — Secondary Google Sheets webhook mirror (best-effort)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD` — Direct SMTP email notifications
- `ADMISSIONS_NOTIFICATION_EMAIL` — Administrative email recipient

*Note: If optional integrations are omitted, submission flows remain 100% successful as Supabase PostgreSQL is the primary authoritative source of truth.*

---

## 3. Production Deployment Procedure

### A. Prerequisites
1. Node.js (v20+ or v22+)
2. Bun (for package management and scripting)
3. Cloudflare Wrangler CLI authenticated (`npx wrangler whoami`)

### B. Build Command
Compile the client application and bundle the SSR Worker via Nitro:
```powershell
node .\node_modules\vite\bin\vite.js build
```
This generates:
- `.output/public`: Client assets, bundles, `_headers`, and `robots.txt`
- `.output/server`: Worker script `index.mjs` and deployment manifest `wrangler.json`

### C. Deployment Command
Deploy to Cloudflare Workers with production secrets:
```powershell
npx wrangler deploy --config .output/server/wrangler.json --secrets-file .env.local
```

---

## 4. Operational Troubleshooting

### Network Timeouts on Windows (`UND_ERR_CONNECT_TIMEOUT`)
- **Issue:** On some Windows network environments with incomplete IPv6 routing, Node/Undici attempts IPv6 connection to `api.cloudflare.com` and times out after 10,000ms.
- **Resolution:** Set `--dns-result-order=ipv4first` in Node options or patch Undici `setupConnectTimeout` to allow up to 120 seconds for high-latency handshakes.

### Compatibility Date Validation (`Code 10021`)
- **Issue:** When building across time zones, local clock might be ahead of Cloudflare UTC date.
- **Resolution:** Set explicit UTC `compatibility_date: "2026-09-30"` in `vite.config.ts`.

---

## 5. Rollback Procedures
To roll back to a prior deployment:
```powershell
npx wrangler deployments list --name techbuilt-os
npx wrangler rollback <version-id> --name techbuilt-os
```
