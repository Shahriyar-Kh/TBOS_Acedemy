-- Correct schema drift from the already-applied initial migration.
-- Refuse conversion if invalid non-empty age values exist.

do $$
begin
  if exists (
    select 1
    from public.admissions_requests
    where age is not null
      and btrim(age) <> ''
      and not (
        btrim(age) ~ '^[0-9]{1,3}$'
        and btrim(age)::integer between 4 and 120
      )
  ) then
    raise exception 'Cannot convert admissions_requests.age to smallint because invalid age values exist';
  end if;
end
$$;

alter table public.admissions_requests
  alter column age type smallint
  using nullif(btrim(age), '')::smallint;

alter table public.admissions_requests
  drop constraint if exists admissions_requests_age_check;

alter table public.admissions_requests
  add constraint admissions_requests_age_check
  check (age is null or age between 4 and 120);
