create schema if not exists private;

create table if not exists private.portal_identity_secrets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document_hmac text not null,
  updated_by uuid null references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists private.portal_protected_targets (
  content_type text not null check (content_type in ('app_modules','documents','news_posts','audit_reports','publications')),
  record_id uuid not null,
  target_url text not null,
  updated_by uuid null references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (content_type, record_id)
);

revoke all on private.portal_identity_secrets from public, anon, authenticated;
revoke all on private.portal_protected_targets from public, anon, authenticated;

alter table public.audit_reports add column if not exists category_id uuid null references public.categories(id) on delete set null;
alter table public.publications add column if not exists category_id uuid null references public.categories(id) on delete set null;
create index if not exists audit_reports_category_id_idx on public.audit_reports(category_id);
create index if not exists publications_category_id_idx on public.publications(category_id);

drop policy if exists audit_reports_authenticated_scoped on public.audit_reports;
drop policy if exists publications_authenticated_scoped on public.publications;

create policy audit_reports_authenticated_scoped on public.audit_reports
for select to authenticated
using (
  private.portal_can_read_scoped('audit_reports', id, category_id, tags)
  and can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

create policy publications_authenticated_scoped on public.publications
for select to authenticated
using (
  private.portal_can_read_scoped('publications', id, category_id, tags)
  and can_read_by_visibility(coalesce(visibility,'interna'), allowed_roles)
);

insert into public.categories (name, slug, description, module, is_active, updated_at)
values
 ('Logística','logistica','Contenido del proceso de logística.','general',true,now()),
 ('Ventas','ventas','Contenido del proceso comercial y de ventas.','general',true,now()),
 ('Cartera','cartera','Contenido del proceso de cartera.','general',true,now()),
 ('Compras','compras','Contenido del proceso de compras.','general',true,now()),
 ('Gestión Documental','gestion-documental','Contenido de gestión documental.','general',true,now()),
 ('SST','sst','Contenido de Seguridad y Salud en el Trabajo.','general',true,now()),
 ('RRHH','rrhh','Contenido de Recursos Humanos.','general',true,now()),
 ('Sistemas','sistemas','Contenido de sistemas y tecnología.','general',true,now()),
 ('Jurídico','juridico','Contenido jurídico.','general',true,now()),
 ('Auditoría','auditoria','Contenido de auditoría.','general',true,now()),
 ('General','general','Contenido transversal o general.','general',true,now()),
 ('Privado','privado','Contenido privado o de circulación restringida.','general',true,now()),
 ('Solo con cédula','solo-con-cedula','Contenido protegido con verificación adicional de cédula.','general',true,now())
on conflict (slug) do update set
  name=excluded.name,
  description=excluded.description,
  module=excluded.module,
  is_active=true,
  updated_at=now();

update public.categories
set is_active=false, updated_at=now()
where slug not in (
  'logistica','ventas','cartera','compras','gestion-documental','sst','rrhh',
  'sistemas','juridico','auditoria','general','privado','solo-con-cedula'
);
