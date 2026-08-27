import type { LevelDefinition } from "../engine/LevelTypes";

export const level03: LevelDefinition = {
  id: "level_03",
  order: 3,
  name: "Tormenta Activa",
  subtitle: "orbs · doble salto · rutas altas",
  baseSpeed: 425,
  gravity: 1,
  difficulty: 3,
  length: 13800,
  targetDurationSec: 30,
  setPiece: "storm",
  qualityFact: "Las rutas alternas bien diseñadas permiten recuperar el flujo sin perder control.",
  challenge: { kind: "combo", target: 10, label: "Encadena ritmo y mantiene el combo" },
  theme: { sky: 0x07111e, road: 0x1a2230, shoulder: 0x374557, lane: 0xffdf8b, accent: 0x6ed0ff, tint: 0x6d84b7 },
  assetGroups: ["environment", "vfx"],
  sections: [
    { type: "pattern", pattern: "gd_orb_intro", gapAfter: 100 },
    { type: "pattern", pattern: "gd_doublejump_route", gapAfter: 120 },
    { type: "setPiece", event: "storm", length: 620 },
    { type: "pattern", pattern: "gd_rain_arcs", gapAfter: 120 },
    { type: "pattern", pattern: "gd_secret_split", gapAfter: 0 },
  ],
};
