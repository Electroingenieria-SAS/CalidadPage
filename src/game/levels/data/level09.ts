import type { LevelDefinition } from "../engine/LevelTypes";

export const level09: LevelDefinition = {
  id: "level_09",
  order: 9,
  name: "Maestría",
  subtitle: "mezcla avanzada · secretos · tempo",
  baseSpeed: 515,
  gravity: 1,
  difficulty: 9,
  length: 15800,
  targetDurationSec: 33,
  setPiece: "master",
  qualityFact: "La madurez del proceso aparece cuando diferentes mecánicas conviven sin perder coherencia.",
  challenge: { kind: "combo", target: 14, label: "Sostén un combo largo con rutas creativas" },
  theme: { sky: 0x091320, road: 0x1d2535, shoulder: 0x4b5e78, lane: 0xffd857, accent: 0x9ce2ff, tint: 0x6c80a8 },
  assetGroups: ["environment", "vfx"],
  sections: [
    { type: "pattern", pattern: "gd_master_mix_a", gapAfter: 110 },
    { type: "pattern", pattern: "gd_gravity_maze", gapAfter: 110 },
    { type: "pattern", pattern: "gd_mini_rush", gapAfter: 110 },
    { type: "setPiece", event: "master", length: 720 },
    { type: "pattern", pattern: "gd_master_secret", gapAfter: 0 },
  ],
};
