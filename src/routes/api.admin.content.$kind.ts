import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import {
  type CmsContentKind,
  cmsCourseSchema,
  cmsSpecializationSchema,
  cmsLiveOfferSchema,
  cmsTutoringSchema,
} from "@/lib/cms";
import { listAdminCmsItems, createAdminCmsItem } from "@/lib/cms.server";

const VALID_KINDS: CmsContentKind[] = [
  "courses",
  "specializations",
  "live-offers",
  "tutoring",
];

function isValidKind(kind: string): kind is CmsContentKind {
  return VALID_KINDS.includes(kind as CmsContentKind);
}

export const Route = createFileRoute("/api/admin/content/$kind")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string };
      }) => {
        const auth = await verifyAdminRequest(request);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { kind } = params;
        if (!isValidKind(kind)) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Invalid content kind: "${kind}". Must be one of: ${VALID_KINDS.join(", ")}`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const url = new URL(request.url);
        const q = url.searchParams.get("q")?.trim() || undefined;
        const published = url.searchParams.get("published")?.trim() || undefined;
        const featured = url.searchParams.get("featured")?.trim() || undefined;
        const category = url.searchParams.get("category")?.trim() || undefined;
        const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
        const limit = parseInt(url.searchParams.get("limit") || "50", 10) || 50;

        try {
          const result = await listAdminCmsItems(kind, {
            q,
            published,
            featured,
            category,
            page,
            limit,
          });

          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to load content";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string };
      }) => {
        // Enforce owner/admin role (admissions receives 403)
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { kind } = params;
        if (!isValidKind(kind)) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Invalid content kind: "${kind}". Must be one of: ${VALID_KINDS.join(", ")}`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Validate by content kind
        let parseResult;
        switch (kind) {
          case "courses":
            parseResult = cmsCourseSchema.safeParse(rawBody);
            break;
          case "specializations":
            parseResult = cmsSpecializationSchema.safeParse(rawBody);
            break;
          case "live-offers":
            parseResult = cmsLiveOfferSchema.safeParse(rawBody);
            break;
          case "tutoring":
            parseResult = cmsTutoringSchema.safeParse(rawBody);
            break;
        }

        if (!parseResult.success) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Validation failed",
              issues: parseResult.error.issues,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const created = await createAdminCmsItem(
            kind,
            parseResult.data as Record<string, unknown>,
          );
          return new Response(JSON.stringify({ ok: true, item: created }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Create failed";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
