export type LevelId =
  | "level_01"
  | "level_02"
  | "level_03"
  | "level_04"
  | "level_05"
  | "level_06"
  | "level_07"
  | "level_08"
  | "level_09"
  | "level_10";

export type SetPieceKind =
  | "nightworks"
  | "electricRain"
  | "storm"
  | "tunnel"
  | "industrial"
  | "highVoltage"
  | "chase"
  | "master"
  | "boss";

export type ChallengeKind = "pass" | "energy" | "distance" | "combo" | "perfect" | "boss" | "secret";

export type PatternId =
  | "gd_intro_01"
  | "gd_basic_hops"
  | "gd_low_high_choice"
  | "gd_pad_intro"
  | "gd_orb_intro"
  | "gd_upper_shortcut"
  | "gd_rain_arcs"
  | "gd_storm_precision"
  | "gd_storm_boost"
  | "gd_tunnel_steps"
  | "gd_tunnel_orbs"
  | "gd_falling_chain"
  | "gd_industrial_fast"
  | "gd_industrial_split"
  | "gd_voltage_burst"
  | "gd_voltage_orbs"
  | "gd_chase_flow"
  | "gd_chase_upper"
  | "gd_master_mix_a"
  | "gd_master_mix_b"
  | "gd_master_secret"
  | "gd_boss_approach"
  | "gd_boss_training"
  | "gd_doublejump_intro"
  | "gd_doublejump_route"
  | "gd_speed_portal_weave"
  | "gd_combo_trial"
  | "gd_secret_split"
  | "gd_gravity_intro"
  | "gd_gravity_maze"
  | "gd_boss_chaos"
  | "gd_ship_intro"
  | "gd_wave_channel"
  | "gd_mini_rush";

export type PatternItem =
  | { kind: "obstacle"; obstacle: string; x: number; elevation?: number }
  | { kind: "gap"; x: number; width: number }
  | { kind: "pickup"; x: number; elevation: number; secret?: boolean }
  | { kind: "platform"; x: number; width: number; elevation: number; platformKind?: "standard" | "boost" | "secret" }
  | { kind: "jumpPad"; x: number; elevation?: number; targetX: number; targetElevation: number; targetKind?: "platform" | "orb" | "portal" | "route" }
  | { kind: "jumpOrb"; x: number; elevation: number; power?: number }
  | { kind: "doubleJumpPower"; x: number; elevation: number; jumps?: number; durationMs?: number }
  | { kind: "speedPortal"; x: number; elevation?: number; multiplier: number; durationMs: number }
  | { kind: "modePortal"; x: number; elevation?: number; mode: "runner" | "ship" | "wave" }
  | { kind: "miniPortal"; x: number; elevation?: number; mini: boolean }
  | { kind: "speedTrigger"; x: number; multiplier: number; durationMs: number }
  | { kind: "gravityTrigger"; x: number; gravityScale: 1 | -1 }
  | { kind: "movingPlatform"; x: number; width: number; elevation: number; range: number; durationMs: number }
  | { kind: "fallingPlatform"; x: number; width: number; elevation: number; delayMs: number };

export interface LevelPattern {
  id: PatternId;
  length: number;
  items: PatternItem[];
  designNote?: string;
}

export type LevelSection =
  | { type: "pattern"; pattern: PatternId; gapAfter?: number }
  | { type: "setPiece"; event: SetPieceKind; length: number }
  | { type: "rest"; length: number; qualityFact?: string }
  | { type: "boss"; boss: "central_quality"; length: number };

export interface LevelTheme {
  sky: number;
  road: number;
  shoulder: number;
  lane: number;
  accent: number;
  tint?: number;
  fogAlpha?: number;
}

export interface LevelDefinition {
  id: LevelId;
  order: number;
  name: string;
  subtitle: string;
  baseSpeed: number;
  gravity: number;
  difficulty: number;
  length: number;
  targetDurationSec: number;
  setPiece: SetPieceKind;
  qualityFact: string;
  challenge: {
    kind: ChallengeKind;
    target: number;
    label: string;
  };
  theme: LevelTheme;
  assetGroups: string[];
  sections: LevelSection[];
}

export interface BuiltLevel {
  definition: LevelDefinition;
  startX: number;
  endX: number;
  cleanup: () => void;
}
