import { PLAYER_PHYSICS } from "../config/PhysicsConfig";

export type PadTargetKind = "platform" | "orb" | "portal" | "route";

export type PadTrajectoryInput = {
  launchX: number;
  speed: number;
  padElevation: number;
  targetKind: PadTargetKind;
  targetX: number;
  targetElevation: number;
  landingMinX?: number;
  landingMaxX?: number;
  gapEndX?: number;
};

export type PadTrajectorySolution = {
  velocityY: number;
  flightTime: number;
  landingX: number;
  arrivalVelocityY: number;
  targetY: number;
  simulatedY: number;
  gapClearanceY: number | null;
  error: number;
  safe: boolean;
};

type SimState = { y: number; velocityY: number };

const DT = 1 / 120;
const MIN_PAD_POWER = 720;
const MAX_PAD_POWER = 1420;
const PLATFORM_DESCENT_MIN = 8;
const GAP_CLEARANCE = -18;

function gravityFor(y: number, velocityY: number) {
  const nearApex = Math.abs(velocityY) < 112 && y < 0;
  if (nearApex) return PLAYER_PHYSICS.apexGravity;
  return velocityY > 0 ? PLAYER_PHYSICS.fallGravity : PLAYER_PHYSICS.baseGravity;
}

function advance(state: SimState, step: number): SimState {
  const gravity = gravityFor(state.y, state.velocityY);
  const velocityY = state.velocityY + gravity * step;
  return { y: state.y + velocityY * step, velocityY };
}

function simulateAt(initialVelocityY: number, seconds: number) {
  let state: SimState = { y: 0, velocityY: initialVelocityY };
  let elapsed = 0;
  while (elapsed < seconds) {
    const step = Math.min(DT, seconds - elapsed);
    state = advance(state, step);
    elapsed += step;
  }
  return state;
}

function gapClearanceFor(input: PadTrajectoryInput, initialVelocityY: number) {
  if (input.gapEndX == null || input.gapEndX <= input.launchX) return null;
  const seconds = (input.gapEndX - input.launchX) / Math.max(1, input.speed);
  return simulateAt(initialVelocityY, seconds).y;
}

function solvePlatform(input: PadTrajectoryInput): PadTrajectorySolution {
  const targetY = -(input.targetElevation - input.padElevation);
  const minX = input.landingMinX ?? input.targetX - 70;
  const maxX = input.landingMaxX ?? input.targetX + 70;
  const centerX = (minX + maxX) / 2;
  let best: PadTrajectorySolution | null = null;

  for (let power = MIN_PAD_POWER; power <= MAX_PAD_POWER; power += 2) {
    const initialVelocityY = -power;
    let state: SimState = { y: 0, velocityY: initialVelocityY };
    let previous = state;
    let elapsed = 0;
    let landingX = input.launchX;
    let foundDescendingCrossing = false;

    while (elapsed < 2.8) {
      previous = state;
      state = advance(state, DT);
      elapsed += DT;
      landingX = input.launchX + input.speed * elapsed;

      if (state.velocityY > 0 && previous.y < targetY && state.y >= targetY) {
        foundDescendingCrossing = true;
        break;
      }
      if (landingX > maxX + 260 && state.velocityY > 0) break;
    }

    if (!foundDescendingCrossing) continue;

    const landingError = landingX < minX ? minX - landingX : landingX > maxX ? landingX - maxX : 0;
    const centerPenalty = Math.abs(landingX - centerX) * 0.045;
    const descentPenalty = state.velocityY < PLATFORM_DESCENT_MIN ? (PLATFORM_DESCENT_MIN - state.velocityY) * 0.35 : 0;
    const gapY = gapClearanceFor(input, initialVelocityY);
    const gapPenalty = gapY != null && gapY > GAP_CLEARANCE ? (gapY - GAP_CLEARANCE) * 2.8 : 0;
    const powerPenalty = Math.max(0, power - 1250) * 0.02;
    const error = landingError * 5 + centerPenalty + descentPenalty + gapPenalty + powerPenalty;
    const safe = landingError <= 0.5 && descentPenalty === 0 && (gapY == null || gapY <= GAP_CLEARANCE);

    const candidate: PadTrajectorySolution = {
      velocityY: initialVelocityY,
      flightTime: elapsed,
      landingX,
      arrivalVelocityY: state.velocityY,
      targetY,
      simulatedY: state.y,
      gapClearanceY: gapY,
      error,
      safe,
    };

    if (!best || (candidate.safe && !best.safe) || (candidate.safe === best.safe && candidate.error < best.error)) best = candidate;
  }

  return best ?? {
    velocityY: -1040,
    flightTime: Math.max(0.35, (input.targetX - input.launchX) / Math.max(1, input.speed)),
    landingX: input.targetX,
    arrivalVelocityY: 120,
    targetY,
    simulatedY: targetY,
    gapClearanceY: null,
    error: 9999,
    safe: false,
  };
}

function solvePoint(input: PadTrajectoryInput): PadTrajectorySolution {
  const speed = Math.max(1, input.speed);
  const flightTime = Math.max(0.18, (input.targetX - input.launchX) / speed);
  const targetY = -(input.targetElevation - input.padElevation);
  let best: PadTrajectorySolution | null = null;

  for (let power = MIN_PAD_POWER; power <= MAX_PAD_POWER; power += 2) {
    const initialVelocityY = -power;
    const state = simulateAt(initialVelocityY, flightTime);
    const gapY = gapClearanceFor(input, initialVelocityY);
    const verticalError = Math.abs(state.y - targetY);
    const gapPenalty = gapY != null && gapY > GAP_CLEARANCE ? (gapY - GAP_CLEARANCE) * 2.8 : 0;
    const safeTolerance = input.targetKind === "portal" ? 70 : 42;
    const safe = verticalError <= safeTolerance && (gapY == null || gapY <= GAP_CLEARANCE);
    const error = verticalError + gapPenalty + Math.max(0, power - 1280) * 0.02;
    const candidate: PadTrajectorySolution = {
      velocityY: initialVelocityY,
      flightTime,
      landingX: input.targetX,
      arrivalVelocityY: state.velocityY,
      targetY,
      simulatedY: state.y,
      gapClearanceY: gapY,
      error,
      safe,
    };
    if (!best || (candidate.safe && !best.safe) || (candidate.safe === best.safe && candidate.error < best.error)) best = candidate;
  }

  return best ?? {
    velocityY: -1040,
    flightTime,
    landingX: input.targetX,
    arrivalVelocityY: 120,
    targetY,
    simulatedY: targetY,
    gapClearanceY: null,
    error: 9999,
    safe: false,
  };
}

/**
 * One-shot deterministic solver. It never takes control of Paco after launch.
 * Platform targets are solved by the actual descending intersection with the
 * safe landing zone, not by guessing a fixed jump power.
 */
export function solvePadTrajectory(input: PadTrajectoryInput): PadTrajectorySolution {
  if (input.targetKind === "platform" || input.targetKind === "route") return solvePlatform(input);
  return solvePoint(input);
}
