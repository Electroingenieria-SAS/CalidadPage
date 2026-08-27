begin;

-- Ejecutar una sola vez después de crear o confirmar la cuenta en Authentication.
-- El correo coincide con la configuración histórica del portal.
insert into public.profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  process_area,
  accessible_mode,
  created_at,
  updated_at
)
select
  u.id,
  lower(u.email),
  'Juan Esteban Pérez',
  'super_admin',
  true,
  'Calidad y Mejoramiento Continuo',
  false,
  now(),
  now()
from auth.users u
where lower(u.email) = 'j.perez@ei.com.co'
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = 'super_admin',
  is_active = true,
  process_area = excluded.process_area,
  updated_at = now();

commit;

select id, email, full_name, role, is_active, process_area
from public.profiles
where lower(email) = 'j.perez@ei.com.co';
