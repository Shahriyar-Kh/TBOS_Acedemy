-- ============================================================================
-- PHASE 18 — COMPLETE STUDENT OPERATIONS, TIMETABLE, FEES, GOOGLE MEET & REMINDERS
-- TBOS Academy: Operations, Life-cycle, Mistake Correction & Automated Alerts
-- ============================================================================

-- 1. Enhance Students Table
alter table public.students add column if not exists address text;
alter table public.students add column if not exists archived_at timestamptz;
alter table public.students add column if not exists archived_by uuid references public.admin_users(id) on delete set null;
alter table public.students add column if not exists archive_reason text;

alter table public.students drop constraint if exists students_status_check;
alter table public.students add constraint students_status_check check (
  status in ('active', 'trial', 'paused', 'on_hold', 'completed', 'dropped', 'cancelled', 'graduated', 'withdrawn', 'archived')
);

create index if not exists idx_students_status_archived on public.students (status, archived_at);

-- 2. Enhance Enrollments Table
alter table public.enrollments add column if not exists class_duration integer not null default 60 check (class_duration > 0 and class_duration <= 360);
alter table public.enrollments add column if not exists grace_period integer not null default 7 check (grace_period >= 0 and grace_period <= 60);
alter table public.enrollments add column if not exists auto_invoice boolean not null default true;

-- 3. Enhance Class Sessions Table
alter table public.class_sessions add column if not exists session_type text not null default 'single_session' check (
  session_type in ('recurring_occurrence', 'single_session', 'demo', 'rescheduled', 'makeup')
);
alter table public.class_sessions add column if not exists google_calendar_event_id text;
alter table public.class_sessions add column if not exists google_calendar_sync_status text not null default 'pending' check (
  google_calendar_sync_status in ('pending', 'synced', 'failed', 'cancelled')
);
alter table public.class_sessions add column if not exists google_calendar_error text;
alter table public.class_sessions add column if not exists sync_retry_count integer not null default 0;

create index if not exists idx_class_sessions_sync_status on public.class_sessions (google_calendar_sync_status);
create index if not exists idx_class_sessions_session_type on public.class_sessions (session_type);
create index if not exists idx_class_sessions_cal_event on public.class_sessions (google_calendar_event_id);

-- 4. Enhance Fee Invoices Table
alter table public.fee_invoices drop constraint if exists fee_invoices_status_check;
alter table public.fee_invoices add constraint fee_invoices_status_check check (
  status in ('draft', 'upcoming', 'due', 'partially_paid', 'paid', 'overdue', 'waived', 'refunded', 'voided', 'cancelled')
);

alter table public.fee_invoices add column if not exists voided_at timestamptz;
alter table public.fee_invoices add column if not exists voided_by uuid references public.admin_users(id) on delete set null;
alter table public.fee_invoices add column if not exists void_reason text;

create index if not exists idx_fee_invoices_status_voided on public.fee_invoices (status, voided_at);

-- 5. Enhance Fee Payments Table (Reversal and Ledger Audit Support)
alter table public.fee_payments add column if not exists is_reversal boolean not null default false;
alter table public.fee_payments add column if not exists reversed_payment_id uuid references public.fee_payments(id) on delete set null;
alter table public.fee_payments add column if not exists reversal_reason text;
alter table public.fee_payments add column if not exists reversed_by uuid references public.admin_users(id) on delete set null;
alter table public.fee_payments add column if not exists reversed_at timestamptz;

create index if not exists idx_fee_payments_reversed on public.fee_payments (reversed_payment_id);
create index if not exists idx_fee_payments_is_reversal on public.fee_payments (is_reversal);

-- 6. Enhance Admissions Requests Table
alter table public.admissions_requests add column if not exists converted_student_id uuid references public.students(id) on delete set null;
alter table public.admissions_requests add column if not exists enrollment_date timestamptz;
alter table public.admissions_requests add column if not exists demo_instructor_id uuid references public.admin_users(id) on delete set null;
alter table public.admissions_requests add column if not exists demo_class_session_id uuid references public.class_sessions(id) on delete set null;
alter table public.admissions_requests add column if not exists demo_outcome text check (
  demo_outcome is null or demo_outcome in ('completed', 'no_show', 'cancelled', 'rescheduled')
);

create index if not exists idx_admissions_converted_student on public.admissions_requests (converted_student_id);
create index if not exists idx_admissions_demo_session on public.admissions_requests (demo_class_session_id);

-- 7. Enhance CRM Reminders Constraints
alter table public.crm_reminders drop constraint if exists crm_reminders_type_check;
alter table public.crm_reminders add constraint crm_reminders_type_check check (
  type in ('class_reminder', 'demo_reminder', 'fee_reminder', 'instructor_reminder', 'admin_reminder')
);

alter table public.crm_reminders drop constraint if exists crm_reminders_entity_type_check;
alter table public.crm_reminders add constraint crm_reminders_entity_type_check check (
  entity_type in ('class_session', 'demo_booking', 'fee_invoice', 'admissions_request')
);

-- ============================================================================
-- 8. RPC: Schedule Clash Detection Query (check_schedule_conflicts)
-- ============================================================================
create or replace function public.check_schedule_conflicts(
  p_session_date date,
  p_start_time time,
  p_end_time time,
  p_instructor_id uuid default null,
  p_batch_id uuid default null,
  p_student_id uuid default null,
  p_exclude_session_id uuid default null
)
returns table (
  conflict_session_id uuid,
  conflict_title text,
  conflict_date date,
  conflict_start time,
  conflict_end time,
  conflict_type text,
  conflict_reason text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select
    cs.id as conflict_session_id,
    cs.title as conflict_title,
    cs.session_date as conflict_date,
    cs.start_time::time as conflict_start,
    cs.end_time::time as conflict_end,
    case
      when p_instructor_id is not null and cs.instructor_id = p_instructor_id then 'instructor_clash'
      when p_batch_id is not null and cs.batch_id = p_batch_id then 'batch_clash'
      when p_student_id is not null and cs.student_id = p_student_id then 'student_clash'
      else 'time_clash'
    end as conflict_type,
    case
      when p_instructor_id is not null and cs.instructor_id = p_instructor_id then 'Instructor already has a scheduled class at this time: ' || cs.title
      when p_batch_id is not null and cs.batch_id = p_batch_id then 'Batch already has a class scheduled at this time: ' || cs.title
      when p_student_id is not null and cs.student_id = p_student_id then 'Student already has a class scheduled at this time: ' || cs.title
      else 'Time clash with existing session: ' || cs.title
    end as conflict_reason
  from public.class_sessions cs
  where cs.session_date = p_session_date
    and cs.status not in ('cancelled', 'missed')
    and (p_exclude_session_id is null or cs.id != p_exclude_session_id)
    and not (cs.end_time::time <= p_start_time or cs.start_time::time >= p_end_time)
    and (
      (p_instructor_id is not null and cs.instructor_id = p_instructor_id) or
      (p_batch_id is not null and cs.batch_id = p_batch_id) or
      (p_student_id is not null and cs.student_id = p_student_id)
    );
end;
$$;

revoke all on function public.check_schedule_conflicts(date, time, time, uuid, uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.check_schedule_conflicts(date, time, time, uuid, uuid, uuid, uuid) to service_role;


-- ============================================================================
-- 9. RPC: Reverse Fee Payment Transaction (reverse_fee_payment_tx)
-- ============================================================================
create or replace function public.reverse_fee_payment_tx(
  p_payment_id uuid,
  p_reason text,
  p_admin_user_id uuid,
  p_actor_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_orig record;
  v_invoice record;
  v_reversal_id uuid;
  v_new_amount_paid numeric(12, 2);
  v_new_balance numeric(12, 2);
  v_new_status text;
  v_now timestamptz := now();
begin
  if p_reason is null or length(trim(p_reason)) < 3 then
    raise exception 'REVERSAL_REASON_REQUIRED: A valid explanation is mandatory for reversing payment records.' using errcode = '22023';
  end if;

  -- 1. Fetch original payment
  select * into v_orig from public.fee_payments where id = p_payment_id;
  if not found then
    raise exception 'PAYMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_orig.is_reversal then
    raise exception 'CANNOT_REVERSE_A_REVERSAL: Reversal records themselves cannot be reversed.' using errcode = '22023';
  end if;

  -- Check if already reversed
  if exists (select 1 from public.fee_payments where reversed_payment_id = p_payment_id) then
    raise exception 'PAYMENT_ALREADY_REVERSED: This payment has already been reversed.' using errcode = '23505';
  end if;

  -- 2. Fetch invoice
  select * into v_invoice from public.fee_invoices where id = v_orig.invoice_id;
  if not found then
    raise exception 'INVOICE_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 3. Insert Reversal Record
  insert into public.fee_payments (
    invoice_id,
    student_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    recorded_by,
    is_reversal,
    reversed_payment_id,
    reversal_reason,
    reversed_by,
    reversed_at
  ) values (
    v_orig.invoice_id,
    v_orig.student_id,
    v_orig.amount,
    current_date,
    v_orig.payment_method,
    coalesce(v_orig.reference_number, 'REV-' || substr(p_payment_id::text, 1, 8)),
    'Payment reversal: ' || p_reason,
    p_admin_user_id,
    true,
    p_payment_id,
    p_reason,
    p_admin_user_id,
    v_now
  ) returning id into v_reversal_id;

  -- 4. Mark original payment with reversal link
  update public.fee_payments
  set reversed_by = p_admin_user_id,
      reversed_at = v_now,
      reversal_reason = p_reason
  where id = p_payment_id;

  -- 5. Recalculate invoice net payments
  select coalesce(sum(case when is_reversal then -amount else amount end), 0)
  into v_new_amount_paid
  from public.fee_payments
  where invoice_id = v_invoice.id;

  if v_new_amount_paid < 0 then
    v_new_amount_paid := 0;
  end if;

  v_new_balance := greatest(0, v_invoice.amount_due - v_new_amount_paid);

  if v_new_balance = 0 and v_invoice.amount_due > 0 then
    v_new_status := 'paid';
  elsif v_new_amount_paid > 0 then
    v_new_status := 'partially_paid';
  elsif v_invoice.due_date < current_date then
    v_new_status := 'overdue';
  else
    v_new_status := 'due';
  end if;

  -- Update invoice
  update public.fee_invoices
  set amount_paid = v_new_amount_paid,
      balance = v_new_balance,
      status = v_new_status,
      updated_at = v_now
  where id = v_invoice.id;

  -- 6. Audit Log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    p_admin_user_id,
    p_actor_email,
    'payment_reversed',
    'fee_payments',
    p_payment_id,
    jsonb_build_object(
      'reversal_id', v_reversal_id,
      'original_amount', v_orig.amount,
      'invoice_id', v_invoice.id,
      'reason', p_reason,
      'new_balance', v_new_balance,
      'new_status', v_new_status
    )
  );

  return jsonb_build_object(
    'ok', true,
    'reversal_id', v_reversal_id,
    'original_payment_id', p_payment_id,
    'amount_reversed', v_orig.amount,
    'new_invoice_balance', v_new_balance,
    'new_invoice_status', v_new_status
  );
end;
$$;

revoke all on function public.reverse_fee_payment_tx(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.reverse_fee_payment_tx(uuid, text, uuid, text) to service_role;


-- ============================================================================
-- 10. RPC: Void Fee Invoice Transaction (void_fee_invoice_tx)
-- ============================================================================
create or replace function public.void_fee_invoice_tx(
  p_invoice_id uuid,
  p_reason text,
  p_admin_user_id uuid,
  p_actor_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inv record;
  v_active_payment_count int;
  v_now timestamptz := now();
begin
  if p_reason is null or length(trim(p_reason)) < 3 then
    raise exception 'VOID_REASON_REQUIRED: A valid reason is mandatory when voiding an invoice.' using errcode = '22023';
  end if;

  select * into v_inv from public.fee_invoices where id = p_invoice_id;
  if not found then
    raise exception 'INVOICE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_inv.status = 'voided' then
    raise exception 'INVOICE_ALREADY_VOIDED: This invoice has already been voided.' using errcode = '22023';
  end if;

  -- Ensure no active unreversed payments exist for this invoice
  select count(*) into v_active_payment_count
  from public.fee_payments
  where invoice_id = p_invoice_id
    and is_reversal = false
    and reversed_at is null;

  if v_active_payment_count > 0 then
    raise exception 'CANNOT_VOID_INVOICE_WITH_ACTIVE_PAYMENTS: Please reverse active payments before voiding the invoice.' using errcode = '23505';
  end if;

  -- Update invoice to voided
  update public.fee_invoices
  set status = 'voided',
      balance = 0,
      voided_at = v_now,
      voided_by = p_admin_user_id,
      void_reason = p_reason,
      updated_at = v_now
  where id = p_invoice_id;

  -- Audit log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    p_admin_user_id,
    p_actor_email,
    'invoice_voided',
    'fee_invoices',
    p_invoice_id,
    jsonb_build_object(
      'invoice_number', v_inv.invoice_number,
      'student_id', v_inv.student_id,
      'amount_due', v_inv.amount_due,
      'reason', p_reason
    )
  );

  return jsonb_build_object(
    'ok', true,
    'invoice_id', p_invoice_id,
    'invoice_number', v_inv.invoice_number,
    'status', 'voided'
  );
end;
$$;

revoke all on function public.void_fee_invoice_tx(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.void_fee_invoice_tx(uuid, text, uuid, text) to service_role;


-- ============================================================================
-- 11. RPC: Safe Student Permanent Deletion Check (delete_student_safe_tx)
-- ============================================================================
create or replace function public.delete_student_safe_tx(
  p_student_id uuid,
  p_admin_user_id uuid,
  p_actor_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_role text;
  v_invoice_count int;
  v_payment_count int;
  v_attendance_count int;
  v_student record;
begin
  -- 1. Verify owner authorization
  select role into v_admin_role from public.admin_users where id = p_admin_user_id;
  if v_admin_role is null or v_admin_role != 'owner' then
    raise exception 'ONLY_OWNER_CAN_PERMANENTLY_DELETE: Permanent deletion of student records is restricted to system owners only.' using errcode = '42501';
  end if;

  select * into v_student from public.students where id = p_student_id;
  if not found then
    raise exception 'STUDENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 2. Verify financial history
  select count(*) into v_invoice_count
  from public.fee_invoices
  where student_id = p_student_id;

  select count(*) into v_payment_count
  from public.fee_payments
  where student_id = p_student_id;

  -- 3. Verify attendance history
  select count(*) into v_attendance_count
  from public.class_attendance
  where student_id = p_student_id;

  if v_invoice_count > 0 or v_payment_count > 0 or v_attendance_count > 0 then
    raise exception 'STUDENT_HAS_OPERATIONAL_HISTORY: Cannot permanently delete student with financial or attendance history (% invoices, % payments, % attendance records). Please archive the student instead.'
      , v_invoice_count, v_payment_count, v_attendance_count using errcode = '23505';
  end if;

  -- 4. Clean up auxiliary tables with no financial impact
  delete from public.class_sessions where student_id = p_student_id;
  delete from public.recurring_class_schedules where student_id = p_student_id;
  delete from public.billing_plans where student_id = p_student_id;
  delete from public.enrollments where student_id = p_student_id;
  delete from public.crm_tasks where related_id = p_student_id::text;
  
  -- If linked to lead, unlink
  update public.admissions_requests
  set converted_student_id = null
  where converted_student_id = p_student_id;

  -- Delete student
  delete from public.students where id = p_student_id;

  -- Audit log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    p_admin_user_id,
    p_actor_email,
    'student_permanently_deleted',
    'students',
    p_student_id,
    jsonb_build_object(
      'student_id', v_student.student_id,
      'full_name', v_student.full_name,
      'email', v_student.email
    )
  );

  return jsonb_build_object(
    'ok', true,
    'deleted_student_id', p_student_id,
    'student_code', v_student.student_id
  );
end;
$$;

revoke all on function public.delete_student_safe_tx(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.delete_student_safe_tx(uuid, uuid, text) to service_role;


-- ============================================================================
-- 12. RPC: Archive Student (archive_student_tx)
-- ============================================================================
create or replace function public.archive_student_tx(
  p_student_id uuid,
  p_reason text,
  p_admin_user_id uuid,
  p_actor_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student record;
  v_now timestamptz := now();
begin
  select * into v_student from public.students where id = p_student_id;
  if not found then
    raise exception 'STUDENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  update public.students
  set status = 'archived',
      archived_at = v_now,
      archived_by = p_admin_user_id,
      archive_reason = coalesce(p_reason, 'Archived by administrator'),
      updated_at = v_now
  where id = p_student_id;

  -- Pause active enrollments & billing plans
  update public.enrollments set status = 'paused', updated_at = v_now where student_id = p_student_id and status = 'active';
  update public.billing_plans set status = 'paused', updated_at = v_now where student_id = p_student_id and status = 'active';
  update public.recurring_class_schedules set status = 'paused', is_active = false, updated_at = v_now where student_id = p_student_id and status = 'active';

  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    p_admin_user_id,
    p_actor_email,
    'student_archived',
    'students',
    p_student_id,
    jsonb_build_object(
      'student_id', v_student.student_id,
      'reason', p_reason
    )
  );

  return jsonb_build_object('ok', true, 'student_id', p_student_id, 'status', 'archived');
end;
$$;

revoke all on function public.archive_student_tx(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.archive_student_tx(uuid, text, uuid, text) to service_role;
