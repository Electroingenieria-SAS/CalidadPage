# Hero — Libreta de papel

## Estado actual

El hero fue reconstruido como un módulo independiente. Sustituye el carrusel rectangular genérico por una libreta larga de orientación horizontal, con argollas en el borde izquierdo, profundidad mediante sombras y un fondo animado coherente con la paleta institucional.

## Estructura visual

1. Fondo dinámico del hero: cuadrícula, ondas, brillos y pequeños elementos flotantes.
2. Libreta horizontal con lomo/argollas a la izquierda.
3. Hoja principal que conserva el banner completo.
4. Texto y acciones alineados debajo de la hoja como parte de la composición, sin una tarjeta de “destacado” independiente.
5. Indicador de posición y controles de navegación discretos.

## Transición entre banners

La transición ya no simula pasar una hoja.

Secuencia:

1. la hoja actual empieza a deformarse;
2. aparecen pliegues durante la contracción;
3. el papel se compacta hasta parecer arrugado;
4. la bola de papel sale lanzada hacia un lado;
5. la siguiente hoja, que estaba físicamente debajo dentro del stage, queda visible;
6. la hoja nueva realiza un asentamiento corto y suave;
7. se reinicia el ciclo automático.

El sentido del lanzamiento responde a la navegación anterior/siguiente.

## Tiempo

- Avance automático: 15 s.
- Arrugado y descarte: 900 ms.
- Asentamiento: 420 ms.

Los controles se bloquean durante la transición para evitar estados intermedios corruptos.

## Responsive

La libreta conserva el concepto en escritorio, portátil, tableta y móvil. En pantallas pequeñas se reduce el lomo, se compactan los controles y cambia la proporción mínima del stage para evitar que el banner quede ilegiblemente bajo.

## Accesibilidad

- Pausa automática al pasar el cursor o enfocar controles.
- Botón Pausar/Reanudar.
- Etiquetas ARIA en navegación.
- `prefers-reduced-motion` y la preferencia interna `.reduce-motion` eliminan el movimiento complejo.

## Archivo principal

```text
components/home/hero/BannerExperience.tsx
app/styles/home/hero.css
```
