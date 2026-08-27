# Modelo de seguridad

## Autenticación

El portal es privado. Sin sesión válida no se ejecuta la carga de contenido del repositorio.

## Autorización

El frontend oculta navegación no permitida, pero esto es solo UX. La autorización real se aplica en PostgreSQL mediante RLS.

### Tablas de control

- `role_access_policies`: acceso al portal y módulos.
- `role_content_scopes`: alcance por contenido.

### Reglas de alcance

Si `allow_all=true`, el rol puede consultar todos los registros que además pasen las reglas de visibilidad.

Si `allow_all=false`, debe coincidir:

- ID del registro; o
- categoría; o
- al menos una etiqueta.

## Usuarios

La Edge Function `portal-user-admin`:

- valida JWT;
- comprueba perfil activo;
- no confía en `user_metadata` para autorización;
- mantiene roles en perfil/app metadata;
- aplica jerarquía;
- bloquea autoeliminación;
- valida passwords fuertes;
- limita bodies y respuestas.

## Permisos

`portal-access-admin` exige `super_admin` y permite leer/actualizar la matriz completa.

## XSS

React escapa texto por defecto y no se utiliza `dangerouslySetInnerHTML`, `eval` ni `new Function`.

## Secretos

Nunca colocar secretos en `NEXT_PUBLIC_*`.
