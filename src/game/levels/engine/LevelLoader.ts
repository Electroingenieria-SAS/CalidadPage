import { LEVELS, LEVELS_BY_ID } from "../data";
import type { LevelDefinition, LevelId } from "./LevelTypes";
import { LevelValidator } from "./LevelValidator";

let validated = false;

function ensureValidated() {
  if (validated) return;
  LevelValidator.validatePatterns();
  LEVELS.forEach((level) => LevelValidator.validate(level));
  validated = true;
}

export class LevelLoader {
  static load(id: LevelId): LevelDefinition {
    ensureValidated();
    const level = LEVELS_BY_ID[id];
    if (!level) throw new Error(`Unknown Paco level: ${id}`);
    return level;
  }

  static loadAll(): LevelDefinition[] {
    ensureValidated();
    return LEVELS;
  }
}
