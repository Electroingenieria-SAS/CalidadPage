begin;

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- 1. Perfiles y autorización
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  role text not null default 'viewer',
  is_active boolean not null default true,
  process_area text,
  accessible_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'viewer';
alter table public.profiles add column if not exists is_active boolean default true;
alter table public.profiles add column if not exists process_area text;
alter table public.profiles add column if not exists accessible_mode boolean default false;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (
  role in ('super_admin','admin','calidad','auditoria','consulta','solicitante','analista','jefe_auditoria','jefe_general','editor','viewer')
);

create or replace function private.portal_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = any(required_roles)
  );
$$;

revoke all on function private.portal_has_role(text[]) from public, anon;
grant execute on function private.portal_has_role(text[]) to authenticated;

-- 2. Tablas principales del repositorio. No se elimina ni reemplaza información existente.
create table if not exists public.system_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_modules (
  id uuid primary key default gen_random_uuid(),
  title text,
  name text,
  description text,
  slug text,
  url text,
  external_url text,
  image_url text,
  icon_url text,
  status text default 'activa',
  visibility text default 'interna',
  is_active boolean default true,
  is_featured boolean default true,
  creator_name text,
  creator_role text,
  creator_credit text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text,
  name text,
  description text,
  content text,
  slug text,
  image_url text,
  file_url text,
  external_url text,
  status text default 'publicado',
  visibility text default 'interna',
  is_active boolean default true,
  is_featured boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audit_reports (like public.news_posts including all);
create table if not exists public.documents (like public.news_posts including all);
create table if not exists public.publications (like public.news_posts including all);

-- Alinea instalaciones históricas sin borrar ni recrear tablas existentes.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['app_modules','news_posts','audit_reports','documents','publications']
  loop
    execute format('alter table public.%I add column if not exists title text', table_name);
    execute format('alter table public.%I add column if not exists name text', table_name);
    execute format('alter table public.%I add column if not exists description text', table_name);
    execute format('alter table public.%I add column if not exists slug text', table_name);
    execute format('alter table public.%I add column if not exists external_url text', table_name);
    execute format('alter table public.%I add column if not exists image_url text', table_name);
    execute format('alter table public.%I add column if not exists status text', table_name);
    execute format('alter table public.%I add column if not exists visibility text', table_name);
    execute format('alter table public.%I add column if not exists is_active boolean default true', table_name);
    execute format('alter table public.%I add column if not exists is_featured boolean default true', table_name);
    execute format('alter table public.%I add column if not exists created_at timestamptz default now()', table_name);
    execute format('alter table public.%I add column if not exists updated_at timestamptz default now()', table_name);
  end loop;
end $$;

alter table public.app_modules add column if not exists url text;
alter table public.app_modules add column if not exists icon_url text;
alter table public.app_modules add column if not exists creator_name text;
alter table public.app_modules add column if not exists creator_role text;
alter table public.app_modules add column if not exists creator_credit text;
alter table public.news_posts add column if not exists content text;
alter table public.news_posts add column if not exists file_url text;
alter table public.audit_reports add column if not exists content text;
alter table public.audit_reports add column if not exists file_url text;
alter table public.documents add column if not exists content text;
alter table public.documents add column if not exists file_url text;
alter table public.publications add column if not exists content text;
alter table public.publications add column if not exists file_url text;
alter table public.publications add column if not exists publication_type text default 'novedad';

create table if not exists public.compliments (
  id uuid primary key default gen_random_uuid(),
  team_member_id text,
  team_member_name text,
  rating integer check (rating between 1 and 5),
  message text,
  sender_name text,
  sender_email text,
  created_by uuid,
  created_at timestamptz default now()
);

-- 3. RLS. Se retiran políticas históricas demasiado amplias.
alter table public.profiles enable row level security;
alter table public.system_settings enable row level security;
alter table public.app_modules enable row level security;
alter table public.news_posts enable row level security;
alter table public.audit_reports enable row level security;
alter table public.documents enable row level security;
alter table public.publications enable row level security;
alter table public.compliments enable row level security;

drop policy if exists "profiles_authenticated_select" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or private.portal_has_role(array['super_admin','admin']));

drop policy if exists "system_settings_select_all" on public.system_settings;
drop policy if exists "system_settings_authenticated_all" on public.system_settings;
drop policy if exists "system_settings_admin_manage" on public.system_settings;
drop policy if exists "system_settings_portal_write" on public.system_settings;
drop policy if exists "system_settings_public_read" on public.system_settings;
drop policy if exists "system_settings_managers_write" on public.system_settings;
create policy "system_settings_public_read" on public.system_settings
for select to anon, authenticated using (true);
create policy "system_settings_managers_write" on public.system_settings
for all to authenticated
using (private.portal_has_role(array['super_admin','admin']))
with check (private.portal_has_role(array['super_admin','admin']));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['app_modules','news_posts','audit_reports','documents','publications']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_select_all', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_authenticated_all', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_public_read', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_managers_write', table_name);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', table_name || '_public_read', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.portal_has_role(array[''super_admin'',''admin'',''editor''])) with check (private.portal_has_role(array[''super_admin'',''admin'',''editor'']))',
      table_name || '_managers_write', table_name
    );
  end loop;
end $$;

drop policy if exists "compliments_select_authenticated" on public.compliments;
drop policy if exists "compliments_select_public" on public.compliments;
drop policy if exists "compliments_insert_public" on public.compliments;
drop policy if exists "compliments_insert_authenticated" on public.compliments;
drop policy if exists "compliments_admin_read" on public.compliments;
drop policy if exists "compliments_super_admin_read" on public.compliments;
drop policy if exists "compliments_managers_delete" on public.compliments;
create policy "compliments_select_public" on public.compliments
for select to anon, authenticated using (true);
create policy "compliments_insert_public" on public.compliments
for insert to anon, authenticated with check (rating between 1 and 5 and char_length(coalesce(message,'')) <= 1000);
create policy "compliments_managers_delete" on public.compliments
for delete to authenticated using (private.portal_has_role(array['super_admin','admin']));

-- 4. Funciones compatibles con la clave histórica portal_home_settings_v6.
create or replace function public.portal_get_home_settings()
returns jsonb
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select coalesce((select setting_value from public.system_settings where setting_key = 'portal_home_settings_v6'), '{}'::jsonb);
$$;

create or replace function public.portal_save_home_settings(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  insert into public.system_settings(setting_key, setting_value, description, updated_by, updated_at)
  values ('portal_home_settings_v6', payload, 'Configuración global del Repositorio de Apps Calidad', auth.uid(), now())
  on conflict (setting_key) do update set
    setting_value = excluded.setting_value,
    description = excluded.description,
    updated_by = excluded.updated_by,
    updated_at = now();
  return payload;
end;
$$;

grant execute on function public.portal_get_home_settings() to anon, authenticated;
grant execute on function public.portal_save_home_settings(jsonb) to authenticated;

-- 5. Data API y Storage.
grant select on public.system_settings, public.app_modules, public.news_posts, public.audit_reports, public.documents, public.publications, public.compliments to anon, authenticated;
grant insert, update, delete on public.system_settings, public.app_modules, public.news_posts, public.audit_reports, public.documents, public.publications to authenticated;
grant insert on public.compliments to anon, authenticated;
grant delete on public.compliments to authenticated;
grant select on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('portal-assets', 'portal-assets', true, 62914560)
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit;

drop policy if exists "portal_assets_public_read" on storage.objects;
drop policy if exists "portal_assets_authenticated_insert" on storage.objects;
drop policy if exists "portal_assets_authenticated_update" on storage.objects;
drop policy if exists "portal_assets_authenticated_delete" on storage.objects;
drop policy if exists "portal_assets_public_insert" on storage.objects;
drop policy if exists "portal_assets_public_update" on storage.objects;
drop policy if exists "portal_assets_public_delete" on storage.objects;
drop policy if exists "portal_assets_admin_insert" on storage.objects;
drop policy if exists "portal_assets_admin_update" on storage.objects;
drop policy if exists "portal_assets_admin_delete" on storage.objects;
drop policy if exists "portal_assets_super_admin_insert" on storage.objects;
drop policy if exists "portal_assets_super_admin_update" on storage.objects;
drop policy if exists "portal_assets_super_admin_delete" on storage.objects;
drop policy if exists "portal_assets_managers_insert" on storage.objects;
drop policy if exists "portal_assets_managers_update" on storage.objects;
drop policy if exists "portal_assets_managers_delete" on storage.objects;
create policy "portal_assets_public_read" on storage.objects
for select to anon, authenticated using (bucket_id = 'portal-assets');
create policy "portal_assets_managers_insert" on storage.objects
for insert to authenticated with check (bucket_id = 'portal-assets' and private.portal_has_role(array['super_admin','admin','editor']));
create policy "portal_assets_managers_update" on storage.objects
for update to authenticated
using (bucket_id = 'portal-assets' and private.portal_has_role(array['super_admin','admin','editor']))
with check (bucket_id = 'portal-assets' and private.portal_has_role(array['super_admin','admin','editor']));
create policy "portal_assets_managers_delete" on storage.objects
for delete to authenticated using (bucket_id = 'portal-assets' and private.portal_has_role(array['super_admin','admin','editor']));

notify pgrst, 'reload schema';
commit;
