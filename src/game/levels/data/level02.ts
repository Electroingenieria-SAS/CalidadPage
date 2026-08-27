import type { LevelDefinition } from "../engine/LevelTypes";

export const level02: LevelDefinition = {
  id: "level_02",
  order: 2,
  name: "Obras Nocturnas",
  subtitle: "pads · atajos · portales medidos",
  baseSpeed: 410,
  gravity: 1,
  difficulty: 2,
  length: 13400,
  targetDurationSec: 29,
  setPiece: "nightworks",
  qualityFact: "Una señal visible en el punto de trabajo reduce errores y mejora la seguridad.",
  challenge: { kind: "energy", target: 8, label: "Recoge 8 energías sin perder el flujo" },
  theme: { sky: 0x061526, road: 0x182534, shoulder: 0x334359, lane: 0xffc84a, accent: 0xffc84a, tint: 0x7289aa },
  assetGroups: ["environment"],
  sections: [
    { type: "pattern", pattern: "gd_low_high_choice", gapAfter: 110 },
    { type: "pattern", pattern: "gd_upper_shortcut", gapAfter: 110 },
    { type: "pattern", pattern: "gd_speed_portal_weave", gapAfter: 120 },
    { type: "setPiece", event: "nightworks", length: 620 },
    { type: "pattern", pattern: "gd_doublejump_intro", gapAfter: 0 },
  ],
};
