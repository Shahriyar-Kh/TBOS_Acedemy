import { createFileRoute } from "@tanstack/react-router";
import {
  type CmsContentKind,
} from "@/lib/cms";
import {
  getCmsCourses,
  getCmsCourseBySlug,
  getCmsSpecializations,
  getCmsSpecializationBySlug,
  getCmsLiveOffers,
  getCmsLiveOfferBySlug,
  getCmsTutoring,
  getCmsTutoringBySlug,
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

export const Route = createFileRoute("/api/content/$kind")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { kind: string };
      }) => {
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
        const slug = url.searchParams.get("slug")?.trim();

        try {
          if (kind === "courses") {
            if (slug) {
              const item = await getCmsCourseBySlug(slug);
              if (!item) {
                return new Response(
                  JSON.stringify({ ok: false, error: "Course not found" }),
                  { status: 404, headers: { "Content-Type": "application/json" } },
                );
              }
              return new Response(JSON.stringify({ ok: true, data: item }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }
            const data = await getCmsCourses();
            return new Response(JSON.stringify({ ok: true, data }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (kind === "specializations") {
            if (slug) {
              const item = await getCmsSpecializationBySlug(slug);
              if (!item) {
                return new Response(
                  JSON.stringify({ ok: false, error: "Specialization not found" }),
                  { status: 404, headers: { "Content-Type": "application/json" } },
                );
              }
              return new Response(JSON.stringify({ ok: true, data: item }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }
            const data = await getCmsSpecializations();
            return new Response(JSON.stringify({ ok: true, data }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (kind === "live-offers") {
            if (slug) {
              const item = await getCmsLiveOfferBySlug(slug);
              if (!item) {
                return new Response(
                  JSON.stringify({ ok: false, error: "Live offer not found" }),
                  { status: 404, headers: { "Content-Type": "application/json" } },
                );
              }
              return new Response(JSON.stringify({ ok: true, data: item }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }
            const data = await getCmsLiveOffers();
            return new Response(JSON.stringify({ ok: true, data }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (kind === "tutoring") {
            if (slug) {
              const item = await getCmsTutoringBySlug(slug);
              if (!item) {
                return new Response(
                  JSON.stringify({ ok: false, error: "Tutoring subject not found" }),
                  { status: 404, headers: { "Content-Type": "application/json" } },
                );
              }
              return new Response(JSON.stringify({ ok: true, data: item }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }
            const data = await getCmsTutoring();
            return new Response(JSON.stringify({ ok: true, data }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(
            JSON.stringify({ ok: false, error: "Unsupported kind" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Internal error";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
