# Arquitectura frontend

## Objetivo

Mantener la landing como un portal modular y entendible: una sección pública no debe depender de parches CSS repartidos entre varios archivos ni introducir lógica de datos dentro de componentes puramente visuales.

## Capas

### `app/`

Contiene la entrada de Next.js, metadatos y el orden de carga de estilos. `app/globals.css` únicamente importa módulos de estilo; no debe convertirse en un archivo de reglas visuales.

### `components/portal/`

`PortalApp.tsx` es el orquestador de estado: sesión, colecciones, configuración, navegación y administración.

### `components/home/`

Responsable de la experiencia de inicio.

- `HomeView.tsx`: composición de secciones y búsqueda global.
- `hero/`: hero independiente. Su lógica de carrusel, estado de transición y controles vive aquí.
- `paco/`: límite reservado para el siguiente módulo interactivo. No se mezcla con el hero.
- `TeamCultureSection.tsx`: equipo, mascota y reconocimientos.

### `components/content/`

Vistas reutilizables de las colecciones públicas.

### `components/admin/`

Herramientas de administración. No deben importar reglas visuales específicas del hero ni del juego de Paco.

### `lib/`

- `config/`: defaults y catálogo de assets.
- `supabase/`: cliente y repositorio de datos.
- `utils/`: funciones sin estado visual.

## Estilos

Orden de carga actual:

1. `tokens.css`: variables, tipografía y primitivas globales.
2. `public-experience.css`: layout público común.
3. `home/hero.css`: hero/libreta y su responsive.
4. `admin-console.css`: consola administrativa.
5. `motion.css`: animaciones compartidas.
6. `responsive.css`: responsive transversal de módulos no encapsulados.

El hero es autocontenido: sus keyframes, responsive y reglas de reduced motion están en `home/hero.css`.

## Regla de reconstrucción

Cuando un bloque cambie de concepto visual, se reemplaza la implementación anterior en su módulo. No se conserva el componente viejo ocultándolo debajo de una capa nueva. Esto evita cascadas impredecibles, duplicación de selectores y deuda visual.
