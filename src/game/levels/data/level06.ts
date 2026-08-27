import type { LevelDefinition } from "../engine/LevelTypes";

export const level06: LevelDefinition = {
  id: "level_06",
  order: 6,
  name: "Carretera Industrial",
  subtitle: "bifurcaciones · velocidad · control",
  baseSpeed: 470,
  gravity: 1,
  difficulty: 6,
  length: 14800,
  targetDurationSec: 32,
  setPiece: "industrial",
  qualityFact: "Si el entorno es complejo, separar lo esencial de lo accesorio mejora la ejecución.",
  challenge: { kind: "secret", target: 2, label: "Encuentra rutas altas y secretos del circuito" },
  theme: { sky: 0x0d1522, road: 0x202732, shoulder: 0x4f5b68, lane: 0xffd04d, accent: 0x80dcff, tint: 0x6d7f96 },
  assetGroups: ["environment"],
  sections: [
    { type: "pattern", pattern: "gd_industrial_fast", gapAfter: 100 },
    { type: "pattern", pattern: "gd_industrial_split", gapAfter: 110 },
    { type: "pattern", pattern: "gd_speed_portal_weave", gapAfter: 110 },
    { type: "setPiece", event: "industrial", length: 680 },
    { type: "pattern", pattern: "gd_secret_split", gapAfter: 0 },
  ],
};
