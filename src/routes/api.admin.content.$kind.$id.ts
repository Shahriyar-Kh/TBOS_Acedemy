import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRequest } from "@/lib/adminAuth.server";
import {
  type CmsContentKind,
  cmsCoursePatchSchema,
  cmsSpecializationPatchSchema,
  cmsLiveOfferPatchSchema,
  cmsTutoringPatchSchema,
} from "@/lib/cms";
import {
  getAdminCmsItem,
  updateAdminCmsItem,
  deleteAdminCmsItem,
} from "@/lib/cms.server";

const VALID_KINDS: CmsContentKind[] = [
  "courses",
  "specializations",
  "live-offers",
  "tutoring",
];

function isValidKind(kind: string): kind is CmsContentKind {
  return VALID_KINDS.includes(kind as CmsContentKind);
}

export const Route = createFileRoute("/api/admin/content/$kind/$id")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string; id: string };
      }) => {
        const auth = await verifyAdminRequest(request);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { kind, id } = params;
        if (!isValidKind(kind)) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Invalid content kind: "${kind}". Must be one of: ${VALID_KINDS.join(", ")}`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const item = await getAdminCmsItem(kind, id);
          if (!item) {
            return new Response(
              JSON.stringify({ ok: false, error: "Content item not found" }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(JSON.stringify({ ok: true, item }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Fetch failed";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

      PATCH: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string; id: string };
      }) => {
        // Enforce owner/admin role (admissions receives 403)
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { kind, id } = params;
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
            parseResult = cmsCoursePatchSchema.safeParse(rawBody);
            break;
          case "specializations":
            parseResult = cmsSpecializationPatchSchema.safeParse(rawBody);
            break;
          case "live-offers":
            parseResult = cmsLiveOfferPatchSchema.safeParse(rawBody);
            break;
          case "tutoring":
            parseResult = cmsTutoringPatchSchema.safeParse(rawBody);
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
          const updated = await updateAdminCmsItem(
            kind,
            id,
            parseResult.data as Record<string, unknown>,
          );
          return new Response(JSON.stringify({ ok: true, item: updated }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Update failed";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

      DELETE: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string; id: string };
      }) => {
        // Enforce owner/admin role (admissions receives 403)
        const auth = await verifyAdminRequest(request, ["owner", "admin"]);
        if (!auth.ok) {
          return new Response(JSON.stringify({ ok: false, error: auth.error }), {
            status: auth.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { kind, id } = params;
        if (!isValidKind(kind)) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Invalid content kind: "${kind}". Must be one of: ${VALID_KINDS.join(", ")}`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          await deleteAdminCmsItem(kind, id);
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Delete failed";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
