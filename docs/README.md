# Documentación técnica — Calidoso Team

Este directorio separa arquitectura, experiencia y operación para mantener el repositorio entendible sin convertir el README raíz en un archivo difícil de navegar.

## Arquitectura

- [`architecture/FRONTEND.md`](architecture/FRONTEND.md): responsabilidades por carpeta, flujo del frontend y regla de reconstrucción.
- [`architecture/DATA-SUPABASE.md`](architecture/DATA-SUPABASE.md): persistencia, RLS, Storage y administración de usuarios.

## Experiencia pública

- [`experience/HERO-NOTEBOOK.md`](experience/HERO-NOTEBOOK.md): hero/libreta, transición de papel arrugado y reduced motion.
- [`experience/PACO-GAME-BRIEF.md`](experience/PACO-GAME-BRIEF.md): brief y límite del siguiente bloque, el juego de Paco.

## Operación

- [`operations/DEVELOPMENT-QA.md`](operations/DEVELOPMENT-QA.md): instalación, Next.js, Vercel y checklist QA.
- [`operations/VALIDATION-2026-08-24.md`](operations/VALIDATION-2026-08-24.md): corrección de deploy y comprobaciones de esta entrega.

## Regla de mantenimiento

Una funcionalidad nueva debe vivir en su módulo correspondiente. No se resuelven cambios visuales agregando capas o reglas contradictorias al final de los estilos. Cuando una sección tenga comportamiento, animación y responsive propios, debe contar con componente y hoja de estilos propios.
