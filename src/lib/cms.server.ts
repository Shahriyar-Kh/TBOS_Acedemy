import { getSupabaseServerClient } from "./supabase.server";
import { courses, getCourse, type Course } from "@/data/courses";
import { specializations, getSpecialization, type Specialization } from "@/data/specializations";
import { liveOffers, getLiveOffer, type LiveOffer } from "@/data/liveOffers";
import { tutoringSubjects, getTutoringBySlug, type TutoringSubject } from "@/data/tutoring";
import {
  type CmsContentKind,
  type CmsCourseRecord,
  type CmsSpecializationRecord,
  type CmsLiveOfferRecord,
  type CmsTutoringRecord,
  mapCmsCourseToCourse,
  mapCmsSpecializationToSpec,
  mapCmsLiveOfferToOffer,
  mapCmsTutoringToSubject,
} from "./cms";

function getTableName(kind: CmsContentKind): string {
  switch (kind) {
    case "courses":
      return "cms_courses";
    case "specializations":
      return "cms_specializations";
    case "live-offers":
      return "cms_live_offers";
    case "tutoring":
      return "cms_tutoring";
    default:
      throw new Error(`Invalid CMS content kind: ${kind}`);
  }
}

// ==========================================
// 1. PUBLIC CMS CONTENT ACCESS WITH SAFE FALLBACK
// ==========================================

export async function getCmsCourses(): Promise<Course[]> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return courses;

    const { data, error } = await client
      .from("cms_courses")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return courses;
    }

    return (data as CmsCourseRecord[]).map(mapCmsCourseToCourse);
  } catch (err) {
    console.warn("getCmsCourses failed, falling back to static approved catalog:", err);
    return courses;
  }
}

export async function getCmsCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return getCourse(slug) || null;

    const { data, error } = await client
      .from("cms_courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`getCmsCourseBySlug(${slug}) db error, falling back to static catalog:`, error);
      return getCourse(slug) || null;
    }

    if (!data) {
      return getCourse(slug) || null;
    }

    if (!data.published) {
      return null;
    }

    return mapCmsCourseToCourse(data as CmsCourseRecord);
  } catch (err) {
    console.warn(`getCmsCourseBySlug(${slug}) failed, falling back to static catalog:`, err);
    return getCourse(slug) || null;
  }
}

export async function getCmsSpecializations(): Promise<Specialization[]> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return specializations;

    const { data, error } = await client
      .from("cms_specializations")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return specializations;
    }

    return (data as CmsSpecializationRecord[]).map(mapCmsSpecializationToSpec);
  } catch (err) {
    console.warn("getCmsSpecializations failed, falling back to static catalog:", err);
    return specializations;
  }
}

export async function getCmsSpecializationBySlug(slug: string): Promise<Specialization | null> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return getSpecialization(slug) || null;

    const { data, error } = await client
      .from("cms_specializations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`getCmsSpecializationBySlug(${slug}) db error, falling back to static catalog:`, error);
      return getSpecialization(slug) || null;
    }

    if (!data) {
      return getSpecialization(slug) || null;
    }

    if (!data.published) {
      return null;
    }

    return mapCmsSpecializationToSpec(data as CmsSpecializationRecord);
  } catch (err) {
    console.warn(`getCmsSpecializationBySlug(${slug}) failed, falling back to static catalog:`, err);
    return getSpecialization(slug) || null;
  }
}

export async function getCmsLiveOffers(): Promise<LiveOffer[]> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return liveOffers;

    const { data, error } = await client
      .from("cms_live_offers")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return liveOffers;
    }

    return (data as CmsLiveOfferRecord[]).map(mapCmsLiveOfferToOffer);
  } catch (err) {
    console.warn("getCmsLiveOffers failed, falling back to static catalog:", err);
    return liveOffers;
  }
}

export async function getCmsLiveOfferBySlug(slug: string): Promise<LiveOffer | null> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return getLiveOffer(slug) || null;

    const { data, error } = await client
      .from("cms_live_offers")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`getCmsLiveOfferBySlug(${slug}) db error, falling back to static catalog:`, error);
      return getLiveOffer(slug) || null;
    }

    if (!data) {
      return getLiveOffer(slug) || null;
    }

    if (!data.published) {
      return null;
    }

    return mapCmsLiveOfferToOffer(data as CmsLiveOfferRecord);
  } catch (err) {
    console.warn(`getCmsLiveOfferBySlug(${slug}) failed, falling back to static catalog:`, err);
    return getLiveOffer(slug) || null;
  }
}

export async function getCmsTutoring(): Promise<TutoringSubject[]> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return tutoringSubjects;

    const { data, error } = await client
      .from("cms_tutoring")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return tutoringSubjects;
    }

    return (data as CmsTutoringRecord[]).map(mapCmsTutoringToSubject);
  } catch (err) {
    console.warn("getCmsTutoring failed, falling back to static catalog:", err);
    return tutoringSubjects;
  }
}

export async function getCmsTutoringBySlug(slug: string): Promise<TutoringSubject | null> {
  try {
    const { client } = getSupabaseServerClient();
    if (!client) return getTutoringBySlug(slug) || null;

    const { data, error } = await client
      .from("cms_tutoring")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`getCmsTutoringBySlug(${slug}) db error, falling back to static catalog:`, error);
      return getTutoringBySlug(slug) || null;
    }

    if (!data) {
      return getTutoringBySlug(slug) || null;
    }

    if (!data.published) {
      return null;
    }

    return mapCmsTutoringToSubject(data as CmsTutoringRecord);
  } catch (err) {
    console.warn(`getCmsTutoringBySlug(${slug}) failed, falling back to static catalog:`, err);
    return getTutoringBySlug(slug) || null;
  }
}

// ==========================================
// 2. ADMIN CMS MANAGEMENT (OWNER & ADMIN ROLES)
// ==========================================

export interface AdminCmsFilterOptions {
  q?: string;
  published?: string;
  featured?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function listAdminCmsItems(
  kind: CmsContentKind,
  filters: AdminCmsFilterOptions = {},
) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  const table = getTableName(kind);
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client.from(table).select("*", { count: "exact" });

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    query = query.or(`title.ilike.${term},slug.ilike.${term},summary.ilike.${term}`);
  }

  if (filters.published === "true") {
    query = query.eq("published", true);
  } else if (filters.published === "false") {
    query = query.eq("published", false);
  }

  if (filters.featured === "true") {
    query = query.eq("featured", true);
  } else if (filters.featured === "false") {
    query = query.eq("featured", false);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  query = query.order("sort_order", { ascending: true }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(`Failed to list ${kind}: ${error.message}`);

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getAdminCmsItem(kind: CmsContentKind, id: string) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  const table = getTableName(kind);
  const { data, error } = await client.from(table).select("*").eq("id", id).single();
  if (error || !data) return null;
  return data;
}

export async function createAdminCmsItem(
  kind: CmsContentKind,
  payload: Record<string, unknown>,
) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  const table = getTableName(kind);
  const { data, error } = await client
    .from(table)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(`Create failed: ${error.message}`);
  return data;
}

export async function updateAdminCmsItem(
  kind: CmsContentKind,
  id: string,
  payload: Record<string, unknown>,
) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  const table = getTableName(kind);
  const { data, error } = await client
    .from(table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Update failed: ${error.message}`);
  return data;
}

export async function deleteAdminCmsItem(kind: CmsContentKind, id: string) {
  const { client } = getSupabaseServerClient();
  if (!client) throw new Error("Database client unavailable");

  const table = getTableName(kind);
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
  return true;
}
