export const PHYSICS_CONFIG = {
  default: "arcade" as const,
  arcade: {
    gravity: { x: 0, y: 0 },
    fixedStep: true,
    fps: 120,
    overlapBias: 6,
    tileBias: 16,
    debug: false,
  },
};

/**
 * Physics is deliberately independent from Paco's artwork.
 * paco-body is generated at exactly 64×82 px in BootScene, so this hitbox is
 * stable no matter which visual pose is currently shown.
 */
export const PLAYER_PHYSICS = {
  bodyTextureWidth: 64,
  bodyTextureHeight: 82,
  bodyWidth: 50,
  bodyHeight: 66,
  bodyOffsetX: 7,
  bodyOffsetY: 16,
  visualSize: 118,
  visualYOffset: -54,
  baseGravity: 2050,
  apexGravity: 1120,
  fallGravity: 2550,
  jumpVelocity: -820,
  jumpCutVelocity: -310,
  coyoteMs: 105,
  jumpBufferMs: 125,
};
