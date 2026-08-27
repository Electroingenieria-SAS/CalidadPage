import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { GameManager } from "../core/GameManager";

export class SpeedTrigger {
  readonly zone: Phaser.GameObjects.Zone;
  private used = false;

  constructor(scene: Phaser.Scene, x: number, y: number, private multiplier: number, private durationMs: number) {
    this.zone = scene.add.zone(x, y, 80, 360);
    scene.physics.add.existing(this.zone, true);
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.zone, () => {
      if (this.used) return;
      this.used = true;
      GameManager.setTemporarySpeed(this.multiplier, this.durationMs, scene.time.now);
    });
  }

  destroy() {
    this.zone.destroy();
  }
}
