# Supabase: RLS, Storage y funciones

## RLS

Todas las tablas funcionales expuestas se mantienen con RLS.

La migración `20260827_role_access_and_tags.sql` añade el control granular y retira privilegios `anon` de las tablas de contenido. El login pasa a ser requisito funcional.

## Funciones privadas

- `private.portal_can_view_module(text)`
- `private.portal_can_read_scoped(text, uuid, uuid, text[])`

Estas funciones se usan desde políticas RLS y no se exponen como una API anónima.

## Storage

Los buckets actuales mantienen lectura pública de assets porque las URLs ya forman parte del contenido existente. Cambiar a buckets privados requiere migrar todas las URLs a signed URLs y debe hacerse como proyecto separado para no romper el portal.

Las escrituras siguen restringidas a roles autorizados.
