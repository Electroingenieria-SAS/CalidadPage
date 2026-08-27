import * as Phaser from "phaser";
import { PlatformVisual } from "../levels/prefabs/PlatformVisual";

export class MovingPlatform {
  readonly object: Phaser.GameObjects.Rectangle;
  private visual: PlatformVisual;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, range: number, durationMs: number, color: number) {
    this.object = scene.add.rectangle(x, y, width, 24, 0xffffff, 0.001).setDepth(17);
    scene.physics.add.existing(this.object, true);
    this.visual = new PlatformVisual(scene, x, y, width, "standard", color);

    this.tween = scene.tweens.add({
      targets: this.object,
      y: y - range,
      duration: durationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
      onUpdate: () => {
        const body = this.object.body as Phaser.Physics.Arcade.StaticBody;
        body.updateFromGameObject();
        this.visual.setPosition(this.object.x, this.object.y);
      },
    });
  }

  destroy() {
    this.tween.destroy();
    this.visual.destroy();
    this.object.destroy();
  }
}
