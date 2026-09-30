import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerConfig } from "./config.server";

export interface AdmissionsRequestRecord {
  id?: string;
  submission_kind: "application" | "demo";
  application_type: string;
  selected_program_slug?: string | null;
  selected_program_title: string;
  selected_program_category?: string | null;

  student_name: string;
  email: string;
  phone: string;
  country: string;
  city?: string | null;
  age?: string | null;
  education_level: string;
  institution?: string | null;
  skill_level?: string | null;

  learning_goal?: string | null;
  learning_preference?: string | null;

  preferred_days?: string | null;
  preferred_time?: string | null;
  timezone?: string | null;

  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;

  notes?: string | null;
  source_page?: string | null;

  status?: string;
  created_at?: string;
  updated_at?: string;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client using privileged SUPABASE_SERVICE_ROLE_KEY.
 * Evaluates credentials at request time so build-time execution does not crash.
 */
export function getSupabaseServerClient(): {
  client: SupabaseClient | null;
  configured: boolean;
} {
  const config = getServerConfig();
  const url = config.supabaseUrl?.trim();
  const key = config.supabaseServiceRoleKey?.trim();

  if (!url || !key) {
    return { client: null, configured: false };
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return { client: cachedClient, configured: true };
}
