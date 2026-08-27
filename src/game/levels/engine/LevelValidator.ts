import { PLAYER_PHYSICS } from "../../config/PhysicsConfig";
import { PATTERN_IDS, PATTERNS } from "../patterns/PatternRegistry";
import type { LevelDefinition } from "./LevelTypes";

const MIN_CAMPAIGN_SPEED = 390;
const MAX_RUNNER_GAP = 200;
const INPUT_MARGIN = 0.68;

/**
 * Mirrors Paco's held runner jump closely enough for level-design validation.
 * The result is intentionally reduced by INPUT_MARGIN so a gap is accepted only
 * when it has a meaningful human timing margin, not merely a theoretical pixel.
 */
function conservativeRunnerReach(speed: number) {
  const dt = 1 / 120;
  let y = 0;
  let vy = PLAYER_PHYSICS.jumpVelocity;
  let elapsed = 0;

  for (let frame = 0; frame < 360; frame += 1) {
    const nearApex = Math.abs(vy) < 112;
    const gravity = nearApex
      ? PLAYER_PHYSICS.apexGravity
      : vy > 0
        ? PLAYER_PHYSICS.fallGravity
        : PLAYER_PHYSICS.baseGravity;

    vy += gravity * dt;
    y += vy * dt;
    elapsed += dt;
    if (elapsed > 0.12 && y >= 0) break;
  }

  return speed * elapsed * INPUT_MARGIN;
}

export class LevelValidator {
  static validate(level: LevelDefinition) {
    const errors: string[] = [];
    if (!level.id) errors.push("Missing id");
    if (level.baseSpeed <= 0) errors.push("baseSpeed must be > 0");
    if (level.baseSpeed > 560) errors.push("baseSpeed exceeds campaign ceiling of 560px/s");
    if (level.length < 1000) errors.push("length is too short");
    if (level.targetDurationSec < 20) errors.push("targetDurationSec is too short for a designed level");
    if (level.sections.length === 0) errors.push("level has no sections");

    const safeReach = conservativeRunnerReach(level.baseSpeed);
    for (const section of level.sections) {
      if (section.type === "pattern" && !PATTERN_IDS.includes(section.pattern)) errors.push(`Unknown pattern ${section.pattern}`);
      if ((section.type === "setPiece" || section.type === "rest" || section.type === "boss") && section.length <= 0) errors.push(`${section.type} section must have positive length`);
      if (section.type === "pattern") {
        const pattern = PATTERNS[section.pattern];
        for (const item of pattern.items) {
          if (item.kind === "gap" && item.width > safeReach) {
            errors.push(`${pattern.id}: gap ${item.width}px exceeds conservative runner reach ${safeReach.toFixed(1)}px at ${level.baseSpeed}px/s`);
          }
        }
      }
    }

    if (errors.length) throw new Error(`Invalid Paco level ${level.id}: ${errors.join("; ")}`);
  }

  static validatePatterns() {
    const errors: string[] = [];
    const minimumSafeReach = conservativeRunnerReach(MIN_CAMPAIGN_SPEED);

    for (const pattern of Object.values(PATTERNS)) {
      const items = [...pattern.items].sort((a, b) => a.x - b.x);
      for (const item of items) {
        if (item.x < 0 || item.x > pattern.length) errors.push(`${pattern.id}: item outside pattern at x=${item.x}`);
        if ((item.kind === "platform" || item.kind === "movingPlatform" || item.kind === "fallingPlatform") && item.width < 180) errors.push(`${pattern.id}: platform too narrow at x=${item.x}`);
        if ((item.kind === "platform" || item.kind === "movingPlatform" || item.kind === "fallingPlatform") && item.elevation > 340) errors.push(`${pattern.id}: platform elevation too high at x=${item.x}`);
        if (item.kind === "jumpOrb" && item.elevation > 390) errors.push(`${pattern.id}: orb too high at x=${item.x}`);
        if (item.kind === "gap") {
          if (item.width < 90 || item.width > MAX_RUNNER_GAP) errors.push(`${pattern.id}: gap width must stay between 90 and ${MAX_RUNNER_GAP}px at x=${item.x}`);
          if (item.width > minimumSafeReach) errors.push(`${pattern.id}: gap at x=${item.x} is outside conservative normal-jump reach`);
        }
        if (item.kind === "doubleJumpPower") {
          if ((item.jumps ?? 1) < 1 || (item.jumps ?? 1) > 2) errors.push(`${pattern.id}: air-jump power must grant 1 or 2 extra jumps at x=${item.x}`);
          if (item.elevation > 120) errors.push(`${pattern.id}: air-jump power is too high to read reliably at x=${item.x}`);
          if ((item.durationMs ?? 0) < 5000) errors.push(`${pattern.id}: air-jump power duration is too short at x=${item.x}`);
        }
      }

      if (!items.some((item) => item.kind === "gap")) errors.push(`${pattern.id}: designed pattern must include a true road gap`);
      if (!items.some((item) => item.kind === "platform" || item.kind === "movingPlatform" || item.kind === "fallingPlatform")) errors.push(`${pattern.id}: designed pattern must include at least one platform route`);

      const obstacles = items.filter((item) => item.kind === "obstacle");
      for (let index = 1; index < obstacles.length; index += 1) {
        const spacing = obstacles[index].x - obstacles[index - 1].x;
        if (spacing < 250) errors.push(`${pattern.id}: obstacle spacing below 250px near x=${obstacles[index].x}`);
      }
    }

    if (errors.length) throw new Error(`Invalid Paco pattern library: ${errors.join("; ")}`);
  }
}
