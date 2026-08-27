# Plan de respuesta a incidentes

1. Contener: deshabilitar cuenta/clave comprometida.
2. Preservar logs de Vercel, Auth, Edge y Postgres.
3. Rotar secretos afectados.
4. Revisar sesiones activas y forzar cierre cuando aplique.
5. Revisar cambios de roles, RLS y Storage.
6. Corregir la causa en rama separada.
7. Ejecutar CI y pruebas.
8. Desplegar por GitHub → Vercel.
9. Documentar línea de tiempo, impacto y medidas preventivas.

Nunca borrar logs antes de concluir el análisis.
