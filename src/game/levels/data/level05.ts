import type { LevelDefinition } from "../engine/LevelTypes";

export const level05: LevelDefinition = {
  id: "level_05",
  order: 5,
  name: "Lluvia Eléctrica",
  subtitle: "flujo técnico · cadenas · recuperación",
  baseSpeed: 455,
  gravity: 1,
  difficulty: 5,
  length: 14500,
  targetDurationSec: 31,
  setPiece: "electricRain",
  qualityFact: "Cuando aparece la variación, el estándar debe seguir siendo legible y repetible.",
  challenge: { kind: "energy", target: 10, label: "Recoge energía suficiente usando rutas creativas" },
  theme: { sky: 0x0a1020, road: 0x21283a, shoulder: 0x41536d, lane: 0xffcf52, accent: 0x66cfff, tint: 0x7a8db0 },
  assetGroups: ["environment", "vfx"],
  sections: [
    { type: "pattern", pattern: "gd_rain_arcs", gapAfter: 100 },
    { type: "pattern", pattern: "gd_falling_chain", gapAfter: 110 },
    { type: "pattern", pattern: "gd_ship_intro", gapAfter: 120 },
    { type: "setPiece", event: "electricRain", length: 650 },
    { type: "pattern", pattern: "gd_upper_shortcut", gapAfter: 0 },
  ],
};
