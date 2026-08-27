-- CALIDOSO TEAM — acceso por rol, contenido y etiquetas
-- Compatible con el esquema existente de zultnmgildejjskwdzgq.

alter table public.app_modules add column if not exists tags text[] not null default '{}'::text[];
alter table public.documents add column if not exists tags text[] not null default '{}'::text[];
alter table public.news_posts add column if not exists tags text[] not null default '{}'::text[];
alter table public.audit_reports add column if not exists tags text[] not null default '{}'::text[];
alter table public.publications add column if not exists tags text[] not null default '{}'::text[];

create table if not exists public.role_access_policies (
  role text primary key,
  can_access_portal boolean not null default true,
  can_view_home boolean not null default true,
  can_view_apps boolean not null default true,
  can_view_documents boolean not null default true,
  can_view_news boolean not null default true,
  can_view_audits boolean not null default true,
  can_view_publications boolean not null default true,
  updated_by uuid null references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint role_access_policies_role_check check (role = any (array[
    'super_admin','admin','calidad','auditoria','consulta','solicitante',
    'analista','jefe_auditoria','jefe_general','editor','viewer'
  ]::text[]))
);

create table if not exists public.role_content_scopes (
  role text not null,
  content_type text not null,
  allow_all boolean not null default true,
  allowed_record_ids uuid[] not null default '{}'::uuid[],
  allowed_category_ids uuid[] not null default '{}'::uuid[],
  allowed_tags text[] not null default '{}'::text[],
  updated_by uuid null references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (role, content_type),
  constraint role_content_scopes_role_check check (role = any (array[
    'super_admin','admin','calidad','auditoria','consulta','solicitante',
    'analista','jefe_auditoria','jefe_general','editor','viewer'
  ]::text[])),
  constraint role_content_scopes_type_check check (content_type = any (array[
    'app_modules','documents','news_posts','audit_reports','publications'
  ]::text[]))
);

alter table public.role_access_policies enable row level security;
alter table public.role_content_scopes enable row level security;

revoke all on table public.role_access_policies from anon, public;
revoke all on table public.role_content_scopes from anon, public;
grant select on table public.role_access_policies to authenticated;
grant select on table public.role_content_scopes to authenticated;

-- Todas las cuentas conocidas nacen con el mismo acceso que tenían antes.
-- El super_admin puede restringir cada rol desde el panel sin romper la operación actual.
insert into public.role_access_policies (role)
select role_name
from unnest(array[
  'super_admin','admin','calidad','auditoria','consulta','solicitante',
  'analista','jefe_auditoria','jefe_general','editor','viewer'
]::text[]) as role_name
on conflict (role) do nothing;

insert into public.role_content_scopes (role, content_type, allow_all)
select role_name, content_type, true
from unnest(array[
  'super_admin','admin','calidad','auditoria','consulta','solicitante',
  'analista','jefe_auditoria','jefe_general','editor','viewer'
]::text[]) as role_name
cross join unnest(array[
  'app_modules','documents','news_posts','audit_reports','publications'
]::text[]) as content_type
on conflict (role, content_type) do nothing;

-- El rol super_admin no puede ser limitado por configuración accidental.
update public.role_access_policies
set can_access_portal=true, can_view_home=true, can_view_apps=true,
    can_view_documents=true, can_view_news=true, can_view_audits=true,
    can_view_publications=true
where role='super_admin';

update public.role_content_scopes
set allow_all=true, allowed_record_ids='{}'::uuid[],
    allowed_category_ids='{}'::uuid[], allowed_tags='{}'::text[]
where role='super_admin';

create or replace function private.portal_can_view_module(module_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_access_policies a on a.role = p.role
    where p.id = (select auth.uid())
      and p.is_active is true
      and a.can_access_portal is true
      and (
        p.role = 'super_admin'
        or case module_key
          when 'inicio' then a.can_view_home
          when 'apps' then a.can_view_apps
          when 'documentos' then a.can_view_documents
          when 'noticias' then a.can_view_news
          when 'auditorias' then a.can_view_audits
          when 'publicaciones' then a.can_view_publications
          else false
        end
      )
  );
$$;

create or replace function private.portal_can_read_scoped(
  p_content_type text,
  p_record_id uuid,
  p_category_id uuid,
  p_tags text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_access_policies a on a.role = p.role
    join public.role_content_scopes s
      on s.role = p.role and s.content_type = p_content_type
    where p.id = (select auth.uid())
      and p.is_active is true
      and a.can_access_portal is true
      and (
        p.role = 'super_admin'
        or (
          case p_content_type
            when 'app_modules' then a.can_view_apps
            when 'documents' then a.can_view_documents
            when 'news_posts' then a.can_view_news
            when 'audit_reports' then a.can_view_audits
            when 'publications' then a.can_view_publications
            else false
          end
          and (
            s.allow_all is true
            or p_record_id = any(s.allowed_record_ids)
            or (p_category_id is not null and p_category_id = any(s.allowed_category_ids))
            or (coalesce(p_tags, '{}'::text[]) && s.allowed_tags)
          )
        )
      )
  );
$$;

revoke all on function private.portal_can_view_module(text) from public, anon;
revoke all on function private.portal_can_read_scoped(text,uuid,uuid,text[]) from public, anon;
grant execute on function private.portal_can_view_module(text) to authenticated;
grant execute on function private.portal_can_read_scoped(text,uuid,uuid,text[]) to authenticated;

-- Matriz: cada usuario solo consulta las reglas de su rol. El super admin consulta todo.
drop policy if exists role_access_select on public.role_access_policies;
drop policy if exists role_access_write on public.role_access_policies;
create policy role_access_select on public.role_access_policies
for select to authenticated
using (role = public.current_user_role() or public.is_super_admin());
create policy role_access_write on public.role_access_policies
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin() and role <> 'super_admin');

drop policy if exists role_scope_select on public.role_content_scopes;
drop policy if exists role_scope_write on public.role_content_scopes;
create policy role_scope_select on public.role_content_scopes
for select to authenticated
using (role = public.current_user_role() or public.is_super_admin());
create policy role_scope_write on public.role_content_scopes
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin() and role <> 'super_admin');

-- El portal pasa a ser privado: no se entrega contenido antes del login.
revoke all on table public.activity_log from anon;
revoke all on table public.app_modules from anon;
revoke all on table public.audio_guides from anon;
revoke all on table public.audit_reports from anon;
revoke all on table public.banners from anon;
revoke all on table public.categories from anon;
revoke all on table public.comments from anon;
revoke all on table public.compliments from anon;
revoke all on table public.documents from anon;
revoke all on table public.mascot_items from anon;
revoke all on table public.news_posts from anon;
revoke all on table public.notifications from anon;
revoke all on table public.popups from anon;
revoke all on table public.profiles from anon;
revoke all on table public.publications from anon;
revoke all on table public.reactions from anon;
revoke all on table public.system_settings from anon;
revoke all on table public.team_members from anon;

-- Lectura explícita para usuarios autenticados en recursos comunes del portal.
grant select on public.banners, public.categories, public.audio_guides,
  public.mascot_items, public.team_members, public.system_settings to authenticated;
grant select on public.app_modules, public.documents, public.news_posts,
  public.audit_reports, public.publications to authenticated;

-- RLS real por módulo + registro/categoría/etiqueta.
drop policy if exists app_modules_public_read on public.app_modules;
drop policy if exists app_modules_anon_read on public.app_modules;
drop policy if exists app_modules_authenticated_read on public.app_modules;
drop policy if exists app_modules_authenticated_scoped on public.app_modules;
create policy app_modules_authenticated_scoped on public.app_modules
for select to authenticated
using (
  private.portal_can_read_scoped('app_modules', id, category_id, tags)
  and public.can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

drop policy if exists documents_public_read on public.documents;
drop policy if exists documents_anon_read on public.documents;
drop policy if exists documents_authenticated_read on public.documents;
drop policy if exists documents_authenticated_scoped on public.documents;
create policy documents_authenticated_scoped on public.documents
for select to authenticated
using (
  private.portal_can_read_scoped('documents', id, category_id, tags)
  and public.can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

drop policy if exists news_posts_public_read on public.news_posts;
drop policy if exists news_posts_anon_read on public.news_posts;
drop policy if exists news_posts_authenticated_read on public.news_posts;
drop policy if exists news_posts_authenticated_scoped on public.news_posts;
create policy news_posts_authenticated_scoped on public.news_posts
for select to authenticated
using (
  private.portal_can_read_scoped('news_posts', id, category_id, tags)
  and public.can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

drop policy if exists audit_reports_public_read on public.audit_reports;
drop policy if exists audit_reports_anon_read on public.audit_reports;
drop policy if exists audit_reports_authenticated_read on public.audit_reports;
drop policy if exists audit_reports_authenticated_scoped on public.audit_reports;
create policy audit_reports_authenticated_scoped on public.audit_reports
for select to authenticated
using (
  private.portal_can_read_scoped('audit_reports', id, null::uuid, tags)
  and public.can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

drop policy if exists publications_public_read on public.publications;
drop policy if exists publications_anon_read on public.publications;
drop policy if exists publications_authenticated_read on public.publications;
drop policy if exists publications_authenticated_scoped on public.publications;
create policy publications_authenticated_scoped on public.publications
for select to authenticated
using (
  private.portal_can_read_scoped('publications', id, null::uuid, tags)
  and public.can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

-- Los reconocimientos también requieren una identidad del portal.
drop policy if exists compliments_insert_public on public.compliments;
create policy compliments_insert_authenticated on public.compliments
for insert to authenticated
with check (
  (select private.portal_is_active())
  and created_by = (select auth.uid())
  and rating between 1 and 5
  and char_length(coalesce(message,'')) between 1 and 1000
  and char_length(coalesce(sender_name,'')) <= 150
  and char_length(coalesce(sender_email,'')) <= 320
);

grant select, insert on public.compliments to authenticated;

-- Índices de apoyo para filtros de etiquetas.
create index if not exists app_modules_tags_gin on public.app_modules using gin(tags);
create index if not exists documents_tags_gin on public.documents using gin(tags);
create index if not exists news_posts_tags_gin on public.news_posts using gin(tags);
create index if not exists audit_reports_tags_gin on public.audit_reports using gin(tags);
create index if not exists publications_tags_gin on public.publications using gin(tags);
