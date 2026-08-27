# Validación técnica — 24 de agosto de 2026

## Corrección de deploy aplicada

La versión anterior todavía incluía una cadena de hosting temporal basada en Vinext/Vite/Cloudflare. Esa capa fue retirada por completo para que el proyecto se despliegue como Next.js estándar.

Se corrigió:

- `package.json`: scripts estándar de Next.js.
- `package-lock.json`: regenerado y sincronizado con `package.json`.
- `.npmrc`: retirado el cache forzado de `.sites-runtime`.
- `app/globals.css`: retirado el import de Tailwind, que no se utiliza.
- `app/layout.tsx`: metadatos independientes del dominio temporal y compatibles con Vercel.
- `.nvmrc`: Node 22.
- `vercel.json`: framework `nextjs` explícito.
- eliminados: Vinext, Vite, Wrangler, Cloudflare plugin, Worker, `.openai`, scripts de hosting temporal y tests ligados al Worker.

## Comprobaciones realizadas sobre el código fuente

```text
TS/TSX syntax checked: 26 files
Alias imports checked: OK
CSS braces checked: OK (7 files)
package-lock synchronized: OK
Legacy hosting dependencies in lockfile: none
```

## Build en este entorno

La red del runtime de edición no permitió descargar todos los tarballs npm necesarios para instalar `node_modules`; por ello no se marca falsamente un `next build` como ejecutado aquí. La configuración que causaba el fallo estructural de deploy sí fue retirada y el lockfile quedó regenerado mediante npm.

La validación final en un entorno con acceso normal al registro es:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

En Vercel no debe configurarse ningún comando que invoque `vinext`, `vite`, `wrangler` ni `scripts/build-verified.sh`.
