# Entrega técnica

## Código fuente completo

El paquete contiene frontend, Route Handlers, funciones Supabase, SQL, scripts, configuración de build y documentación.

## Frontend

Next.js App Router, componentes React, estilos institucionales, hero, catálogo, módulos, administración y juego Paco.

## Backend/API

- Supabase Data API bajo RLS.
- `/api/portal-user-admin`.
- `/api/portal-access-admin`.
- Edge Functions equivalentes.

## Dependencias

Declaradas y fijadas en `package.json` y `package-lock.json`.

## Migraciones

Incluidas bajo `supabase/migrations` y SQL histórico bajo `supabase/sql`.

## Configuración

`.env.example` describe variables pero no contiene valores reales.

## Entrega a un tercero

El tercero necesita acceso o credenciales nuevas para GitHub, Vercel y Supabase. No se deben enviar secretos dentro del ZIP ni por README.
