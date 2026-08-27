import type { LevelId } from "../levels/engine/LevelTypes";

export type PacoCheckpoint = {
  id: string;
  levelId: LevelId;
  x: number;
  createdAt: number;
};

/**
 * Stores the latest safe restart anchor independently from Scene construction.
 * V1 records level-entry checkpoints; future modes can opt into checkpoint restart
 * without changing LevelDefinition or PacoController.
 */
class PacoCheckpointManager {
  private current: PacoCheckpoint | null = null;

  set(checkpoint: PacoCheckpoint) {
    this.current = checkpoint;
  }

  get() {
    return this.current ? { ...this.current } : null;
  }

  clear() {
    this.current = null;
  }
}

export const CheckpointManager = new PacoCheckpointManager();
