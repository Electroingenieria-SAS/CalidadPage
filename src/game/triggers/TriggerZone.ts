import * as Phaser from "phaser";

export type TriggerZoneOptions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  once?: boolean;
  onEnter: () => void;
};

/** Lightweight one-shot / repeatable Arcade trigger for Level Engine events. */
export class TriggerZone {
  readonly object: Phaser.GameObjects.Zone;
  private used = false;
  private collider: Phaser.Physics.Arcade.Collider;

  constructor(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    options: TriggerZoneOptions,
  ) {
    this.object = scene.add.zone(options.x, options.y, options.width ?? 100, options.height ?? 420);
    scene.physics.add.existing(this.object, true);
    this.collider = scene.physics.add.overlap(target, this.object, () => {
      if (this.used && options.once !== false) return;
      this.used = true;
      options.onEnter();
    });
  }

  reset() {
    this.used = false;
  }

  destroy() {
    this.collider.destroy();
    this.object.destroy();
  }
}
