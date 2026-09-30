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
  age?: number | null;
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

  // Internal CRM Fields (Phase 6)
  admin_notes?: string | null;
  next_follow_up_at?: string | null;
  demo_scheduled_at?: string | null;
  demo_meeting_link?: string | null;
  last_contacted_at?: string | null;
  closed_reason?: string | null;

  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  role: "owner" | "admin" | "admissions";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdmissionsActivityRecord {
  id: string;
  admission_id: string;
  admin_user_id?: string | null;
  action_type:
    | "status_changed"
    | "note_updated"
    | "demo_scheduled"
    | "follow_up_set"
    | "contacted"
    | "closed_reason_updated";
  old_status?: string | null;
  new_status?: string | null;
  note?: string | null;
  created_at: string;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client using elevated SUPABASE_SECRET_KEY.
 * Evaluates credentials at request time so build-time execution does not crash.
 */
export function getSupabaseServerClient(): {
  client: SupabaseClient | null;
  configured: boolean;
} {
  const config = getServerConfig();
  const url = config.supabaseUrl?.trim();
  const key = config.supabaseSecretKey?.trim();

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
