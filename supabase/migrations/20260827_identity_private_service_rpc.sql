create or replace function public.portal_identity_secret_get(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = private, pg_temp
as $$
  select document_hmac from private.portal_identity_secrets where user_id = p_user_id;
$$;

create or replace function public.portal_identity_secret_set(p_user_id uuid, p_hmac text, p_updated_by uuid)
returns void
language plpgsql
security definer
set search_path = private, pg_temp
as $$
begin
  insert into private.portal_identity_secrets(user_id, document_hmac, updated_by, updated_at)
  values (p_user_id, p_hmac, p_updated_by, now())
  on conflict (user_id) do update
    set document_hmac = excluded.document_hmac,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.portal_identity_secret_delete(p_user_id uuid)
returns void
language sql
security definer
set search_path = private, pg_temp
as $$
  delete from private.portal_identity_secrets where user_id = p_user_id;
$$;

create or replace function public.portal_identity_failure_count(p_user_id uuid, p_since timestamptz)
returns bigint
language sql
stable
security definer
set search_path = private, pg_temp
as $$
  select count(*)::bigint
  from private.portal_identity_failures
  where user_id = p_user_id and failed_at >= p_since;
$$;

create or replace function public.portal_identity_failure_add(p_user_id uuid)
returns void
language sql
security definer
set search_path = private, pg_temp
as $$
  insert into private.portal_identity_failures(user_id, failed_at) values (p_user_id, now());
$$;

create or replace function public.portal_identity_failure_clear(p_user_id uuid)
returns void
language sql
security definer
set search_path = private, pg_temp
as $$
  delete from private.portal_identity_failures where user_id = p_user_id;
$$;

create or replace function public.portal_protected_target_get(p_content_type text, p_record_id uuid)
returns text
language sql
stable
security definer
set search_path = private, pg_temp
as $$
  select target_url
  from private.portal_protected_targets
  where content_type = p_content_type and record_id = p_record_id;
$$;

create or replace function public.portal_protected_target_set(p_content_type text, p_record_id uuid, p_target_url text, p_updated_by uuid)
returns void
language plpgsql
security definer
set search_path = private, pg_temp
as $$
begin
  insert into private.portal_protected_targets(content_type, record_id, target_url, updated_by, updated_at)
  values (p_content_type, p_record_id, p_target_url, p_updated_by, now())
  on conflict (content_type, record_id) do update
    set target_url = excluded.target_url,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.portal_protected_target_delete(p_content_type text, p_record_id uuid)
returns void
language sql
security definer
set search_path = private, pg_temp
as $$
  delete from private.portal_protected_targets
  where content_type = p_content_type and record_id = p_record_id;
$$;

revoke all on function public.portal_identity_secret_get(uuid) from public, anon, authenticated;
revoke all on function public.portal_identity_secret_set(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.portal_identity_secret_delete(uuid) from public, anon, authenticated;
revoke all on function public.portal_identity_failure_count(uuid,timestamptz) from public, anon, authenticated;
revoke all on function public.portal_identity_failure_add(uuid) from public, anon, authenticated;
revoke all on function public.portal_identity_failure_clear(uuid) from public, anon, authenticated;
revoke all on function public.portal_protected_target_get(text,uuid) from public, anon, authenticated;
revoke all on function public.portal_protected_target_set(text,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.portal_protected_target_delete(text,uuid) from public, anon, authenticated;

grant execute on function public.portal_identity_secret_get(uuid) to service_role;
grant execute on function public.portal_identity_secret_set(uuid,text,uuid) to service_role;
grant execute on function public.portal_identity_secret_delete(uuid) to service_role;
grant execute on function public.portal_identity_failure_count(uuid,timestamptz) to service_role;
grant execute on function public.portal_identity_failure_add(uuid) to service_role;
grant execute on function public.portal_identity_failure_clear(uuid) to service_role;
grant execute on function public.portal_protected_target_get(text,uuid) to service_role;
grant execute on function public.portal_protected_target_set(text,uuid,text,uuid) to service_role;
grant execute on function public.portal_protected_target_delete(text,uuid) to service_role;
