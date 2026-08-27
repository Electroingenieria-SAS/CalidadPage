-- CALIDOSO TEAM / PAGE-CALIDAD
-- Hardening del flujo de administración de usuarios.
-- Estado: ya aplicado al proyecto zultnmgildejjskwdzgq el 2026-08-26.
-- Este archivo se conserva para reproducibilidad del repositorio.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_full_name text := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Usuario CALIDOSO TEAM'
  );
  v_role text;
  v_process_area text := nullif(btrim(new.raw_user_meta_data ->> 'process_area'), '');
begin
  -- Nunca usar raw_user_meta_data para autorización.
  -- Un alta normal nace como viewer. Los roles superiores se asignan
  -- únicamente desde la capa administrativa server-side.
  v_role := case
    when v_email = 'j.perez@ei.com.co' then 'super_admin'
    else 'viewer'
  end;

  insert into public.profiles (
    id, full_name, display_name, email, role, is_active, process_area
  )
  values (
    new.id, v_full_name, v_full_name, new.email, v_role, true, v_process_area
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    role = case
      when lower(excluded.email) = 'j.perez@ei.com.co' then 'super_admin'
      else public.profiles.role
    end,
    process_area = coalesce(public.profiles.process_area, excluded.process_area),
    is_active = true,
    updated_at = now();

  return new;
end;
$function$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Los usuarios autenticados pueden editar sus datos de perfil, pero nunca
-- elevar su propio rol ni reactivar/desactivar su cuenta desde PostgREST.
revoke update on table public.profiles from authenticated;

grant update (
  full_name,
  display_name,
  position,
  process,
  bio,
  avatar_url,
  accessible_mode,
  process_area,
  updated_at
) on table public.profiles to authenticated;
