import type { LevelDefinition } from "../engine/LevelTypes";

export const level08: LevelDefinition = {
  id: "level_08",
  order: 8,
  name: "Persecución",
  subtitle: "presión · atajos · lectura rápida",
  baseSpeed: 500,
  gravity: 1,
  difficulty: 8,
  length: 15400,
  targetDurationSec: 32,
  setPiece: "chase",
  qualityFact: "Los atajos solo sirven si siguen siendo comprensibles y ejecutables bajo presión.",
  challenge: { kind: "distance", target: 1600, label: "Mantén la persecución viva hasta el final" },
  theme: { sky: 0x0b1423, road: 0x1d2534, shoulder: 0x455870, lane: 0xffd34f, accent: 0xff8f66, tint: 0x6e7a91 },
  assetGroups: ["environment", "vfx"],
  sections: [
    { type: "pattern", pattern: "gd_chase_flow", gapAfter: 100 },
    { type: "pattern", pattern: "gd_chase_upper", gapAfter: 110 },
    { type: "setPiece", event: "chase", length: 700 },
    { type: "pattern", pattern: "gd_wave_channel", gapAfter: 120 },
    { type: "pattern", pattern: "gd_combo_trial", gapAfter: 0 },
  ],
};
