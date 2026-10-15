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
  role: "owner" | "admin" | "admissions" | "instructor" | "accountant";
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

export interface AdmissionsDeliveryLogRecord {
  id: string;
  admission_id: string;
  channel: "admin_email" | "learner_email" | "google_sheet";
  recipient_type?: "admin" | "learner" | "guardian" | "google_sheet" | null;
  status: "success" | "failed" | "skipped";
  error_summary?: string | null;
  created_at: string;
}

import pg from "pg";

let cachedClient: any = null;
let cachedTestPool: pg.Pool | null = null;
let cachedTestClient: any = null;

function createPostgresAdapter(connectionString: string): any {
  if (!cachedTestPool) {
    cachedTestPool = new pg.Pool({ connectionString });
  }
  const pool = cachedTestPool;

  const queryBuilder = (table: string) => {
    let mode = "select";
    const filters: Array<{ col: string; op: string; val: any }> = [];
    let orFilter: string | null = null;
    let orderCol: string | null = null;
    let orderAsc = true;
    let limitVal: number | null = null;
    let offsetVal: number | null = null;
    let insertData: any = null;
    let updateData: any = null;
    let isSingle = false;
    let isMaybeSingle = false;

    const b: any = {
      select: (_cols = "*", _opts?: any) => {
        return b;
      },
      insert: (data: any) => {
        mode = "insert";
        insertData = data;
        return b;
      },
      update: (data: any) => {
        mode = "update";
        updateData = data;
        return b;
      },
      delete: () => {
        mode = "delete";
        return b;
      },
      eq: (col: string, val: any) => {
        filters.push({ col, op: "=", val });
        return b;
      },
      neq: (col: string, val: any) => {
        filters.push({ col, op: "!=", val });
        return b;
      },
      gte: (col: string, val: any) => {
        filters.push({ col, op: ">=", val });
        return b;
      },
      lte: (col: string, val: any) => {
        filters.push({ col, op: "<=", val });
        return b;
      },
      gt: (col: string, val: any) => {
        filters.push({ col, op: ">", val });
        return b;
      },
      lt: (col: string, val: any) => {
        filters.push({ col, op: "<", val });
        return b;
      },
      in: (col: string, vals: any[]) => {
        filters.push({ col, op: "IN", val: vals });
        return b;
      },
      ilike: (col: string, val: any) => {
        filters.push({ col, op: "ILIKE", val });
        return b;
      },
      like: (col: string, val: any) => {
        filters.push({ col, op: "LIKE", val });
        return b;
      },
      not: (col: string, op: string, val: any) => {
        if (op === "in") {
          filters.push({ col, op: "NOT IN", val });
        } else {
          filters.push({ col, op: `NOT ${op}`, val });
        }
        return b;
      },
      is: (col: string, val: any) => {
        filters.push({ col, op: val === null ? "IS NULL" : "IS NOT NULL", val: null });
        return b;
      },
      or: (str: string) => {
        orFilter = str;
        return b;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = opts?.ascending !== false;
        return b;
      },
      range: (from: number, to: number) => {
        offsetVal = from;
        limitVal = to - from + 1;
        return b;
      },
      limit: (n: number) => {
        limitVal = n;
        return b;
      },
      single: async () => {
        isSingle = true;
        return b.then();
      },
      maybeSingle: async () => {
        isMaybeSingle = true;
        return b.then();
      },
      then: async (onFulfilled?: any, onRejected?: any) => {
        try {
          let data: any = null;
          let count: number | null = null;
          const error: any = null;

          const buildSqlFilter = (prefix: string, f: any, params: any[]) => {
            const colRef = prefix ? `${prefix}"${f.col}"` : `"${f.col}"`;
            if (f.op === "NOT IN") {
              let arr: string[] = [];
              if (typeof f.val === "string") {
                arr = f.val.replace(/[()"]/g, "").split(",").map((s: string) => s.trim());
              } else if (Array.isArray(f.val)) {
                arr = f.val;
              }
              params.push(arr);
              return `NOT (${colRef} = ANY($${params.length}))`;
            } else if (f.op === "IN") {
              let arr: string[] = [];
              if (typeof f.val === "string") {
                arr = f.val.replace(/[()"]/g, "").split(",").map((s: string) => s.trim());
              } else if (Array.isArray(f.val)) {
                arr = f.val;
              }
              params.push(arr);
              return `${colRef} = ANY($${params.length})`;
            } else if (f.op === "IS NULL") {
              return `${colRef} IS NULL`;
            } else if (f.op === "IS NOT NULL") {
              return `${colRef} IS NOT NULL`;
            } else {
              params.push(f.val);
              return `${colRef} ${f.op} $${params.length}`;
            }
          };

          if (mode === "select") {
            if (table === "students") {
              let sql = `
                SELECT s.*,
                  coalesce((SELECT json_agg(e.*) FROM public.enrollments e WHERE e.student_id = s.id), '[]'::json) AS enrollments,
                  coalesce((SELECT json_agg(fi.*) FROM public.fee_invoices fi WHERE fi.student_id = s.id), '[]'::json) AS fee_invoices,
                  coalesce((SELECT json_agg(bp.*) FROM public.billing_plans bp WHERE bp.student_id = s.id), '[]'::json) AS billing_plans,
                  coalesce((SELECT json_agg(rcs.*) FROM public.recurring_class_schedules rcs WHERE rcs.student_id = s.id), '[]'::json) AS recurring_class_schedules,
                  coalesce((SELECT json_agg(cs.*) FROM public.class_sessions cs WHERE cs.student_id = s.id), '[]'::json) AS class_sessions,
                  coalesce((SELECT json_agg(t.*) FROM public.crm_tasks t WHERE t.related_id = s.id::text), '[]'::json) AS crm_tasks
                FROM public.students s WHERE 1=1
              `;
              const params: any[] = [];
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("s.", f, params)}`;
              });
              if (orFilter) {
                params.push(`%${orFilter.replace(/[%_,()]/g, " ").trim()}%`);
                sql += ` AND (s.full_name ILIKE $${params.length} OR s.email ILIKE $${params.length} OR s.phone ILIKE $${params.length} OR s.student_id ILIKE $${params.length})`;
              }
              if (orderCol) {
                sql += ` ORDER BY s.${orderCol} ${orderAsc ? "ASC" : "DESC"}`;
              } else {
                sql += ` ORDER BY s.created_at DESC`;
              }
              if (limitVal !== null) sql += ` LIMIT ${limitVal}`;
              if (offsetVal !== null) sql += ` OFFSET ${offsetVal}`;

              const res = await pool.query(sql, params);
              data = res.rows;
              count = res.rowCount;
            } else if (table === "class_sessions") {
              let sql = `
                SELECT cs.*,
                  row_to_json(s.*) AS students,
                  row_to_json(b.*) AS batches
                FROM public.class_sessions cs
                LEFT JOIN public.students s ON s.id = cs.student_id
                LEFT JOIN public.batches b ON b.id = cs.batch_id
                WHERE 1=1
              `;
              const params: any[] = [];
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("cs.", f, params)}`;
              });
              if (orderCol) {
                sql += ` ORDER BY cs.${orderCol} ${orderAsc ? "ASC" : "DESC"}`;
              } else {
                sql += ` ORDER BY cs.session_date ASC, cs.start_time ASC`;
              }
              if (limitVal !== null) sql += ` LIMIT ${limitVal}`;
              const res = await pool.query(sql, params);
              data = res.rows;
              count = res.rowCount;
            } else if (table === "fee_invoices") {
              let sql = `
                SELECT fi.*,
                  row_to_json(s.*) AS students
                FROM public.fee_invoices fi
                LEFT JOIN public.students s ON s.id = fi.student_id
                WHERE 1=1
              `;
              const params: any[] = [];
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("fi.", f, params)}`;
              });
              if (orderCol) {
                sql += ` ORDER BY fi.${orderCol} ${orderAsc ? "ASC" : "DESC"}`;
              } else {
                sql += ` ORDER BY fi.created_at DESC`;
              }
              if (limitVal !== null) sql += ` LIMIT ${limitVal}`;
              const res = await pool.query(sql, params);
              data = res.rows;
              count = res.rowCount;
            } else {
              let sql = `SELECT * FROM public.${table} WHERE 1=1`;
              const params: any[] = [];
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("", f, params)}`;
              });
              if (orderCol) {
                sql += ` ORDER BY "${orderCol}" ${orderAsc ? "ASC" : "DESC"}`;
              }
              if (limitVal !== null) sql += ` LIMIT ${limitVal}`;
              if (offsetVal !== null) sql += ` OFFSET ${offsetVal}`;
              const res = await pool.query(sql, params);
              data = res.rows;
              count = res.rowCount;
            }

            if (isSingle || isMaybeSingle) {
              data = data && data.length > 0 ? data[0] : null;
            }
          } else if (mode === "insert") {
            const row = Array.isArray(insertData) ? insertData[0] : insertData;
            const keys = Object.keys(row);
            const vals = Object.values(row);
            const colsStr = keys.map((k) => `"${k}"`).join(", ");
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
            const sql = `INSERT INTO public.${table} (${colsStr}) VALUES (${placeholders}) RETURNING *`;
            const res = await pool.query(sql, vals);
            data = isSingle || isMaybeSingle ? res.rows[0] : res.rows;
          } else if (mode === "update") {
            const keys = Object.keys(updateData);
            const vals = Object.values(updateData);
            const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
            let sql = `UPDATE public.${table} SET ${setClause}`;
            const params = [...vals];
            if (filters.length > 0) {
              sql += " WHERE 1=1";
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("", f, params)}`;
              });
            }
            sql += " RETURNING *";
            const res = await pool.query(sql, params);
            data = isSingle || isMaybeSingle ? res.rows[0] : res.rows;
          } else if (mode === "delete") {
            let sql = `DELETE FROM public.${table}`;
            const params: any[] = [];
            if (filters.length > 0) {
              sql += " WHERE 1=1";
              filters.forEach((f) => {
                sql += ` AND ${buildSqlFilter("", f, params)}`;
              });
            }
            sql += " RETURNING *";
            const res = await pool.query(sql, params);
            data = res.rows;
          }

          const out = { data, count, error };
          return onFulfilled ? onFulfilled(out) : out;
        } catch (err: any) {
          const out = { data: null, count: null, error: err };
          return onRejected ? onRejected(out) : out;
        }
      },
    };

    return b;
  };

  return {
    from: (table: string) => queryBuilder(table),
    rpc: async (fnName: string, args?: Record<string, any>) => {
      try {
        if (fnName === "create_student_full_tx") {
          const res = await pool.query("SELECT public.create_student_full_tx($1::jsonb) AS res", [
            JSON.stringify(args?.p_params || args),
          ]);
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "create_class_sessions_tx") {
          const res = await pool.query("SELECT public.create_class_sessions_tx($1::jsonb) AS res", [
            JSON.stringify(args?.p_params || args),
          ]);
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "record_payment_tx") {
          const p = args || {};
          const res = await pool.query(
            `SELECT public.record_payment_tx(
              $1::uuid, $2::uuid, $3::numeric, $4::text, $5::text, $6::text, $7::date, $8::text, $9::uuid, $10::text
            ) AS res`,
            [
              p.p_invoice_id,
              p.p_student_id,
              p.p_amount,
              p.p_payment_method,
              p.p_transaction_ref,
              p.p_idempotency_key,
              p.p_payment_date,
              p.p_notes,
              p.p_actor_id,
              p.p_actor_email,
            ]
          );
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "generate_monthly_dues_batch") {
          const res = await pool.query("SELECT public.generate_monthly_dues_batch($1::text, $2::integer) AS res", [
            args?.p_billing_month,
            args?.p_due_day || 10,
          ]);
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "generate_recurring_sessions_batch") {
          const res = await pool.query("SELECT public.generate_recurring_sessions_batch($1::integer) AS res", [
            args?.p_weeks || 8,
          ]);
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "get_next_student_id") {
          const res = await pool.query("SELECT public.get_next_student_id() AS res");
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "get_next_invoice_number") {
          const res = await pool.query("SELECT public.get_next_invoice_number() AS res");
          return { data: res.rows[0].res, error: null };
        }
        if (fnName === "get_next_receipt_number") {
          const res = await pool.query("SELECT public.get_next_receipt_number() AS res");
          return { data: res.rows[0].res, error: null };
        }
        const res = await pool.query(`SELECT public.${fnName}($1::jsonb) AS res`, [JSON.stringify(args || {})]);
        return { data: res.rows[0]?.res, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    auth: {
      getUser: async (token: string) => {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
            if (payload.sub) {
              return { data: { user: { id: payload.sub, email: payload.email } }, error: null };
            }
          }
        } catch (_err) {
          // Token is not a valid JWT format, fall through to invalid token response
        }
        return { data: { user: null }, error: new Error("Invalid token") };
      },
    },
  };
}

/**
 * Server-only Supabase client using elevated SUPABASE_SECRET_KEY,
 * or isolated PostgreSQL adapter when TEST_DB_URL is configured.
 * Evaluates credentials at request time so build-time execution does not crash.
 */
export function getSupabaseServerClient(): {
  client: SupabaseClient | null;
  configured: boolean;
} {
  const config = getServerConfig();
  if (config.testDbUrl) {
    if (!cachedTestClient) {
      cachedTestClient = createPostgresAdapter(config.testDbUrl);
    }
    return { client: cachedTestClient as unknown as SupabaseClient, configured: true };
  }

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
