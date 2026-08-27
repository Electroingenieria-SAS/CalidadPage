# Entrega para dominio y hosting

Este documento resume exclusivamente el traspaso del proyecto a infraestructura de producción.

## Ruta oficial

```text
GitHub main -> Vercel Production -> dominio HTTPS
                            |
                            -> Supabase
```

## Responsable receptor debe recibir

- acceso al repositorio;
- acceso al proyecto Vercel;
- acceso al proyecto Supabase;
- acceso al proveedor DNS;
- inventario de variables;
- inventario de credenciales a rotar;
- documentación de instalación;
- lista de migraciones y Edge Functions.

## Vercel actual

El proyecto está preparado para Next.js con:

```text
Node 24.x
npm ci
npm run build
```

## Variables mínimas

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

Nunca incluir `service_role` como variable pública.

## Dominio

1. agregar dominio en Vercel;
2. copiar los registros DNS que Vercel indique;
3. esperar verificación;
4. actualizar `NEXT_PUBLIC_SITE_URL`;
5. incluir el dominio en URLs permitidas de Supabase Auth;
6. redeployar;
7. probar login, logout, permisos, assets y APIs.

## Cambio de hosting

Si Vercel se reemplaza por otro hosting, el nuevo proveedor debe soportar:

- Next.js App Router;
- Node 24.x;
- variables de entorno;
- Route Handlers/API;
- HTTPS;
- headers de seguridad definidos por Next.js;
- build reproducible con `npm ci && npm run build`.

Supabase no necesita reemplazarse únicamente porque cambie el hosting del frontend.

## Prueba de aceptación de dominio

- `https://dominio` abre login;
- no se muestra contenido antes de login;
- login válido crea sesión;
- rol filtra navegación/contenido;
- super admin accede a matriz;
- APIs administrativas no responden sin JWT;
- no hay errores 500 persistentes;
- certificado TLS es válido.
