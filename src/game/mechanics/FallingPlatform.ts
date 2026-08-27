import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { PlatformVisual } from "../levels/prefabs/PlatformVisual";

export class FallingPlatform {
  readonly object: Phaser.GameObjects.Rectangle;
  private visual: PlatformVisual;
  private triggered = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, private delayMs: number, color: number) {
    this.object = scene.add.rectangle(x, y, width, 24, 0xffffff, 0.001).setDepth(17);
    scene.physics.add.existing(this.object, true);
    this.visual = new PlatformVisual(scene, x, y, width, "standard", color);
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.collider(paco.sprite, this.object, () => {
      if (this.triggered) return;
      this.triggered = true;
      scene.time.delayedCall(this.delayMs, () => {
        scene.physics.world.disable(this.object);
        scene.tweens.add({
          targets: this.object,
          y: this.object.y + 320,
          alpha: 0,
          angle: 7,
          duration: 620,
          ease: "Quad.in",
          onUpdate: () => {
            this.visual.setPosition(this.object.x, this.object.y);
            this.visual.setAlpha(this.object.alpha);
            this.visual.setAngle(this.object.angle);
          },
        });
      });
    });
  }

  destroy() {
    this.visual.destroy();
    this.object.destroy();
  }
}
