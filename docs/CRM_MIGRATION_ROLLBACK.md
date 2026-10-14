# Phase 16 CRM Migration Rollback Guide

**Migration File**: `supabase/migrations/20261014000000_phase16_academy_crm.sql`  
**Target Environment**: Supabase PostgreSQL  
**Rollback Date**: October 2026  

---

## 1. Safety Notice Before Rollback

> [!WARNING]
> Running this rollback script will drop the newly created Phase 16 CRM tables, procedures, and sequence counters.  
> It will NOT drop or affect pre-existing TBOS production tables (`admissions_requests`, `admissions_activity`, `admissions_delivery_log`, `admin_users`).

Before running a rollback on any staging or production database, always generate a complete database dump:
```bash
supabase db dump -f pre_rollback_backup.sql
```

---

## 2. Rollback SQL Script

Execute the following script via Supabase SQL Editor or `psql` to completely roll back all Phase 16 changes:

```sql
-- ==============================================================================
-- PHASE 16 CRM ROLLBACK SCRIPT
-- ==============================================================================

-- 1. Drop Triggers & Functions
drop trigger if exists trg_protect_final_active_owner on public.admin_users;
drop function if exists public.protect_final_active_owner();
drop function if exists public.record_payment_tx(uuid, uuid, numeric, text, date, text, text, uuid, text, text);
drop function if exists public.convert_lead_to_student_tx(uuid, text, text, text, numeric, uuid, uuid, text, numeric, int, date, text, text, boolean, uuid, text);
drop function if exists public.get_next_receipt_number(timestamptz);
drop function if exists public.get_next_invoice_number(timestamptz);
drop function if exists public.get_next_student_id(int);
drop function if exists public.get_next_crm_sequence(text);

-- 2. Drop Phase 16 Tables (in reverse dependency order)
drop table if exists public.crm_reminders cascade;
drop table if exists public.crm_rate_limits cascade;
drop table if exists public.admin_invitations cascade;
drop table if exists public.crm_sequences cascade;
drop table if exists public.password_reset_tokens cascade;
drop table if exists public.crm_audit_logs cascade;
drop table if exists public.message_logs cascade;
drop table if exists public.message_templates cascade;
drop table if exists public.crm_notifications cascade;
drop table if exists public.crm_tasks cascade;
drop table if exists public.instructor_availability cascade;
drop table if exists public.class_attendance cascade;
drop table if exists public.class_sessions cascade;
drop table if exists public.fee_payments cascade;
drop table if exists public.fee_invoices cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.batches cascade;
drop table if exists public.students cascade;

-- 3. Revert admin_users columns and constraints
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('owner', 'admin', 'admissions'));

alter table public.admin_users
  drop column if exists full_name,
  drop column if exists phone;

-- ==============================================================================
-- ROLLBACK COMPLETE
-- ==============================================================================
```

---

## 3. Verification Post-Rollback

Confirm that core tables are intact and responsive:
```sql
select count(*) from public.admin_users;
select count(*) from public.admissions_requests;
```

