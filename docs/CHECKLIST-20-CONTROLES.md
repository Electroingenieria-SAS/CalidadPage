# Checklist de los 20 controles solicitados

| # | Control | Estado de código | Nota |
|---:|---|---|---|
| 1 | Ocultar claves API | Implementado | no hay claves Supabase literales en el código |
| 2 | Eliminar secretos Git | Herramientas incluidas | scanner + `.gitignore`; el historial remoto debe limpiarse con acceso al repo |
| 3 | Nueva clave pública DB | Preparado | variable de entorno; rotación se hace en consola Supabase/Vercel |
| 4 | RLS alto | Implementado | tablas públicas + scopes por rol |
| 5 | Cifrar datos sensibles | Implementado por arquitectura | secretos fuera de tablas públicas; Vault recomendado si se agregan secretos DB |
| 6 | Autenticación servidor | Implementado en operaciones privilegiadas | JWT validado en Edge Functions |
| 7 | Restringir registros | Implementado | RLS por ID/categoría/tag |
| 8 | Bloquear campos | Implementado | rol/is_active con privilegios de columna y servidor |
| 9 | Cookies/sesión | Aplicable parcialmente | no se crean cookies propias; Supabase gestiona sesión cliente y JWT se revalida |
| 10 | Hash passwords | Implementado por Supabase Auth | bcrypt; no se guardan passwords propios |
| 11 | Máx. 5 intentos / 15 min | Preparado | requiere activar Password Verification Hook en Auth |
| 12 | Bots | Preparado | activar Turnstile/hCaptcha con credenciales |
| 13 | Monitor DB | Incluido | `scripts/db-observability.sql`, advisors/logs |
| 14 | Validar inputs | Implementado | formularios, proxies y Edge Functions |
| 15 | Escapar contenido | Implementado por React | no hay `dangerouslySetInnerHTML` |
| 16 | Uploads | Implementado | MIME/firma/tamaño/Storage RLS |
| 17 | Limitar API | Implementado | tamaños, acciones, timeout, no-store |
| 18 | Headers | Implementado | CSP/HSTS/etc. |
| 19 | HTTPS | Vercel | HSTS adicional |
| 20 | Dependencias | Implementado | Next 16.3.3, CI, Dependabot, npm audit |
