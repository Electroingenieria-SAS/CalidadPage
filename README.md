# CALIDOSO TEAM — PAGE-CALIDAD

Repositorio institucional de Apps, documentos, noticias, auditorías y publicaciones del equipo de Calidad y Mejoramiento Continuo.

Esta versión está preparada para operación privada con autenticación obligatoria, control granular de acceso por rol y despliegue continuo **GitHub → Vercel**, usando **Supabase** como base de datos, autenticación, RLS, Storage y Edge Functions.

> **Importante:** no existen secretos válidos dentro del repositorio. Las claves se suministran por variables de entorno.

## 1. Estado de esta entrega

- Frontend: Next.js App Router + React.
- Hosting/API: Vercel.
- Datos/Auth/Storage: Supabase.
- Edge Functions: `portal-user-admin` y `portal-access-admin`.
- Juego Paco: conservado.
- Hero/libreta y assets: conservados.
- Login inicial: obligatorio antes de montar la aplicación.
- Matriz de acceso por rol: incorporada.
- Etiquetas de contenido: incorporadas a Apps, documentos, noticias, auditorías y publicaciones.
- RLS: reforzado para aplicar permisos por módulo y por contenido.
- Firebase: **no se utiliza en esta versión**.
- Next.js: `16.3.3`.

## 2. Arquitectura

```text
Navegador
   │
   ├── Supabase Auth ────────────── autenticación/sesión
   │
   ├── Data API de Supabase ────── SELECT/INSERT/UPDATE protegidos por RLS
   │
   └── /api/* en Vercel
          │
          ├── /api/portal-user-admin
          │       └── Edge Function portal-user-admin
          │
          └── /api/portal-access-admin
                  └── Edge Function portal-access-admin

GitHub main ──► Vercel Production
```

Las operaciones de alto privilegio no reciben `service_role` en el navegador. La clave privilegiada permanece exclusivamente en el entorno de las Edge Functions de Supabase.

## 3. Login privado

La aplicación ya no presenta primero el portal público. El flujo es:

1. La aplicación valida si existe una sesión de Supabase.
2. Si no existe, se renderiza únicamente `LoginGate`.
3. Si existe, se consulta `profiles` y la política de acceso correspondiente al rol.
4. Solo si la cuenta está activa y `can_access_portal=true` se cargan settings, colecciones y reconocimientos.
5. La navegación muestra únicamente los módulos permitidos.
6. Supabase vuelve a validar el acceso mediante RLS, por lo que modificar React o la URL no evita la autorización de base de datos.

## 4. Matriz de permisos

El super admin dispone de **Administración → Accesos**.

Para cada rol puede controlar:

- entrada general al portal;
- Inicio;
- Apps;
- Documentos;
- Noticias;
- Auditorías;
- Publicaciones.

Para cada tipo de contenido puede elegir:

- **Ver todo el módulo**; o
- autorizar **registros concretos**;
- autorizar **categorías**;
- autorizar **etiquetas**.

Cuando `allow_all=false`, un registro se muestra si coincide al menos con uno de los registros, categorías o tags permitidos.

El rol `super_admin` mantiene acceso total por diseño para evitar un autobloqueo irreversible.

## 5. Etiquetas

Los siguientes tipos poseen ahora `tags text[]`:

- `app_modules`
- `documents`
- `news_posts`
- `audit_reports`
- `publications`

Cada contenido nuevo exige al menos una etiqueta. Las etiquetas base son:

| Tipo | Etiqueta base |
|---|---|
| App | `app` |
| Documento | `documento` |
| Noticia | `noticia` |
| Auditoría | `auditoria` |
| Publicación | `publicacion` |

Se recomienda agregar etiquetas semánticas como `calidad`, `logística`, `rrhh`, `indicadores`, `auditoria-interna`, etc.

## 6. Requisitos

- Node.js 24.x
- npm
- acceso al repositorio Git
- proyecto Supabase compatible
- proyecto Vercel

## 7. Variables de entorno

Copiar `.env.example` a `.env.local` para desarrollo:

```bash
cp .env.example .env.local
```

Variables obligatorias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No colocar jamás en variables `NEXT_PUBLIC_*`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `sb_secret_*`
- secretos CAPTCHA
- claves SMTP
- tokens GitHub
- claves privadas

## 8. Instalación local

```bash
npm ci
npm run preflight
npm run dev
```

Abrir `http://localhost:3000`.

## 9. Verificación antes de entregar

```bash
npm run scan:secrets
npm run lint
npm run typecheck
npm audit --audit-level=high
npm run build
```

O ejecutar:

```bash
npm run verify
```

## 10. Supabase

Proyecto de producción documentado para esta versión:

- Project ref: `zultnmgildejjskwdzgq`
- Edge Function usuarios: `portal-user-admin`
- Edge Function permisos: `portal-access-admin`

Migraciones nuevas incluidas:

- `supabase/migrations/20260827_role_access_and_tags.sql`
- `supabase/migrations/20260827_seed_base_content_tags.sql`

Las migraciones están aplicadas en el proyecto actual. En una instalación nueva deben ejecutarse siguiendo el orden histórico del repositorio.

## 11. Vercel

El flujo de producción esperado es:

```text
commit / pull request
       ↓
GitHub Security CI
       ↓
merge a main
       ↓
Vercel detecta main
       ↓
build Next.js
       ↓
production
```

En Vercel configurar las variables de Supabase en Production, Preview y Development según corresponda.

## 12. Rotación de claves

La publishable key no concede privilegios administrativos por sí sola porque RLS sigue siendo obligatorio. Aun así, esta entrega no fija ninguna clave literal y permite rotarla sin editar código.

Procedimiento:

1. Crear una nueva publishable key en Supabase.
2. Añadirla en Vercel como `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. desplegar;
4. comprobar login, lectura y administración;
5. revocar/deshabilitar la clave anterior.

Nunca rotar primero y actualizar Vercel después, porque produciría una interrupción.

## 13. Contraseñas

La aplicación **no hashea contraseñas manualmente** y no almacena contraseñas en tablas públicas. Supabase Auth almacena hashes bcrypt y gestiona salts internamente.

La administración de usuarios exige passwords de 12–128 caracteres con mayúscula, minúscula, número y símbolo.

## 14. RLS y separación de privilegios

Los permisos se evalúan en dos niveles:

### Capa 1: `role_access_policies`
Define qué módulos puede abrir un rol.

### Capa 2: `role_content_scopes`
Define qué registros puede leer dentro del módulo.

Las políticas RLS llaman a funciones privadas como:

```sql
private.portal_can_view_module(...)
private.portal_can_read_scoped(...)
```

El navegador no puede cambiar el rol directamente.

## 15. Storage

Los uploads administrativos pasan por validación de:

- extensión;
- MIME;
- firma binaria conocida;
- límite de tamaño;
- bucket permitido;
- rol autenticado.

`portal-assets` mantiene compatibilidad con el portal actual y tiene límites inferiores a los históricos.

## 16. Seguridad web

`next.config.ts` añade, entre otras:

- HSTS
- CSP
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- `poweredByHeader=false`

Vercel publica el sitio por HTTPS.

## 17. CI y dependencias

El repositorio incluye:

- `.github/workflows/security-ci.yml`
- `.github/dependabot.yml`
- `scripts/scan-secrets.mjs`
- `scripts/preflight.mjs`

El CI ejecuta instalación, scanner, lint, TypeScript, auditoría de dependencias y build.

## 18. Archivos principales

```text
app/
  api/
    portal-user-admin/route.ts
    portal-access-admin/route.ts
components/
  admin/
    AccessControlManager.tsx
    SecurityCenter.tsx
    UserManager.tsx
    ContentManager.tsx
  auth/
    LoginGate.tsx
  portal/
    PortalApp.tsx
lib/
  config/portal.ts
  supabase/
    client.ts
    repository.ts
supabase/
  functions/
    portal-user-admin/
    portal-access-admin/
  migrations/
scripts/
docs/
```

## Guía de instalación y traspaso

Para una instalación completa o entrega a un tercero, empezar por:

- [`INSTALL.md`](INSTALL.md) — guía maestra de instalación, Supabase, GitHub, Vercel, dominio, pruebas y rollback.
- [`docs/ENTREGA-DOMINIO-HOSTING.md`](docs/ENTREGA-DOMINIO-HOSTING.md) — traspaso de hosting/dominio.
- [`docs/CHECKLIST-RECEPCION-Y-TRASPASO.md`](docs/CHECKLIST-RECEPCION-Y-TRASPASO.md) — checklist de aceptación.

Comando de comprobación estructural:

```bash
npm run handoff:check
```

## 19. Documentación complementaria

- `docs/ENTREGA-TECNICA.md`
- `docs/ARQUITECTURA-Y-SERVICIOS.md`
- `docs/CREDENCIALES-Y-ROTACION.md`
- `docs/CHECKLIST-20-CONTROLES.md`
- `docs/SEGURIDAD.md`
- `docs/SUPABASE-RLS-Y-STORAGE.md`
- `docs/INSTALACION-Y-DESPLIEGUE.md`
- `docs/OPERACION-MONITOREO.md`
- `docs/PLAN-RESPUESTA-INCIDENTES.md`
- `docs/GIT-SECRET-CLEANUP.md`

## 20. Controles que requieren configuración externa

Dos medidas no pueden completarse solo con código del repositorio:

1. **CAPTCHA/Turnstile:** requiere Site Key y Secret generados en el proveedor y activación en Supabase Auth.
2. **Leaked Password Protection:** debe activarse en Supabase Auth si el plan contratado lo soporta.
3. **Password Verification Hook 5/15:** la función SQL está preparada, pero el hook debe seleccionarse en Authentication → Hooks para que el bloqueo sea global.
4. **Nueva publishable key:** crear la nueva clave, actualizar Vercel y después deshabilitar la anterior.

No se incluyen credenciales ficticias para marcar estas tareas falsamente como completadas.

---

**Principio operativo:** Git es la fuente del código; Vercel despliega el frontend/API; Supabase es la fuente de identidad, datos, Storage y autorización. Los secretos pertenecen a los entornos, no al repositorio.
