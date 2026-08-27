import type { LevelDefinition } from "../engine/LevelTypes";

export const level10: LevelDefinition = {
  id: "level_10",
  order: 10,
  name: "Central de Calidad",
  subtitle: "aproximación final · precisión · jefe",
  baseSpeed: 530,
  gravity: 1,
  difficulty: 10,
  length: 17000,
  targetDurationSec: 35,
  setPiece: "boss",
  qualityFact: "Un sistema sólido permite cerrar con precisión incluso cuando todo el desafío converge.",
  challenge: { kind: "boss", target: 1, label: "Supera el circuito final y derrota al jefe" },
  theme: { sky: 0x08111d, road: 0x1a2333, shoulder: 0x43556d, lane: 0xffd95e, accent: 0xff6c8f, tint: 0x7583a1 },
  assetGroups: ["environment", "vfx", "boss"],
  sections: [
    { type: "pattern", pattern: "gd_boss_approach", gapAfter: 110 },
    { type: "pattern", pattern: "gd_boss_chaos", gapAfter: 110 },
    { type: "setPiece", event: "boss", length: 760 },
    { type: "pattern", pattern: "gd_boss_training", gapAfter: 120 },
    { type: "boss", boss: "central_quality", length: 3600 },
  ],
};
