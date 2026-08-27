# Desarrollo, deploy y QA

## Requisitos

- Node.js >= 20.9
- Node 22 recomendado (`.nvmrc`)
- npm

## Runtime de producción

Este repositorio es Next.js estándar. No usa Vinext, Vite, Wrangler, Cloudflare Worker ni scripts de hosting temporal.

```text
npm run dev   -> next dev
npm run build -> next build
npm run start -> next start
```

## Instalación

```bash
npm ci
```

## Comandos de verificación

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy en Vercel

```text
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: automático
Node.js: 22.x
```

Variables públicas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

`NEXT_PUBLIC_SITE_URL` puede omitirse en previews, pero conviene configurarlo con el dominio definitivo en producción.

## QA del hero

### Funcional

- El primer banner se renderiza completo.
- Siguiente/anterior cambia al banner correcto.
- Seleccionar un punto de la línea de tiempo cambia al índice esperado.
- Durante el descarte los controles quedan temporalmente bloqueados.
- Tras 15 s se inicia un único cambio automático.
- Hover/focus pausa el avance automático.
- El CTA conserva navegación interna o externa.

### Visual

- Las argollas permanecen alineadas al borde izquierdo.
- No aparece la tarjeta antigua de “destacado”.
- No quedan reglas CSS del carrusel anterior compitiendo con el módulo nuevo.
- La hoja no recorta banners 4:1.
- El fondo mantiene movimiento suave sin tapar el contenido.
- La animación se percibe como arrugar/compactar/tirar, no como giro de página.

### Responsive

Probar como mínimo:

- 1440×900
- 1366×768
- 1024×768
- 768×1024
- 390×844
- 360×800

### Accesibilidad

- Navegación por teclado.
- Foco visible.
- Etiquetas de los controles comprensibles.
- `prefers-reduced-motion: reduce` elimina el movimiento complejo.

## Regla antes de entregar

No comprimir `node_modules`, `.next`, `dist`, cachés ni artefactos temporales. El ZIP debe contener únicamente código fuente, configuración, documentación y assets necesarios.
