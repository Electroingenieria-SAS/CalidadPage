# Arquitectura e inventario de servicios

## Inventario

| Servicio | Uso | ¿Se reemplaza al migrar hosting? | Configuración requerida |
|---|---|---|---|
| GitHub | Fuente de código y CI | No necesariamente | Repo, rama `main`, permisos del equipo |
| Vercel | Frontend Next.js y Route Handlers | Sí, si cambia el hosting | Build, Node 24.x, variables de entorno, dominio |
| Supabase Database | PostgreSQL | Depende | migraciones, RLS, índices, funciones |
| Supabase Auth | Usuarios y sesiones | Depende | providers, URLs, políticas, hooks, MFA/CAPTCHA opcional |
| Supabase Storage | Assets | Depende | buckets, MIME, tamaño, policies |
| Supabase Edge Functions | administración privilegiada | Depende | funciones y secretos server-side |
| Firebase | No utilizado en esta versión | No aplica | ninguna credencial requerida |

## Fronteras de confianza

- El navegador utiliza exclusivamente publishable key + JWT del usuario.
- Vercel no necesita `service_role` para los proxies actuales.
- Las Edge Functions reciben su `SUPABASE_SERVICE_ROLE_KEY` desde el entorno administrado por Supabase.
- RLS es la autoridad final para lectura de registros.
