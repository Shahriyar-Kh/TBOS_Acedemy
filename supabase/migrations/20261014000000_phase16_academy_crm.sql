-- ==============================================================================
-- PHASE 16: COMPLETE TBOS ACADEMY CRM, STUDENT, FEE & CLASS MANAGEMENT SYSTEM
-- Migration: 20261014000000_phase16_academy_crm.sql
--
-- SAFETY & AUDIT NOTICE:
-- 1. This migration must be executed by a database administrator / system owner.
-- 2. Do NOT run this migration automatically without prior backup.
-- 3. All operations are idempotent (IF NOT EXISTS / DROP CONSTRAINT IF EXISTS).
-- 4. Complete rollback script is provided in docs/CRM_MIGRATION_ROLLBACK.md.
-- ==============================================================================

-- 1. Extend admin_users role constraint to support 'instructor' and 'accountant'
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('owner', 'admin', 'admissions', 'instructor', 'accountant'));

-- Add optional name and phone to admin_users if not present
alter table public.admin_users
  add column if not exists full_name text,
  add column if not exists phone text;


-- 2. Students Table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  date_of_birth date,
  age smallint check (age is null or (age >= 4 and age <= 120)),
  country text not null default 'Pakistan',
  city text,
  timezone text not null default 'Asia/Karachi',
  status text not null default 'active' check (
    status in ('active', 'trial', 'paused', 'on_hold', 'completed', 'dropped', 'cancelled')
  ),
  enrollment_date date not null default current_date,
  billing_day smallint not null default 1 check (billing_day >= 1 and billing_day <= 28),
  notes text,
  lead_id uuid references public.admissions_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_students_lead_id unique (lead_id)
);

create index if not exists idx_students_student_id on public.students (student_id);
create index if not exists idx_students_email on public.students (lower(email));
create index if not exists idx_students_phone on public.students (phone);
create index if not exists idx_students_status on public.students (status);
create index if not exists idx_students_lead_id on public.students (lead_id);
create index if not exists idx_students_created_at on public.students (created_at desc);

alter table public.students enable row level security;
revoke all on public.students from anon, public;
grant all on public.students to service_role;


-- 3. Batches Table
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_slug text not null,
  program_title text not null,
  program_type text not null check (
    program_type in ('live_batch', 'specialization', 'course', 'tutoring')
  ),
  mode text not null default 'group' check (mode in ('group', 'one_on_one')),
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  start_date date,
  expected_end_date date,
  days_of_week text[] not null default '{}',
  start_time text,
  end_time text,
  timezone text not null default 'Asia/Karachi',
  max_capacity integer not null default 20 check (max_capacity > 0),
  active_student_count integer not null default 0,
  meeting_link text,
  status text not null default 'active' check (
    status in ('planned', 'enrolling', 'active', 'paused', 'completed', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_batches_status on public.batches (status);
create index if not exists idx_batches_program_slug on public.batches (program_slug);
create index if not exists idx_batches_instructor_id on public.batches (instructor_id);

alter table public.batches enable row level security;
revoke all on public.batches from anon, public;
grant all on public.batches to service_role;


-- 4. Enrollments Table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  program_slug text not null,
  program_title text not null,
  program_type text not null,
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  agreed_fee numeric(12, 2) not null default 0 check (agreed_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  billing_day smallint not null default 1 check (billing_day >= 1 and billing_day <= 28),
  enrollment_date date not null default current_date,
  schedule text,
  status text not null default 'active' check (
    status in ('active', 'paused', 'completed', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_enrollments_student_id on public.enrollments (student_id);
create index if not exists idx_enrollments_batch_id on public.enrollments (batch_id);
create index if not exists idx_enrollments_status on public.enrollments (status);

alter table public.enrollments enable row level security;
revoke all on public.enrollments from anon, public;
grant all on public.enrollments to service_role;


-- 5. Fee Invoices / Dues Table
create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  billing_month text not null, -- Format YYYY-MM
  amount_due numeric(12, 2) not null default 0 check (amount_due >= 0),
  amount_paid numeric(12, 2) not null default 0 check (amount_paid >= 0),
  balance numeric(12, 2) not null default 0,
  due_date date not null,
  status text not null default 'due' check (
    status in ('upcoming', 'due', 'partially_paid', 'paid', 'overdue', 'waived', 'refunded')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_student_enrollment_month unique (student_id, enrollment_id, billing_month)
);

create index if not exists idx_fee_invoices_student_id on public.fee_invoices (student_id);
create index if not exists idx_fee_invoices_billing_month on public.fee_invoices (billing_month);
create index if not exists idx_fee_invoices_status on public.fee_invoices (status);
create index if not exists idx_fee_invoices_due_date on public.fee_invoices (due_date);

alter table public.fee_invoices enable row level security;
revoke all on public.fee_invoices from anon, public;
grant all on public.fee_invoices to service_role;


-- 6. Fee Payments Table
create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_method text not null check (
    payment_method in ('bank_transfer', 'jazzcash', 'easypaisa', 'cash', 'card', 'other')
  ),
  reference_number text,
  receipt_number text unique,
  idempotency_key text unique,
  notes text,
  recorded_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_fee_payments_invoice_id on public.fee_payments (invoice_id);
create index if not exists idx_fee_payments_student_id on public.fee_payments (student_id);
create index if not exists idx_fee_payments_payment_date on public.fee_payments (payment_date desc);
create index if not exists idx_fee_payments_receipt_number on public.fee_payments (receipt_number);
create index if not exists idx_fee_payments_idempotency_key on public.fee_payments (idempotency_key);

alter table public.fee_payments enable row level security;
revoke all on public.fee_payments from anon, public;
grant all on public.fee_payments to service_role;


-- 7. Class Sessions Table
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  title text not null,
  session_date date not null,
  start_time text not null, -- Format HH:mm
  end_time text not null,   -- Format HH:mm
  timezone text not null default 'Asia/Karachi',
  meeting_link text,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'completed', 'rescheduled', 'cancelled', 'missed')
  ),
  topic_covered text,
  homework text,
  instructor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_class_sessions_date on public.class_sessions (session_date);
create index if not exists idx_class_sessions_batch_id on public.class_sessions (batch_id);
create index if not exists idx_class_sessions_instructor_id on public.class_sessions (instructor_id);
create index if not exists idx_class_sessions_status on public.class_sessions (status);

alter table public.class_sessions enable row level security;
revoke all on public.class_sessions from anon, public;
grant all on public.class_sessions to service_role;


-- 8. Class Attendance Table
create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'present' check (
    status in ('present', 'absent', 'late', 'excused')
  ),
  notes text,
  recorded_at timestamptz not null default now(),
  constraint uq_session_student_attendance unique (class_session_id, student_id)
);

create index if not exists idx_attendance_session_id on public.class_attendance (class_session_id);
create index if not exists idx_attendance_student_id on public.class_attendance (student_id);

alter table public.class_attendance enable row level security;
revoke all on public.class_attendance from anon, public;
grant all on public.class_attendance to service_role;


-- 9. Instructor Availability & Calendar Exceptions Table
create table if not exists public.instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.admin_users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  start_time text not null,
  end_time text not null,
  is_blocked boolean not null default false,
  notes text
);

create index if not exists idx_instructor_avail_instructor on public.instructor_availability (instructor_id);

alter table public.instructor_availability enable row level security;
revoke all on public.instructor_availability from anon, public;
grant all on public.instructor_availability to service_role;


-- 10. CRM Tasks & Follow-ups Table
create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date timestamptz not null,
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high', 'urgent')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'in_progress', 'completed', 'cancelled')
  ),
  assigned_to uuid references public.admin_users(id) on delete set null,
  related_type text check (
    related_type in ('lead', 'student', 'class', 'payment', 'other')
  ),
  related_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_tasks_status on public.crm_tasks (status);
create index if not exists idx_crm_tasks_due_date on public.crm_tasks (due_date);
create index if not exists idx_crm_tasks_assigned_to on public.crm_tasks (assigned_to);

alter table public.crm_tasks enable row level security;
revoke all on public.crm_tasks from anon, public;
grant all on public.crm_tasks to service_role;


-- 11. CRM Notifications Table
create table if not exists public.crm_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null check (
    type in ('new_application', 'demo_due', 'follow_up_due', 'class_soon', 'payment_due', 'reminder_failed', 'conflict', 'info')
  ),
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_notifications_is_read on public.crm_notifications (is_read, created_at desc);

alter table public.crm_notifications enable row level security;
revoke all on public.crm_notifications from anon, public;
grant all on public.crm_notifications to service_role;


-- 12. Message Templates Table
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  category text not null check (
    category in ('fee_reminder', 'class_reminder', 'demo_reminder', 'welcome', 'follow_up', 'general')
  ),
  subject text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;
revoke all on public.message_templates from anon, public;
grant all on public.message_templates to service_role;


-- 13. Message Delivery Logs Table
create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  recipient_name text,
  subject text,
  content text not null,
  status text not null check (status in ('sent', 'failed', 'prepared_link', 'skipped')),
  error_message text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_message_logs_created_at on public.message_logs (created_at desc);

alter table public.message_logs enable row level security;
revoke all on public.message_logs from anon, public;
grant all on public.message_logs to service_role;


-- 14. CRM Audit Logs Table
create table if not exists public.crm_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_audit_logs_created_at on public.crm_audit_logs (created_at desc);
create index if not exists idx_crm_audit_logs_entity on public.crm_audit_logs (entity, entity_id);

alter table public.crm_audit_logs enable row level security;
revoke all on public.crm_audit_logs from anon, public;
grant all on public.crm_audit_logs to service_role;


-- 15. Password Reset Tokens Table (Hashed Tokens Only)
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_hash on public.password_reset_tokens (token_hash);
create index if not exists idx_password_reset_tokens_email on public.password_reset_tokens (lower(email));

alter table public.password_reset_tokens enable row level security;
revoke all on public.password_reset_tokens from anon, public;
grant all on public.password_reset_tokens to service_role;


-- 16. Admin Invitations Table (Token-based invitation, no temporary passwords)
create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('owner', 'admin', 'admissions', 'instructor', 'accountant')),
  full_name text,
  phone text,
  token_hash text not null,
  invited_by uuid references public.admin_users(id) on delete set null,
  expires_at timestamptz not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_invitations_token on public.admin_invitations (token_hash);
create index if not exists idx_admin_invitations_email on public.admin_invitations (lower(email));

alter table public.admin_invitations enable row level security;
revoke all on public.admin_invitations from anon, public;
grant all on public.admin_invitations to service_role;


-- 17. CRM Rate Limits Table
create table if not exists public.crm_rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  hit_count integer not null default 1,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_rate_limits_key on public.crm_rate_limits (key);
create index if not exists idx_crm_rate_limits_expires on public.crm_rate_limits (expires_at);

alter table public.crm_rate_limits enable row level security;
revoke all on public.crm_rate_limits from anon, public;
grant all on public.crm_rate_limits to service_role;


-- 18. Persistent CRM Reminders Table (Engine for Automated Notifications)
create table if not exists public.crm_reminders (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('class_reminder', 'demo_reminder', 'fee_reminder')),
  entity_type text not null check (entity_type in ('class_session', 'demo_booking', 'fee_invoice')),
  entity_id uuid not null,
  recipient text not null,
  recipient_name text,
  channel text not null check (channel in ('email', 'whatsapp')),
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'processing', 'sent', 'failed', 'cancelled')
  ),
  idempotency_key text unique not null,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  sent_at timestamptz,
  last_error text,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_reminders_status_scheduled on public.crm_reminders (status, scheduled_for);
create index if not exists idx_crm_reminders_idempotency on public.crm_reminders (idempotency_key);
create index if not exists idx_crm_reminders_entity on public.crm_reminders (entity_type, entity_id);

alter table public.crm_reminders enable row level security;
revoke all on public.crm_reminders from anon, public;
grant all on public.crm_reminders to service_role;


-- 19. Atomic Sequence Counters Table (No Random Fallback)
create table if not exists public.crm_sequences (
  sequence_key text primary key,
  current_value bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.crm_sequences enable row level security;
revoke all on public.crm_sequences from anon, public;
grant all on public.crm_sequences to service_role;


-- ==============================================================================
-- DATABASE FUNCTIONS & ATOMIC PROCEDURES (RPCs)
-- ==============================================================================

-- 20. Atomic sequence counter helper
create or replace function public.get_next_crm_sequence(p_sequence_key text)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_next_val bigint;
begin
  insert into public.crm_sequences (sequence_key, current_value, updated_at)
  values (p_sequence_key, 1, now())
  on conflict (sequence_key)
  do update set
    current_value = crm_sequences.current_value + 1,
    updated_at = now()
  returning current_value into v_next_val;

  return v_next_val;
end;
$$;

-- Atomic Student ID Generator: TBOS-YYYY-XXXX
create or replace function public.get_next_student_id(p_year int default extract(year from current_date)::int)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_seq bigint;
begin
  v_seq := public.get_next_crm_sequence('student_id_' || p_year::text);
  return 'TBOS-' || p_year::text || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Atomic Invoice Number Generator: INV-YYYYMM-XXXX
create or replace function public.get_next_invoice_number(p_now timestamptz default now())
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ym text;
  v_seq bigint;
begin
  v_ym := to_char(p_now, 'YYYYMM');
  v_seq := public.get_next_crm_sequence('invoice_number_' || v_ym);
  return 'INV-' || v_ym || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Atomic Receipt Number Generator: REC-YYYYMM-XXXX
create or replace function public.get_next_receipt_number(p_now timestamptz default now())
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ym text;
  v_seq bigint;
begin
  v_ym := to_char(p_now, 'YYYYMM');
  v_seq := public.get_next_crm_sequence('receipt_number_' || v_ym);
  return 'REC-' || v_ym || '-' || lpad(v_seq::text, 4, '0');
end;
$$;


-- 21. Single Transaction RPC: Convert Lead to Student
create or replace function public.convert_lead_to_student_tx(
  p_lead_id uuid,
  p_program_slug text,
  p_program_title text,
  p_program_type text,
  p_agreed_fee numeric,
  p_batch_id uuid default null,
  p_instructor_id uuid default null,
  p_instructor_name text default null,
  p_discount numeric default 0,
  p_billing_day int default 1,
  p_enrollment_date date default current_date,
  p_schedule text default null,
  p_notes text default null,
  p_create_initial_invoice boolean default true,
  p_admin_user_id uuid default null,
  p_actor_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead record;
  v_existing_student record;
  v_student record;
  v_enrollment record;
  v_invoice record;
  v_student_id_str text;
  v_invoice_num_str text;
  v_billing_month text;
  v_due_date date;
  v_now timestamptz := now();
begin
  -- 1. Lock lead record with FOR UPDATE
  select * into v_lead
  from public.admissions_requests
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'LEAD_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 2. Check for duplicate conversion / existing student
  select * into v_existing_student
  from public.students
  where lead_id = p_lead_id;

  if found then
    raise exception 'LEAD_ALREADY_CONVERTED' using errcode = '23505';
  end if;

  -- 3. Atomic sequential Student ID
  v_student_id_str := public.get_next_student_id(extract(year from v_now)::int);

  -- 4. Insert student
  insert into public.students (
    student_id,
    full_name,
    email,
    phone,
    whatsapp,
    guardian_name,
    guardian_phone,
    guardian_email,
    age,
    country,
    city,
    timezone,
    status,
    enrollment_date,
    billing_day,
    notes,
    lead_id,
    created_at,
    updated_at
  ) values (
    v_student_id_str,
    coalesce(v_lead.student_name, 'Unknown Student'),
    lower(trim(v_lead.email)),
    v_lead.phone,
    v_lead.phone,
    v_lead.guardian_name,
    v_lead.guardian_phone,
    v_lead.guardian_email,
    v_lead.age,
    coalesce(v_lead.country, 'Pakistan'),
    v_lead.city,
    'Asia/Karachi',
    'active',
    p_enrollment_date,
    p_billing_day,
    p_notes,
    p_lead_id,
    v_now,
    v_now
  ) returning * into v_student;

  -- 5. Insert enrollment
  insert into public.enrollments (
    student_id,
    batch_id,
    program_slug,
    program_title,
    program_type,
    instructor_id,
    instructor_name,
    agreed_fee,
    discount,
    billing_day,
    enrollment_date,
    schedule,
    status,
    created_at,
    updated_at
  ) values (
    v_student.id,
    p_batch_id,
    p_program_slug,
    p_program_title,
    p_program_type,
    p_instructor_id,
    p_instructor_name,
    p_agreed_fee,
    p_discount,
    p_billing_day,
    p_enrollment_date,
    p_schedule,
    'active',
    v_now,
    v_now
  ) returning * into v_enrollment;

  -- 6. Update batch count if batch assigned
  if p_batch_id is not null then
    update public.batches
    set active_student_count = active_student_count + 1,
        updated_at = v_now
    where id = p_batch_id;
  end if;

  -- 7. Create initial fee invoice if requested and fee > 0
  if p_create_initial_invoice and p_agreed_fee > 0 then
    v_invoice_num_str := public.get_next_invoice_number(v_now);
    v_billing_month := to_char(v_now, 'YYYY-MM');
    v_due_date := (current_date + interval '7 days')::date;

    insert into public.fee_invoices (
      invoice_number,
      student_id,
      enrollment_id,
      billing_month,
      amount_due,
      amount_paid,
      balance,
      due_date,
      status,
      notes,
      created_at,
      updated_at
    ) values (
      v_invoice_num_str,
      v_student.id,
      v_enrollment.id,
      v_billing_month,
      p_agreed_fee,
      0,
      p_agreed_fee,
      v_due_date,
      'due',
      'Initial monthly tuition for ' || p_program_title,
      v_now,
      v_now
    ) returning * into v_invoice;
  end if;

  -- 8. Update lead status to 'enrolled'
  update public.admissions_requests
  set status = 'enrolled',
      updated_at = v_now
  where id = p_lead_id;

  -- 9. Insert activity audit
  insert into public.admissions_activity (
    admission_id,
    admin_user_id,
    action_type,
    old_status,
    new_status,
    note,
    created_at
  ) values (
    p_lead_id,
    p_admin_user_id,
    'status_changed',
    v_lead.status,
    'enrolled',
    'Converted to Student: ' || v_student_id_str || ' (' || p_program_title || ')',
    v_now
  );

  -- 10. Insert CRM audit log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details,
    created_at
  ) values (
    p_admin_user_id,
    p_actor_email,
    'convert_lead_to_student',
    'admissions_requests',
    p_lead_id::text,
    jsonb_build_object(
      'student_id', v_student_id_str,
      'program_title', p_program_title,
      'agreed_fee', p_agreed_fee
    ),
    v_now
  );

  return jsonb_build_object(
    'student', row_to_json(v_student),
    'enrollment', row_to_json(v_enrollment),
    'invoice', case when v_invoice.id is not null then row_to_json(v_invoice) else null end
  );
end;
$$;


-- 22. Single Transaction RPC: Record Fee Payment
create or replace function public.record_payment_tx(
  p_invoice_id uuid,
  p_student_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_date date default current_date,
  p_reference_number text default null,
  p_notes text default null,
  p_recorded_by uuid default null,
  p_idempotency_key text default null,
  p_actor_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice record;
  v_existing_payment record;
  v_payment record;
  v_receipt_number text;
  v_new_paid numeric;
  v_new_balance numeric;
  v_new_status text;
  v_now timestamptz := now();
begin
  -- 1. Check idempotency
  if p_idempotency_key is not null and p_idempotency_key <> '' then
    select * into v_existing_payment
    from public.fee_payments
    where idempotency_key = p_idempotency_key;

    if found then
      -- Verify payload matches existing payment
      if v_existing_payment.invoice_id <> p_invoice_id 
         or v_existing_payment.student_id <> p_student_id 
         or v_existing_payment.amount <> p_amount then
        raise exception 'IDEMPOTENCY_KEY_COLLISION_MISMATCHED_PAYLOAD: Idempotency key already used with different parameters' using errcode = '23505';
      end if;

      select * into v_invoice from public.fee_invoices where id = v_existing_payment.invoice_id;
      return jsonb_build_object(
        'payment', row_to_json(v_existing_payment),
        'invoice', row_to_json(v_invoice),
        'is_duplicate', true
      );
    end if;
  end if;

  -- 2. Validate amount > 0
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT: Amount must be greater than zero' using errcode = '22003';
  end if;

  -- 3. Validate payment method
  if p_payment_method not in ('bank_transfer', 'jazzcash', 'easypaisa', 'cash', 'card', 'other') then
    raise exception 'INVALID_PAYMENT_METHOD: Unsupported payment method %', p_payment_method using errcode = '22023';
  end if;

  -- 4. Lock target invoice FOR UPDATE
  select * into v_invoice
  from public.fee_invoices
  where id = p_invoice_id
  for update;

  if not found then
    raise exception 'INVOICE_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 5. Reject invoices that are already settled, waived, refunded or cancelled
  if v_invoice.status in ('paid', 'waived', 'refunded', 'cancelled') then
    raise exception 'INVOICE_NOT_PAYABLE: Cannot record payment for invoice with status %', v_invoice.status using errcode = '22023';
  end if;

  -- 6. Reject zero or negative balance
  if v_invoice.balance <= 0 then
    raise exception 'INVOICE_ALREADY_SETTLED: Remaining balance is %', v_invoice.balance using errcode = '22023';
  end if;

  -- 7. Validate student matches invoice.student_id
  if v_invoice.student_id <> p_student_id then
    raise exception 'STUDENT_INVOICE_MISMATCH: Student % does not own invoice %', p_student_id, p_invoice_id using errcode = '22023';
  end if;

  -- 8. Validate no overpayment (amount <= remaining balance)
  if p_amount > v_invoice.balance then
    raise exception 'OVERPAYMENT_EXCEEDS_BALANCE: Amount % exceeds remaining balance %', p_amount, v_invoice.balance using errcode = '22023';
  end if;

  -- 6. Generate atomic receipt number
  v_receipt_number := public.get_next_receipt_number(v_now);

  -- 7. Insert payment record
  insert into public.fee_payments (
    invoice_id,
    student_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    receipt_number,
    idempotency_key,
    notes,
    recorded_by,
    created_at
  ) values (
    p_invoice_id,
    p_student_id,
    p_amount,
    p_payment_date,
    p_payment_method,
    p_reference_number,
    v_receipt_number,
    p_idempotency_key,
    p_notes,
    p_recorded_by,
    v_now
  ) returning * into v_payment;

  -- 8. Compute updated invoice balances
  v_new_paid := v_invoice.amount_paid + p_amount;
  v_new_balance := v_invoice.balance - p_amount;
  v_new_status := case when v_new_balance = 0 then 'paid' else 'partially_paid' end;

  -- 9. Update invoice
  update public.fee_invoices
  set amount_paid = v_new_paid,
      balance = v_new_balance,
      status = v_new_status,
      updated_at = v_now
  where id = p_invoice_id
  returning * into v_invoice;

  -- 10. Log in CRM audit
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details,
    created_at
  ) values (
    p_recorded_by,
    p_actor_email,
    'record_payment',
    'fee_payments',
    v_payment.id::text,
    jsonb_build_object(
      'invoice_number', v_invoice.invoice_number,
      'receipt_number', v_receipt_number,
      'amount', p_amount,
      'payment_method', p_payment_method,
      'remaining_balance', v_new_balance,
      'status', v_new_status
    ),
    v_now
  );

  return jsonb_build_object(
    'payment', row_to_json(v_payment),
    'invoice', row_to_json(v_invoice),
    'is_duplicate', false
  );
end;
$$;


-- 23. Ironclad Dual-Owner Protection Trigger
create or replace function public.protect_final_active_owner()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_other_owners_count int;
begin
  -- Prevent deactivating or demoting primary owner shahriyarkhanpk1@gmail.com
  if old.email = 'shahriyarkhanpk1@gmail.com' then
    if (TG_OP = 'DELETE') then
      raise exception 'CANNOT_DELETE_PRIMARY_OWNER: shahriyarkhanpk1@gmail.com cannot be deleted.' using errcode = '22023';
    end if;
    if (TG_OP = 'UPDATE') then
      if new.is_active = false or new.role <> 'owner' then
        raise exception 'CANNOT_DEMOTE_PRIMARY_OWNER: shahriyarkhanpk1@gmail.com cannot be deactivated or demoted.' using errcode = '22023';
      end if;
    end if;
  end if;

  -- Prevent removing the last active owner across the entire system
  if old.role = 'owner' and old.is_active = true then
    if (TG_OP = 'DELETE') or (TG_OP = 'UPDATE' and (new.is_active = false or new.role <> 'owner')) then
      select count(*) into v_other_owners_count
      from public.admin_users
      where role = 'owner' and is_active = true and id <> old.id;

      if v_other_owners_count = 0 then
        raise exception 'CANNOT_REMOVE_FINAL_OWNER: At least one active owner must remain.' using errcode = '22023';
      end if;
    end if;
  end if;

  if (TG_OP = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists trg_protect_final_active_owner on public.admin_users;
create trigger trg_protect_final_active_owner
before update or delete on public.admin_users
for each row
execute function public.protect_final_active_owner();


-- ==============================================================================
-- 24. FUNCTION EXECUTION PRIVILEGES (LEAST PRIVILEGE)
-- ==============================================================================
-- Default revoke from PUBLIC, anon, and authenticated for all privileged RPCs
revoke all on function public.get_next_crm_sequence(text) from public, anon, authenticated;
grant execute on function public.get_next_crm_sequence(text) to service_role;

revoke all on function public.get_next_student_id(int) from public, anon, authenticated;
grant execute on function public.get_next_student_id(int) to service_role;

revoke all on function public.get_next_invoice_number(timestamptz) from public, anon, authenticated;
grant execute on function public.get_next_invoice_number(timestamptz) to service_role;

revoke all on function public.get_next_receipt_number(timestamptz) from public, anon, authenticated;
grant execute on function public.get_next_receipt_number(timestamptz) to service_role;

revoke all on function public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text) from public, anon, authenticated;
grant execute on function public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text) to service_role;

revoke all on function public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text) to service_role;

revoke all on function public.protect_final_active_owner() from public, anon, authenticated;
grant execute on function public.protect_final_active_owner() to service_role;

