-- Diagnóstico de solo lectura. No modifica datos.

select
  (select count(*) from public.app_modules) as apps,
  (select count(*) from public.news_posts) as noticias,
  (select count(*) from public.audit_reports) as auditorias,
  (select count(*) from public.documents) as documentos,
  (select count(*) from public.publications) as publicaciones,
  (select count(*) from public.compliments) as reconocimientos,
  (select count(*) from public.profiles) as perfiles;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
    'profiles',
    'system_settings',
    'app_modules',
    'news_posts',
    'audit_reports',
    'documents',
    'publications',
    'compliments',
    'objects'
  )
order by schemaname, tablename, policyname;

select setting_key, updated_at, updated_by
from public.system_settings
where setting_key = 'portal_home_settings_v6';

select id, email, full_name, role, is_active, process_area
from public.profiles
order by role, full_name nulls last;
