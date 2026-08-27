# Operación y monitoreo

## Diario/semanal

- revisar errores de Vercel;
- revisar Auth/Edge logs de Supabase;
- revisar Security Advisor;
- revisar PRs de Dependabot;
- verificar intentos de login anómalos.

## Mensual

- `npm audit`;
- revisar roles/usuarios activos;
- revisar permisos por rol;
- revisar objetos Storage sin propietario válido;
- revisar consultas lentas con `pg_stat_statements`.

## Antes de cada release

```bash
npm run scan:secrets
npm run lint
npm run typecheck
npm audit --audit-level=high
npm run build
```
