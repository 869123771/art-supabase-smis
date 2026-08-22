begin;

create table if not exists public.smis_business_record (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.sys_tenant(id) on delete restrict,
  module_code text not null,
  record_no text not null,
  title text not null,
  status text not null default 'draft',
  owner_name text,
  business_date timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.sys_user(id) on delete set null,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now(),
  constraint smis_business_record_module_code_chk
    check (module_code ~ '^[a-z][a-z0-9-]*$'),
  constraint smis_business_record_payload_object_chk
    check (jsonb_typeof(payload) = 'object'),
  constraint smis_business_record_tenant_module_no_uk
    unique (tenant_id, module_code, record_no)
);

comment on table public.smis_business_record is
  'SMIS document-driven business records. Module-specific fields are retained in payload.';

create index if not exists idx_smis_business_record_tenant_module_update
  on public.smis_business_record (tenant_id, module_code, update_time desc);
create index if not exists idx_smis_business_record_payload
  on public.smis_business_record using gin (payload jsonb_path_ops);

create or replace function app_private.smis_current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select user_row.id
  from public.sys_user user_row
  where user_row.auth_user_id = (select auth.uid())
    and user_row.status = '1'
    and user_row.deleted_at is null
  limit 1
$$;

create or replace function app_private.smis_current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select user_row.tenant_id
  from public.sys_user user_row
  where user_row.auth_user_id = (select auth.uid())
    and user_row.status = '1'
    and user_row.deleted_at is null
  limit 1
$$;

create or replace function app_private.smis_has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app_private.is_platform_super(), false)
    or exists (
      select 1
      from public.sys_user user_row
      join public.sys_role role_row
        on role_row.role_code = any(coalesce(user_row.user_roles, array[]::text[]))
       and role_row.enabled
       and (role_row.tenant_id = user_row.tenant_id or role_row.tenant_id is null)
      join public.sys_role_menu role_menu on role_menu.role_id = role_row.id
      join public.sys_menu menu_row on menu_row.id = role_menu.menu_id
      where user_row.auth_user_id = (select auth.uid())
        and user_row.status = '1'
        and user_row.deleted_at is null
        and menu_row.name = p_permission
    )
$$;

alter table public.smis_business_record enable row level security;
alter table public.smis_business_record force row level security;

drop policy if exists smis_business_record_tenant_select on public.smis_business_record;
create policy smis_business_record_tenant_select
on public.smis_business_record
for select
to authenticated
using (tenant_id = app_private.smis_current_tenant_id());

revoke all on table public.smis_business_record from anon, authenticated;
grant select on table public.smis_business_record to authenticated;
grant all on table public.smis_business_record to service_role;

create or replace function public.smis_save_business_record(p_payload jsonb)
returns public.smis_business_record
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := app_private.smis_current_user_id();
  v_tenant_id uuid := app_private.smis_current_tenant_id();
  v_record_id uuid := nullif(p_payload->>'id', '')::uuid;
  v_result public.smis_business_record;
begin
  if v_user_id is null or v_tenant_id is null then
    raise exception 'Authentication and an active tenant are required';
  end if;

  if v_record_id is null then
    if not app_private.smis_has_permission('SmisCatalog:Add') then
      raise exception 'Missing permission: SmisCatalog:Add';
    end if;

    insert into public.smis_business_record (
      tenant_id, module_code, record_no, title, status, owner_name,
      business_date, payload, created_by
    )
    values (
      v_tenant_id,
      nullif(btrim(p_payload->>'module_code'), ''),
      nullif(btrim(p_payload->>'record_no'), ''),
      nullif(btrim(p_payload->>'title'), ''),
      coalesce(nullif(btrim(p_payload->>'status'), ''), 'draft'),
      nullif(btrim(p_payload->>'owner_name'), ''),
      nullif(p_payload->>'business_date', '')::timestamptz,
      coalesce(p_payload->'payload', '{}'::jsonb),
      v_user_id
    )
    returning * into v_result;
  else
    if not app_private.smis_has_permission('SmisCatalog:Edit') then
      raise exception 'Missing permission: SmisCatalog:Edit';
    end if;

    update public.smis_business_record target
    set module_code = nullif(btrim(p_payload->>'module_code'), ''),
        record_no = nullif(btrim(p_payload->>'record_no'), ''),
        title = nullif(btrim(p_payload->>'title'), ''),
        status = coalesce(nullif(btrim(p_payload->>'status'), ''), target.status),
        owner_name = nullif(btrim(p_payload->>'owner_name'), ''),
        business_date = nullif(p_payload->>'business_date', '')::timestamptz,
        payload = coalesce(p_payload->'payload', '{}'::jsonb),
        update_time = now()
    where target.id = v_record_id
      and target.tenant_id = v_tenant_id
    returning * into v_result;

    if v_result.id is null then
      raise exception 'SMIS business record was not found in the current tenant';
    end if;
  end if;

  return v_result;
end;
$$;

create or replace function public.smis_delete_business_record(p_record_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.smis_has_permission('SmisCatalog:Delete') then
    raise exception 'Missing permission: SmisCatalog:Delete';
  end if;

  delete from public.smis_business_record target
  where target.id = p_record_id
    and target.tenant_id = app_private.smis_current_tenant_id();

  if not found then
    raise exception 'SMIS business record was not found in the current tenant';
  end if;
end;
$$;

revoke all on function public.smis_save_business_record(jsonb) from public, anon;
revoke all on function public.smis_delete_business_record(uuid) from public, anon;
grant execute on function public.smis_save_business_record(jsonb) to authenticated, service_role;
grant execute on function public.smis_delete_business_record(uuid) to authenticated, service_role;

commit;
