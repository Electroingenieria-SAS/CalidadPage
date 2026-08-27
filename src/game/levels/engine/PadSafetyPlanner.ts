import type { LevelPattern, PatternItem } from "./LevelTypes";
import type { JumpPadPlan } from "../../mechanics/JumpPad";

type JumpPadItem = Extract<PatternItem, { kind: "jumpPad" }>;
type PlatformItem = Extract<PatternItem, { kind: "platform" | "movingPlatform" | "fallingPlatform" }>;

const PLATFORM_SURFACE_OFFSET = 12;
const PORTAL_ELEVATION = 170;

function platformItems(pattern: LevelPattern): PlatformItem[] {
  return pattern.items.filter((item): item is PlatformItem => item.kind === "platform" || item.kind === "movingPlatform" || item.kind === "fallingPlatform");
}

function resolvePlatform(pattern: LevelPattern, pad: JumpPadItem) {
  const platforms = platformItems(pattern);
  const containing = platforms.find((platform) => pad.targetX >= platform.x - 8 && pad.targetX <= platform.x + platform.width + 8);
  if (containing) return containing;
  return platforms.filter((platform) => platform.x > pad.x).sort((a, b) => a.x - b.x)[0];
}

function resolveGapEnd(pattern: LevelPattern, padX: number, targetX: number) {
  const crossed = pattern.items
    .filter((item): item is Extract<PatternItem, { kind: "gap" }> => item.kind === "gap")
    .map((gap) => ({ start: gap.x - gap.width / 2, end: gap.x + gap.width / 2 }))
    .filter((gap) => gap.start > padX - 20 && gap.end < targetX + 36)
    .sort((a, b) => a.end - b.end);
  const last = crossed[crossed.length - 1];
  return last ? last.end + 24 : undefined;
}

export function resolveJumpPadPlan(pattern: LevelPattern, pad: JumpPadItem, originX = 0): JumpPadPlan {
  const targetKind = pad.targetKind ?? "platform";
  const padX = originX + pad.x;
  const padElevation = pad.elevation ?? 0;

  if (targetKind === "platform" || targetKind === "route") {
    const platform = resolvePlatform(pattern, pad);
    if (!platform) {
      return {
        padX,
        padElevation,
        targetKind,
        targetX: originX + pad.targetX,
        targetElevation: pad.targetElevation,
      };
    }

    const inset = Math.min(platform.width * 0.3, Math.max(68, platform.width * 0.2));
    const landingMinX = originX + platform.x + inset;
    const landingMaxX = originX + platform.x + platform.width - inset;
    const targetX = (landingMinX + landingMaxX) / 2;
    const targetElevation = platform.elevation + PLATFORM_SURFACE_OFFSET;

    const gapEnd = resolveGapEnd(pattern, pad.x, targetX - originX);
    return {
      padX,
      padElevation,
      targetKind,
      targetX,
      targetElevation,
      landingMinX,
      landingMaxX,
      gapEndX: gapEnd == null ? undefined : originX + gapEnd,
    };
  }

  if (targetKind === "orb") {
    const orb = pattern.items
      .filter((item): item is Extract<PatternItem, { kind: "jumpOrb" }> => item.kind === "jumpOrb")
      .sort((a, b) => Math.abs(a.x - pad.targetX) - Math.abs(b.x - pad.targetX))[0];
    const targetX = originX + (orb?.x ?? pad.targetX);
    const targetElevation = orb?.elevation ?? pad.targetElevation;
    const localTargetX = targetX - originX;
    const gapEnd = resolveGapEnd(pattern, pad.x, localTargetX);
    return {
      padX,
      padElevation,
      targetKind,
      targetX,
      targetElevation,
      gapEndX: gapEnd == null ? undefined : originX + gapEnd,
    };
  }

  const gravityPortal = pattern.items
    .filter((item): item is Extract<PatternItem, { kind: "gravityTrigger" }> => item.kind === "gravityTrigger")
    .sort((a, b) => Math.abs(a.x - pad.targetX) - Math.abs(b.x - pad.targetX))[0];
  const targetX = originX + (gravityPortal?.x ?? pad.targetX);
  const localTargetX = targetX - originX;
  const gapEnd = resolveGapEnd(pattern, pad.x, localTargetX);
  return {
    padX,
    padElevation,
    targetKind,
    targetX,
    targetElevation: pad.targetElevation || PORTAL_ELEVATION,
    gapEndX: gapEnd == null ? undefined : originX + gapEnd,
  };
}
