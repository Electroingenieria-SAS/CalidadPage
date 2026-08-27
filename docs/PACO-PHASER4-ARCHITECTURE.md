# Paco Runner — Phaser 4 Functional Architecture V2

## Runtime

```text
Next.js / React
  -> PacoGame.tsx
  -> createPacoGame()
  -> Phaser.Game
      BootScene
      PreloadScene
      LevelScene (one circuit at a time)
      UIScene (persistent HUD)
```

## Level lifecycle

The first migration created every circuit in one huge physics world. V2 deliberately builds **one level per `LevelScene` lifecycle**.

```ts
const level = LevelLoader.loadAll()[levelIndex];
const built = LevelEngine.buildLevel(builder, level, 0);
```

When the player reaches the safe exit margin:

1. gameplay stops accepting forward speed;
2. the circuit-complete message is emitted;
3. camera fades out;
4. `LevelScene` restarts with `levelIndex + 1`;
5. a clean world is built;
6. camera fades in;
7. `GameManager` keeps run score / energy / distance.

This gives every circuit independent:

- world bounds;
- camera bounds;
- set-piece lifecycle;
- obstacles and platforms;
- road geometry;
- theme;
- debug state.

## Rendering / responsive scale

The logical game resolution remains 1280×720 with `Phaser.Scale.FIT`.

The DOM **must not** force the Phaser canvas to `width:100%; height:100%`, because that bypasses the Scale Manager result and distorts the game.

## Parallax

Hills assets are 512×256. Each tile layer uses:

```ts
sourceScale = gameHeight / 256;
```

so one source frame occupies the complete logical height. This prevents vertical texture repetition.

## Physics

Arcade Physics remains the gameplay physics system. Paco horizontal velocity is controlled by level speed rather than frame count. Jump buffering / coyote time / apex gravity / fall gravity remain in `PacoController`.

## Responsibilities

- `LevelDefinition`: level data.
- `LevelEngine`: builds a single level definition.
- `LevelBuilder`: creates road, patterns, mechanics, triggers and boss.
- `LevelScene`: lifecycle and transition between circuits.
- `GameManager`: persistent run state.
- `SetPieceDirector`: circuit-specific environmental gameplay.
- `ParallaxBackground`: responsive layered background.
- `UIScene`: persistent UI across level scene changes.
