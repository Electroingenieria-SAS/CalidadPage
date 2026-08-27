alter table public.app_modules add column if not exists requires_identity_unlock boolean not null default false;
alter table public.documents add column if not exists requires_identity_unlock boolean not null default false;
alter table public.news_posts add column if not exists requires_identity_unlock boolean not null default false;
alter table public.audit_reports add column if not exists requires_identity_unlock boolean not null default false;
alter table public.publications add column if not exists requires_identity_unlock boolean not null default false;

create or replace function private.portal_apply_identity_lock()
returns trigger
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  lock_required boolean := false;
begin
  if new.category_id is not null then
    select (c.slug = 'solo-con-cedula' and c.is_active = true)
      into lock_required
    from public.categories c
    where c.id = new.category_id;
  end if;

  new.requires_identity_unlock := coalesce(lock_required,false);

  if new.requires_identity_unlock then
    if tg_table_name = 'app_modules' then
      new.url := '#';
      new.external_url := '#';
    elsif tg_table_name = 'audit_reports' then
      new.external_url := '#';
      new.file_url := '#';
      new.document_url := null;
      new.evidence_url := null;
    else
      new.external_url := '#';
      new.file_url := '#';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.portal_apply_identity_lock() from public, anon, authenticated;
