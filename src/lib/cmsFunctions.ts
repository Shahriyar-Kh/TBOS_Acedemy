import { createServerFn } from "@tanstack/react-start";
import {
  getCmsCourses,
  getCmsCourseBySlug,
  getCmsSpecializations,
  getCmsSpecializationBySlug,
  getCmsLiveOffers,
  getCmsLiveOfferBySlug,
  getCmsTutoring,
  getCmsTutoringBySlug,
} from "./cms.server";

export const getCmsCoursesFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getCmsCourses();
});

export const getCmsCourseBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await getCmsCourseBySlug(slug);
  });

export const getCmsSpecializationsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getCmsSpecializations();
});

export const getCmsSpecializationBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await getCmsSpecializationBySlug(slug);
  });

export const getCmsLiveOffersFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getCmsLiveOffers();
});

export const getCmsLiveOfferBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await getCmsLiveOfferBySlug(slug);
  });

export const getCmsTutoringFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getCmsTutoring();
});

export const getCmsTutoringBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await getCmsTutoringBySlug(slug);
  });
