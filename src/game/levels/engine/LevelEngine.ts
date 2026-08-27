import type { LevelDefinition, BuiltLevel, LevelSection, PatternItem } from "./LevelTypes";
import { LevelValidator } from "./LevelValidator";
import { LevelBuilder, type RoadGap } from "./LevelBuilder";
import { getPattern } from "../patterns/PatternRegistry";

function sectionLength(section: LevelSection) {
  if (section.type === "pattern") return getPattern(section.pattern).length + (section.gapAfter ?? 0);
  return section.length;
}

export class LevelEngine {
  static buildLevel(builder: LevelBuilder, level: LevelDefinition, startX = 0): BuiltLevel {
    LevelValidator.validate(level);

    const requestedContentLength = 280 + level.sections.reduce((sum, section) => sum + sectionLength(section), 0) + 420;
    const actualLength = Math.max(level.length, requestedContentLength);
    let cursor = startX + 280;
    const placements: Array<{ section: LevelSection; originX: number; index: number }> = [];
    const gaps: RoadGap[] = [];

    level.sections.forEach((section, sectionIndex) => {
      placements.push({ section, originX: cursor, index: sectionIndex });
      if (section.type === "pattern") {
        const pattern = getPattern(section.pattern);
        for (const item of pattern.items as PatternItem[]) {
          if (item.kind === "gap") gaps.push({ x: cursor + item.x, width: item.width });
        }
        cursor += pattern.length + (section.gapAfter ?? 0);
      } else {
        cursor += section.length;
      }
    });

    builder.buildRoad(startX, actualLength, level, gaps);

    for (const placement of placements) {
      const { section, originX, index } = placement;
      if (section.type === "pattern") {
        builder.buildPattern(getPattern(section.pattern), originX, level);
      } else if (section.type === "setPiece") {
        builder.buildSetPieceTrigger(section.event, originX + 80, `${level.id}:setpiece:${index}`);
      } else if (section.type === "rest") {
        if (section.qualityFact) builder.buildQualityMarker(originX + 90, section.qualityFact);
      } else if (section.type === "boss") {
        builder.buildBoss(originX + section.length - 540, 610);
      }
    }

    builder.buildFinishGate(startX + actualLength - 210, level);

    return {
      definition: { ...level, length: actualLength },
      startX,
      endX: startX + actualLength,
      cleanup: () => undefined,
    };
  }

  static buildAll(builder: LevelBuilder, levels: LevelDefinition[], startX = 0): BuiltLevel[] {
    const built: BuiltLevel[] = [];
    let cursor = startX;
    levels.forEach((level) => {
      const result = this.buildLevel(builder, level, cursor);
      built.push(result);
      cursor = result.endX;
    });
    return built;
  }
}
