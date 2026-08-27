import type { LevelDefinition } from "../engine/LevelTypes";

export const level04: LevelDefinition = {
  id: "level_04",
  order: 4,
  name: "Túnel de Servicio",
  subtitle: "escalones · visibilidad · atajos",
  baseSpeed: 440,
  gravity: 1,
  difficulty: 4,
  length: 14000,
  targetDurationSec: 31,
  setPiece: "tunnel",
  qualityFact: "Un buen proceso mantiene lectura clara incluso cuando el contexto se vuelve más difícil.",
  challenge: { kind: "distance", target: 1200, label: "Sostén el recorrido sin romper el ritmo" },
  theme: { sky: 0x081018, road: 0x202733, shoulder: 0x3a4656, lane: 0xffd664, accent: 0x8fd5ff, tint: 0x66748f },
  assetGroups: ["environment"],
  sections: [
    { type: "pattern", pattern: "gd_tunnel_steps", gapAfter: 100 },
    { type: "pattern", pattern: "gd_tunnel_orbs", gapAfter: 110 },
    { type: "setPiece", event: "tunnel", length: 640 },
    { type: "pattern", pattern: "gd_speed_portal_weave", gapAfter: 110 },
    { type: "pattern", pattern: "gd_falling_chain", gapAfter: 0 },
  ],
};
