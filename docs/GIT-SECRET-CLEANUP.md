# Eliminación de secretos del historial Git

Eliminar un secreto del archivo actual **no lo elimina del historial**.

## Procedimiento recomendado

1. Rotar inmediatamente el secreto comprometido.
2. Instalar `git-filter-repo` en un clon de mantenimiento.
3. Reescribir el archivo/valor comprometido.
4. Verificar todas las ramas/tags.
5. Hacer force-push coordinado.
6. Solicitar a todos los colaboradores reclonar.

Ejemplo conceptual:

```bash
git filter-repo --path .env --invert-paths
```

No ejecutar este comando sobre el único clon de trabajo sin respaldo. Para valores incrustados en archivos se debe usar un archivo de reemplazos de `git-filter-repo`.

El ZIP de entrega no contiene `.git`, por lo que la limpieza del historial remoto requiere acceso directo al repositorio GitHub.
