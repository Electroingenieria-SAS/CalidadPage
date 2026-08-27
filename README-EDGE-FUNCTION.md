# portal-user-admin

Edge Function administrativa para el portal Calidoso Team.

## Acciones soportadas

- `list`
- `create`
- `update`
- `set_password`
- `toggle`
- `delete`

## Seguridad

- Requiere JWT válido del usuario conectado.
- Requiere perfil activo con rol `admin` o `super_admin`.
- Un administrador solo puede administrar usuarios de nivel inferior.
- No permite autoeliminación ni autodesactivación.
- Un usuario no puede cambiar su propio rol desde esta función.
- La `SUPABASE_SERVICE_ROLE_KEY` se usa únicamente dentro de la Edge Function.

## Variables

Supabase proporciona automáticamente:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Opcional:

- `PORTAL_ALLOWED_ORIGINS=https://calidadei-gamma.vercel.app`

Para varios orígenes, separarlos con coma.

## Despliegue

Desde Supabase CLI:

```bash
supabase functions deploy portal-user-admin --project-ref <PROJECT_REF>
```

La función debe desplegarse con verificación JWT habilitada.

El frontend actual puede seguir usando `/api/portal-user-admin`; esa ruta Vercel reenvía el JWT del usuario a esta Edge Function.
