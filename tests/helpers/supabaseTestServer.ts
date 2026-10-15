import http from "node:http";
import crypto from "node:crypto";
import { Pool } from "pg";

export const TEST_JWT_SECRET = "tbos-secure-test-jwt-secret-key-minimum-32-chars-long!";
export const TEST_SUPABASE_SERVICE_KEY = "test-service-role-key-tbos-academy-operations-2026";
export const TEST_DB_URL = "postgresql://postgres@127.0.0.1:5433/tbos_test_a";

export function createSignedTestToken(
  payload: { sub: string; email: string; role?: string },
  expiresInSec = 3600
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    aud: "authenticated",
    role: payload.role || "authenticated",
    iat: now,
    exp: now + expiresInSec,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function createExpiredTestToken(payload: { sub: string; email: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    aud: "authenticated",
    role: "authenticated",
    iat: now - 7200,
    exp: now - 3600, // expired 1 hour ago
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function createForgedMockSignatureToken(payload: { sub: string; email: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    aud: "authenticated",
    role: "authenticated",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${headerB64}.${payloadB64}.mock-signature`;
}

export interface SupabaseTestServerInstance {
  server: http.Server;
  pool: Pool;
  url: string;
  port: number;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function createSupabaseTestServer(options?: {
  port?: number;
  dbUrl?: string;
  jwtSecret?: string;
}): SupabaseTestServerInstance {
  const port = options?.port || 54321;
  const dbUrl = options?.dbUrl || TEST_DB_URL;
  const jwtSecret = options?.jwtSecret || TEST_JWT_SECRET;
  const pool = new Pool({ connectionString: dbUrl });

  const server = http.createServer(async (req, res) => {
    // Enable CORS for browser access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    const pathname = url.pathname;

    // Read full body if present
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf-8");
    let jsonBody: any = null;
    if (rawBody.trim()) {
      try {
        jsonBody = JSON.parse(rawBody);
      } catch {
        jsonBody = null;
      }
    }

    // =========================================================================
    // 1. SUPABASE AUTH: GET /auth/v1/user
    // =========================================================================
    if (pathname === "/auth/v1/user" && req.method === "GET") {
      const authHeader = req.headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "missing_bearer_token", message: "Missing Bearer token" }));
        return;
      }

      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const parts = token.split(".");
      if (parts.length !== 3) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "malformed_jwt", message: "Malformed JWT" }));
        return;
      }

      const [hB64, bB64, sigB64] = parts;
      const expectedSig = crypto
        .createHmac("sha256", jwtSecret)
        .update(`${hB64}.${bB64}`)
        .digest("base64url");

      if (sigB64 !== expectedSig) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_jwt_signature", message: "Invalid JWT signature" }));
        return;
      }

      let payload: any;
      try {
        payload = JSON.parse(Buffer.from(bB64, "base64url").toString("utf-8"));
      } catch {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_jwt_payload", message: "Invalid JWT payload" }));
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "token_expired", message: "JWT token is expired" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          id: payload.sub,
          aud: "authenticated",
          role: "authenticated",
          email: payload.email,
          user_metadata: {},
        })
      );
      return;
    }

    // =========================================================================
    // 2. SUPABASE REST: RPC CALLS (POST /rest/v1/rpc/<fn_name>)
    // =========================================================================
    if (pathname.startsWith("/rest/v1/rpc/")) {
      const fnName = pathname.replace("/rest/v1/rpc/", "").trim();
      try {
        if (fnName === "create_student_full_tx") {
          const resDb = await pool.query("SELECT public.create_student_full_tx($1::jsonb) AS res", [
            JSON.stringify(jsonBody?.p_params || jsonBody),
          ]);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "convert_lead_to_student_tx") {
          const p = jsonBody || {};
          const resDb = await pool.query(
            `SELECT public.convert_lead_to_student_tx(
              $1::uuid, $2::text, $3::text, $4::text, $5::numeric,
              $6::uuid, $7::uuid, $8::text, $9::numeric, $10::integer,
              $11::date, $12::text, $13::text, $14::boolean, $15::uuid, $16::text
            ) AS res`,
            [
              p.p_lead_id,
              p.p_program_slug,
              p.p_program_title,
              p.p_program_type,
              p.p_agreed_fee,
              p.p_batch_id || null,
              p.p_instructor_id || null,
              p.p_instructor_name || null,
              p.p_discount || 0,
              p.p_billing_day || 1,
              p.p_enrollment_date || new Date().toISOString().split("T")[0],
              p.p_schedule || null,
              p.p_notes || null,
              p.p_create_initial_invoice !== false,
              p.p_admin_user_id || null,
              p.p_actor_email || null,
            ]
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "record_payment_tx") {
          const p = jsonBody || {};
          const resDb = await pool.query(
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
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "create_class_sessions_tx") {
          const resDb = await pool.query("SELECT public.create_class_sessions_tx($1::jsonb) AS res", [
            JSON.stringify(jsonBody?.p_params || jsonBody),
          ]);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "generate_monthly_dues_batch") {
          const resDb = await pool.query(
            "SELECT public.generate_monthly_dues_batch($1::text, $2::integer) AS res",
            [jsonBody?.p_billing_month, jsonBody?.p_due_day || 10]
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "generate_recurring_sessions_batch") {
          const resDb = await pool.query("SELECT public.generate_recurring_sessions_batch($1::integer) AS res", [
            jsonBody?.p_weeks || 8,
          ]);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "get_next_student_id") {
          const resDb = await pool.query("SELECT public.get_next_student_id() AS res");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "get_next_invoice_number") {
          const resDb = await pool.query("SELECT public.get_next_invoice_number() AS res");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        if (fnName === "get_next_receipt_number") {
          const resDb = await pool.query("SELECT public.get_next_receipt_number() AS res");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resDb.rows[0].res));
          return;
        }

        const resDb = await pool.query(`SELECT public.${fnName}($1::jsonb) AS res`, [
          JSON.stringify(jsonBody || {}),
        ]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(resDb.rows[0]?.res));
        return;
      } catch (err: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: err.code || "PGRST_ERROR", message: err.message }));
        return;
      }
    }

    // =========================================================================
    // 3. SUPABASE REST: TABLE CRUD (/rest/v1/<table_name>)
    // =========================================================================
    if (pathname.startsWith("/rest/v1/")) {
      const table = pathname.replace("/rest/v1/", "").split("/")[0].trim();
      const acceptHeader = req.headers["accept"] || "";
      const isSingleRequested = acceptHeader.includes("application/vnd.pgrst.object+json");
      const preferHeader = req.headers["prefer"] || "";
      const isCountRequested = preferHeader.includes("count=exact");

      // Parse query params into SQL filters
      const sqlParams: any[] = [];
      interface FilterItem {
        build: (alias?: string) => string;
      }
      const filters: FilterItem[] = [];
      let orderCol: string | null = null;
      let orderDir: string = "DESC";
      let limitClause = "";
      let offsetClause = "";

      url.searchParams.forEach((val, key) => {
        if (key === "select") return;
        if (key === "order") {
          const [col, dir] = val.split(".");
          orderCol = col;
          orderDir = dir?.toUpperCase() === "ASC" ? "ASC" : "DESC";
          return;
        }
        if (key === "limit") {
          limitClause = ` LIMIT ${parseInt(val, 10)}`;
          return;
        }
        if (key === "offset") {
          offsetClause = ` OFFSET ${parseInt(val, 10)}`;
          return;
        }
        if (key === "or") {
          // e.g. (full_name.ilike.%foo%,email.ilike.%foo%)
          const rawConditions = val.replace(/[()]/g, "").split(",");
          const orItems: { col: string; paramIdx: number }[] = [];
          for (const cond of rawConditions) {
            const [cCol, cOp, cVal] = cond.split(".");
            if (cOp === "ilike") {
              sqlParams.push(cVal);
              orItems.push({ col: cCol, paramIdx: sqlParams.length });
            }
          }
          if (orItems.length > 0) {
            filters.push({
              build: (alias) => {
                const prefix = alias ? `${alias}.` : "";
                const parts = orItems.map((item) => `${prefix}"${item.col}" ILIKE $${item.paramIdx}`);
                return `(${parts.join(" OR ")})`;
              },
            });
          }
          return;
        }

        // Standard filter key=op.val
        const dotIdx = val.indexOf(".");
        if (dotIdx === -1) return;
        const op = val.substring(0, dotIdx);
        const operand = val.substring(dotIdx + 1);

        if (op === "eq") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" = $${pIdx}` });
        } else if (op === "neq") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" != $${pIdx}` });
        } else if (op === "gte") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" >= $${pIdx}` });
        } else if (op === "lte") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" <= $${pIdx}` });
        } else if (op === "gt") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" > $${pIdx}` });
        } else if (op === "lt") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" < $${pIdx}` });
        } else if (op === "ilike") {
          sqlParams.push(operand);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" ILIKE $${pIdx}` });
        } else if (op === "in") {
          const arr = operand.replace(/[()]/g, "").split(",").map((s) => s.trim());
          sqlParams.push(arr);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" = ANY($${pIdx})` });
        } else if (op === "is" && operand === "null") {
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" IS NULL` });
        } else if (op === "not" && operand.startsWith("is.null")) {
          filters.push({ build: (a) => `${a ? `${a}.` : ""}"${key}" IS NOT NULL` });
        } else if (op === "not" && operand.startsWith("in.")) {
          const arr = operand.replace(/in\.[()]/g, "").replace(/[()]/g, "").split(",").map((s) => s.trim());
          sqlParams.push(arr);
          const pIdx = sqlParams.length;
          filters.push({ build: (a) => `NOT (${a ? `${a}.` : ""}"${key}" = ANY($${pIdx}))` });
        }
      });

      function getWhereClause(alias?: string) {
        if (filters.length === 0) return "";
        return ` WHERE ${filters.map((f) => f.build(alias)).join(" AND ")}`;
      }

      function getOrderClause(alias?: string, defaultCol = "created_at", defaultDir = "DESC") {
        const p = alias ? `${alias}.` : "";
        const c = orderCol || defaultCol;
        const d = orderCol ? orderDir : defaultDir;
        return ` ORDER BY ${p}"${c}" ${d}`;
      }

      try {
        if (req.method === "GET") {
          let countTotal: number | null = null;
          if (isCountRequested) {
            const countRes = await pool.query(
              `SELECT count(*)::int as total FROM public.${table}${getWhereClause()}`,
              sqlParams
            );
            countTotal = countRes.rows[0]?.total ?? 0;
            res.setHeader("Content-Range", `0-${Math.max(0, countTotal - 1)}/${countTotal}`);
          }

          let querySql = "";
          if (table === "students") {
            querySql = `
              SELECT s.*,
                coalesce((SELECT json_agg(e.*) FROM public.enrollments e WHERE e.student_id = s.id), '[]'::json) AS enrollments,
                coalesce((SELECT json_agg(fi.*) FROM public.fee_invoices fi WHERE fi.student_id = s.id), '[]'::json) AS fee_invoices,
                coalesce((SELECT json_agg(bp.*) FROM public.billing_plans bp WHERE bp.student_id = s.id), '[]'::json) AS billing_plans,
                coalesce((SELECT json_agg(rcs.*) FROM public.recurring_class_schedules rcs WHERE rcs.student_id = s.id), '[]'::json) AS recurring_class_schedules,
                coalesce((SELECT json_agg(cs.*) FROM public.class_sessions cs WHERE cs.student_id = s.id), '[]'::json) AS class_sessions,
                coalesce((SELECT json_agg(t.*) FROM public.crm_tasks t WHERE t.related_id = s.id::text), '[]'::json) AS crm_tasks
              FROM public.students s
              ${getWhereClause("s")}
              ${getOrderClause("s", "created_at", "DESC")}
              ${limitClause} ${offsetClause}
            `;
          } else if (table === "class_sessions") {
            querySql = `
              SELECT cs.*,
                row_to_json(s.*) AS students,
                row_to_json(b.*) AS batches
              FROM public.class_sessions cs
              LEFT JOIN public.students s ON s.id = cs.student_id
              LEFT JOIN public.batches b ON b.id = cs.batch_id
              ${getWhereClause("cs")}
              ${getOrderClause("cs", "session_date", "ASC")}
              ${limitClause} ${offsetClause}
            `;
          } else if (table === "fee_invoices") {
            querySql = `
              SELECT fi.*,
                row_to_json(s.*) AS students
              FROM public.fee_invoices fi
              LEFT JOIN public.students s ON s.id = fi.student_id
              ${getWhereClause("fi")}
              ${getOrderClause("fi", "created_at", "DESC")}
              ${limitClause} ${offsetClause}
            `;
          } else if (table === "enrollments") {
            querySql = `
              SELECT e.*,
                row_to_json(b.*) AS batches
              FROM public.enrollments e
              LEFT JOIN public.batches b ON b.id = e.batch_id
              ${getWhereClause("e")}
              ${getOrderClause("e", "created_at", "DESC")}
              ${limitClause} ${offsetClause}
            `;
          } else {
            querySql = `SELECT * FROM public.${table}${getWhereClause()}${orderCol ? getOrderClause() : ""}${limitClause}${offsetClause}`;
          }

          const dbRes = await pool.query(querySql, sqlParams);
          if (isSingleRequested) {
            if (dbRes.rows.length === 0) {
              res.writeHead(406, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  code: "PGRST116",
                  details: "The result contains 0 rows",
                  message: "JSON object requested, multiple (or no) rows returned",
                })
              );
              return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(dbRes.rows[0]));
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(dbRes.rows));
          return;
        }

        if (req.method === "POST") {
          const row = Array.isArray(jsonBody) ? jsonBody[0] : jsonBody;
          const keys = Object.keys(row);
          const vals = Object.values(row);
          const cols = keys.map((k) => `"${k}"`).join(", ");
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
          const insertSql = `INSERT INTO public.${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
          const dbRes = await pool.query(insertSql, vals);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(isSingleRequested ? dbRes.rows[0] : dbRes.rows));
          return;
        }

        if (req.method === "PATCH") {
          const keys = Object.keys(jsonBody);
          const vals = Object.values(jsonBody);
          const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
          const whereSql = getWhereClause();
          const adjustedWhere = whereSql.replace(/\$(\d+)/g, (_, d) => `$${Number(d) + vals.length}`);
          const patchSql = `UPDATE public.${table} SET ${setClause}${adjustedWhere} RETURNING *`;
          const dbRes = await pool.query(patchSql, [...vals, ...sqlParams]);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(isSingleRequested ? dbRes.rows[0] : dbRes.rows));
          return;
        }

        if (req.method === "DELETE") {
          const deleteSql = `DELETE FROM public.${table}${getWhereClause()} RETURNING *`;
          const dbRes = await pool.query(deleteSql, sqlParams);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(dbRes.rows));
          return;
        }
      } catch (err: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: err.code || "PGRST_ERROR", message: err.message }));
        return;
      }
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found", message: `Route ${pathname} not found on test Supabase` }));
  });

  return {
    server,
    pool,
    url: `http://127.0.0.1:${port}`,
    port,
    start: () =>
      new Promise<void>((resolve, reject) => {
        server.listen(port, "127.0.0.1", () => resolve());
        server.on("error", reject);
      }),
    stop: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await pool.end();
    },
  };
}
