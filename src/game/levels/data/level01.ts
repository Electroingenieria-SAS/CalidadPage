import type { LevelDefinition } from "../engine/LevelTypes";

export const level01: LevelDefinition = {
  id: "level_01",
  order: 1,
  name: "Arranque de Obra",
  subtitle: "lectura · ritmo · primeras rutas",
  baseSpeed: 390,
  gravity: 1,
  difficulty: 1,
  length: 12800,
  targetDurationSec: 28,
  setPiece: "nightworks",
  qualityFact: "La calidad empieza definiendo claramente qué se espera antes de ejecutar.",
  challenge: { kind: "pass", target: 1, label: "Completa el circuito sin colisionar" },
  theme: { sky: 0x071426, road: 0x172536, shoulder: 0x2b3d54, lane: 0xffd45a, accent: 0xffd45a, tint: 0x7893b8 },
  assetGroups: ["core", "paco", "environment"],
  sections: [
    { type: "pattern", pattern: "gd_intro_01", gapAfter: 120 },
    { type: "pattern", pattern: "gd_basic_hops", gapAfter: 120 },
    { type: "pattern", pattern: "gd_doublejump_intro", gapAfter: 130 },
    { type: "rest", length: 320, qualityFact: "Observar el estándar antes de ejecutar reduce el reproceso." },
    { type: "setPiece", event: "nightworks", length: 560 },
    { type: "pattern", pattern: "gd_pad_intro", gapAfter: 0 },
  ],
};
