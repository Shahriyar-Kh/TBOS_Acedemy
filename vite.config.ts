// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Public catalogue and SEO pages are deterministic. Generate them at build time so
    // Cloudflare serves HTML as static assets instead of spending Worker CPU on every
    // crawler/user request. Keep authenticated, API, and query-driven form routes on SSR.
    prerender: {
      enabled: true,
      // Canonical URLs do not use trailing slashes. Emit /route.html so Cloudflare
      // serves /route directly instead of redirecting through /route/index.html.
      autoSubfolderIndex: false,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      concurrency: 4,
      retryCount: 2,
      retryDelay: 1_000,
      failOnError: true,
      filter: ({ path }: { path: string }) => {
        const pathname = path.split(/[?#]/, 1)[0];
        return (
          !pathname.startsWith("/admin") &&
          !pathname.startsWith("/api") &&
          pathname !== "/apply" &&
          pathname !== "/contact" &&
          pathname !== "/free-demo"
        );
      },
    },
  },
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      // @ts-expect-error Nitro Cloudflare wrangler configuration
      wrangler: {
        name: "techbuilt-os",
        account_id: "663a3a9235c68ebb150f268ba6389b7f",
        compatibility_date: "2026-09-30",
        workers_dev: true,
        routes: [
          {
            pattern: "techbuiltos.online",
            custom_domain: true,
          },
        ],
      },
    },
  },
});
