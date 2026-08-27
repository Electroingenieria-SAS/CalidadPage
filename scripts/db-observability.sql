-- Consultas de observabilidad. Ejecutar con una cuenta administrativa, nunca desde el navegador.
select query, calls, total_exec_time, mean_exec_time, rows
from pg_stat_statements
order by total_exec_time desc
limit 25;

select schemaname, relname, seq_scan, idx_scan, n_live_tup, n_dead_tup
from pg_stat_user_tables
order by n_dead_tup desc, seq_scan desc;

select now() as checked_at,
       (select count(*) from auth.users) as auth_users,
       (select count(*) from public.profiles) as profiles,
       (select count(*) from public.activity_log) as activity_events;
