# Siguiente módulo — Juego de Paco

## Estado

Este bloque todavía no está implementado. Se deja documentado y aislado para construirlo inmediatamente después del hero sin alterar el banner terminado.

## Información recuperada del trabajo previo

- Paco es la mascota y debe ser protagonista visible del bloque.
- El juego debe ir **inmediatamente después del banner/hero**.
- La referencia de interacción mencionada fue **Restate**.
- La mecánica visual recuperada es Paco **avanzando/saltando** dentro de una franja horizontal.
- Paco no debe competir con el título del hero: el juego es una sección propia.
- En el tratamiento del personaje, Paco debe verse grande y limpio; para momentos explicativos se planteó encuadre de cintura hacia arriba, sentado, hablando o explicando.
- El personaje puede mostrarse sin fondo o dentro de una estética controlada de grabación/reproducción de video.
- La dirección visual preferida para personajes es caricatura clásica, limpia y sin adornos innecesarios.
- Después del juego se contemplan animaciones/secciones con inspiración tipo Land-book; no deben insertarse antes del juego.

## Orden de la landing confirmado

```text
Hero / banner de libreta
        ↓
Juego horizontal de Paco
        ↓
Siguientes secciones y animaciones editoriales
```

## Límite de implementación

El juego se construirá en `components/home/paco/` y sus estilos vivirán en un archivo propio. No se reutilizará el estado interno del carrusel ni se montará encima del hero.

## Criterios para el siguiente paso

Antes de programar la mecánica completa, definir en este orden:

1. escenario horizontal y recorrido;
2. sprite/asset definitivo de Paco;
3. estados de movimiento y salto;
4. obstáculos o hitos interactivos;
5. reglas de progreso;
6. mensajes o explicaciones de Paco;
7. comportamiento táctil/móvil;
8. reduced motion y alternativa accesible;
9. conexión opcional con contenido administrable, solo después de estabilizar la mecánica.
