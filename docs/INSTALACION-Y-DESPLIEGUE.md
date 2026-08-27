# Instalación y despliegue

> La guía exhaustiva se encuentra en [`../INSTALL.md`](../INSTALL.md). Este documento sirve como índice operativo rápido.

## 1. Instalación local

```bash
npm run setup
npm ci
npm run preflight
npm run verify
npm run dev
```

Variables mínimas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

Nunca almacenar `SUPABASE_SERVICE_ROLE_KEY` en frontend ni Git.

## 2. Supabase existente

Producción usada durante la entrega:

```text
zultnmgildejjskwdzgq — Calidosos team
```

Las migraciones nuevas de permisos/tags ya fueron aplicadas. Las Edge Functions `portal-user-admin` y `portal-access-admin` están desplegadas con JWT obligatorio.

## 3. Supabase nuevo

1. Crear proyecto.
2. Revisar/aplicar `supabase/sql/00_install_or_upgrade.sql` cuando corresponda.
3. Aplicar `supabase/migrations/`.
4. Desplegar `supabase/functions/portal-user-admin`.
5. Desplegar `supabase/functions/portal-access-admin`.
6. Configurar secrets server-side.
7. Ejecutar `supabase/sql/99_verify_installation.sql`.
8. Revisar Security Advisor.
9. Crear publishable key moderna.

Ver procedimiento completo en `INSTALL.md`.

## 4. GitHub

Antes del push:

```bash
npm run handoff:check
npm run scan:secrets
npm run verify
```

Producción debe mantenerse en `main` y Vercel debe estar conectado al repositorio.

## 5. Vercel

- Framework: Next.js.
- Node: 24.x.
- Install: `npm ci`.
- Build: `npm run build`.
- Production branch: `main`.

Configurar variables de entorno antes del primer deployment.

## 6. Dominio

1. añadir dominio en Vercel;
2. configurar los registros DNS exactos indicados por Vercel;
3. esperar verificación;
4. actualizar `NEXT_PUBLIC_SITE_URL`;
5. autorizar el nuevo dominio en Supabase Auth;
6. redeployar y probar login/permisos.

Ver `docs/ENTREGA-DOMINIO-HOSTING.md`.

## 7. No desplegar si

- `.env.local` está dentro del repo;
- existe service role en frontend;
- CI está en rojo;
- hay migration drift sin revisar;
- faltan variables de producción;
- el scanner de secretos falla.

## 8. Aceptación

Usar `docs/CHECKLIST-RECEPCION-Y-TRASPASO.md` y ejecutar:

```bash
npm run handoff:check
```
