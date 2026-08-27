# Inventario de credenciales y rotación

Este archivo **no contiene valores reales**.

| Credencial | Servicio | Ubicación correcta | Permiso | ¿Exponer al navegador? | Rotación |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase | Vercel / `.env.local` | cliente sujeto a RLS | Sí, técnicamente pública | crear nueva → actualizar Vercel → probar → revocar anterior |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | secretos de Edge Function | bypass RLS/admin | **NO** | regenerar si se sospecha exposición |
| Secret key moderna `sb_secret_*` | Supabase | solo servidor | servidor privilegiado | **NO** | rotar desde API Keys |
| `TURNSTILE_SECRET_KEY` | CAPTCHA | Supabase Auth/proveedor | validación bot | **NO** | proveedor CAPTCHA |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CAPTCHA | Vercel | pública | Sí | proveedor CAPTCHA |
| GitHub token | GitHub | cuenta/Actions secrets | Git | **NO** | GitHub settings |
| SMTP password | proveedor correo | Supabase Auth SMTP | envío | **NO** | proveedor SMTP |

## Credenciales que deben regenerarse si alguna vez estuvieron en Git

- service role / secret key;
- tokens GitHub;
- claves SMTP;
- claves privadas;
- secretos CAPTCHA.

Una publishable key es diseñada para cliente, pero se recomienda rotarla si el objetivo de la entrega es cambiar de propietario o aislar ambientes.
