# Datos y Supabase

## Principio

La reconstrucción visual no modifica el contrato histórico de datos. El portal continúa consumiendo las colecciones y la configuración existentes, de forma que el contenido administrado no dependa de una migración visual.

## Configuración de portada

La configuración de identidad se mantiene en `public.system_settings` mediante la clave:

```text
portal_home_settings_v6
```

El objeto contiene `visual`, `banners`, `mascot`, `team` y `modulePanels`.

## Hero

El nuevo hero reutiliza el arreglo `banners`. No crea una tabla paralela ni duplica banners. Mantiene:

- orden por `sort_order`;
- activación mediante `is_active`;
- `media_url` administrable;
- título, subtítulo, descripción, CTA y destino;
- visualización completa del medio con `contain`.

La transición de papel es una responsabilidad de presentación; no se persiste en Supabase.

## Seguridad

- El frontend utiliza únicamente la llave publicable.
- RLS controla lectura y escritura.
- Las tareas privilegiadas de usuarios pasan por `portal-user-admin`.
- `service_role` permanece en servidor.
- La experiencia visual nunca debe requerir elevar permisos.
