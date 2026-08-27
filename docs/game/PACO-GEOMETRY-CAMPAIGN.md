# Paco Geometry Campaign — Phaser 4

## Regla de diseño

La campaña usa niveles completamente predefinidos. No existe spawning aleatorio de obstáculos, plataformas, pads, orbs ni pickups. El mismo nivel siempre presenta la misma secuencia, por lo que puede aprenderse, memorizarse y dominarse.

Cada circuito tiene:

- inicio en 0 %;
- meta física visible en 100 %;
- velocidad base fija por nivel;
- patrones diseñados a mano mediante datos;
- ruta vial principal;
- uno o más atajos elevados;
- rutas secretas de mayor riesgo/recompensa;
- Jump Pads y Jump Orbs cuando corresponde;
- triggers de velocidad colocados deliberadamente;
- dato de calidad integrado;
- desbloqueo persistente al completar el nivel.

## Campaña

| # | Nivel | Dificultad | Velocidad | Duración objetivo | Lenguaje principal |
|---|---|---:|---:|---:|---|
| 01 | Primer Circuito | 1/10 | 470 | ~45–50 s | saltos básicos, lectura y primera bifurcación |
| 02 | Obras Nocturnas | 2/10 | 500 | ~50 s | pads y atajos elevados |
| 03 | Lluvia Eléctrica | 3/10 | 530 | ~50 s | orbs y rutas de energía |
| 04 | Tormenta | 4/10 | 555 | ~50 s | precisión, movilidad y bursts |
| 05 | Túnel de Inspección | 5/10 | 585 | ~50 s | plataformas, orbs y falling platforms |
| 06 | Carretera Industrial | 6/10 | 615 | ~50 s | velocidad y rutas divididas |
| 07 | Alta Tensión | 7/10 | 645 | ~51 s | cadenas de orbs y speed triggers |
| 08 | Persecución | 8/10 | 675 | ~50 s | flujo continuo y rutas de escape |
| 09 | Circuito Maestro | 9/10 | 705 | ~55 s | mezcla de todos los sistemas y secretos |
| 10 | Central de Calidad | 10/10 | 725 | variable | mastery + jefe final de tres fases |

## Level Engine

Los niveles solo describen datos. `LevelScene` no contiene coordenadas de diseño.

```ts
export const level03: LevelDefinition = {
  id: "level_03",
  name: "Lluvia Eléctrica",
  baseSpeed: 530,
  sections: [
    { type: "pattern", pattern: "gd_rain_arcs" },
    { type: "pattern", pattern: "gd_orb_intro" },
    { type: "setPiece", event: "electricRain", length: 1000 },
    { type: "pattern", pattern: "gd_upper_shortcut" },
  ],
};
```

`PatternRegistry` contiene las secuencias deterministas y `LevelEngine` las ensambla.

## Filosofía de rutas

### Ruta vial

Siempre existe una trayectoria principal sobre la carretera. Es la ruta más legible y normalmente la más segura, pero exige saltar los obstáculos colocados en el suelo.

### Atajo elevado

Las plataformas elevadas permiten evitar parte de la secuencia inferior. Requieren mejor timing y suelen contener más energía.

### Ruta secreta

Se marca con plataformas `secret`. Exige una secuencia más precisa de pad/orb/plataforma y contiene pickups secretos. No es necesaria para completar el nivel.

## Validación

`LevelValidator` valida toda la biblioteca antes de iniciar la campaña:

- patrones existentes;
- items dentro del largo del patrón;
- ancho mínimo de plataformas;
- elevaciones máximas controladas;
- altura de orbs;
- separación mínima entre obstáculos consecutivos.

Esto no sustituye el playtesting, pero evita errores estructurales evidentes en el contenido.

## Progreso

`CampaignProgress` guarda en `localStorage`:

- nivel máximo desbloqueado;
- niveles completados;
- mejor score por nivel;
- mejor energía;
- mejores Perfect Jumps;
- secretos encontrados;
- cantidad de completados.

El visitante empieza con el Nivel 01 y desbloquea secuencialmente el resto.
