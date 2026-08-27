import type { LevelDefinition } from "../engine/LevelTypes";

export const level07: LevelDefinition = {
  id: "level_07",
  order: 7,
  name: "Picos de Voltaje",
  subtitle: "ráfagas · orbs · doble salto técnico",
  baseSpeed: 485,
  gravity: 1,
  difficulty: 7,
  length: 15000,
  targetDurationSec: 32,
  setPiece: "highVoltage",
  qualityFact: "La velocidad no sustituye el control: un proceso robusto acelera sin perder exactitud.",
  challenge: { kind: "perfect", target: 6, label: "Consigue perfect jumps con precisión" },
  theme: { sky: 0x0b1120, road: 0x20283a, shoulder: 0x405268, lane: 0xffd14c, accent: 0x8edcff, tint: 0x7181aa },
  assetGroups: ["environment", "vfx"],
  sections: [
    { type: "pattern", pattern: "gd_voltage_burst", gapAfter: 110 },
    { type: "pattern", pattern: "gd_gravity_intro", gapAfter: 110 },
    { type: "pattern", pattern: "gd_voltage_orbs", gapAfter: 120 },
    { type: "setPiece", event: "highVoltage", length: 680 },
    { type: "pattern", pattern: "gd_doublejump_route", gapAfter: 0 },
  ],
};
