import { LEVELS } from "../levels/data";
import type { BuiltLevel, LevelDefinition } from "../levels/engine/LevelTypes";
import { GameManager } from "./GameManager";

export class LevelManager {
  private built: BuiltLevel[] = [];
  private activeIndex = -1;
  private indexOffset = 0;

  setBuiltLevels(levels: BuiltLevel[], indexOffset = 0) {
    this.built = levels;
    this.activeIndex = -1;
    this.indexOffset = indexOffset;
  }

  get activeLevel(): LevelDefinition {
    return this.built[Math.max(0, this.activeIndex)]?.definition ?? LEVELS[this.indexOffset] ?? LEVELS[0];
  }

  update(playerX: number): LevelDefinition {
    let nextIndex = this.activeIndex;
    for (let index = 0; index < this.built.length; index += 1) {
      const level = this.built[index];
      if (playerX >= level.startX && playerX < level.endX) {
        nextIndex = index;
        break;
      }
    }

    if (nextIndex !== this.activeIndex && nextIndex >= 0) {
      this.activeIndex = nextIndex;
      const level = this.built[nextIndex].definition;
      GameManager.setLevel(level, nextIndex + this.indexOffset);
      return level;
    }

    return this.activeLevel;
  }

  getActiveStartX() {
    return this.built[Math.max(0, this.activeIndex)]?.startX ?? 0;
  }

  isFinished(playerX: number) {
    const last = this.built[this.built.length - 1];
    return Boolean(last && playerX >= last.endX - 80);
  }

  getLevelProgress(playerX: number) {
    const active = this.built[Math.max(0, this.activeIndex)] ?? this.built[0];
    if (!active) return 0;
    return Math.min(1, Math.max(0, (playerX - active.startX) / Math.max(1, active.endX - active.startX)));
  }
}
