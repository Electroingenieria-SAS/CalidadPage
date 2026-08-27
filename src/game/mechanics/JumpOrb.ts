import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";

export class JumpOrb {
  readonly object: Phaser.GameObjects.Arc;
  private visual: Phaser.GameObjects.Container;
  private cooldownUntil = 0;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, private power = 900) {
    this.object = scene.add.circle(x, y, 22, 0xffffff, 0.001).setDepth(21);
    scene.physics.add.existing(this.object, true);

    const halo = scene.add.circle(0, 0, 29, 0x31baff, 0.13).setStrokeStyle(2, 0x77e7ff, 0.32);
    const ring = scene.add.circle(0, 0, 20, 0x0a1d35, 0.95).setStrokeStyle(5, 0x46d7ff, 0.96);
    const core = scene.add.circle(0, 0, 10, 0xffd452, 1).setStrokeStyle(2, 0xfff2a8, 0.92);
    const bolt = scene.add.polygon(0, 0, [0,-10,7,-2,2,-2,8,9,-2,3,-1,3,-7,10,-3,0], 0x07111f, 0.95);
    this.visual = scene.add.container(x, y, [halo, ring, core, bolt]).setDepth(21);
    this.tween = scene.tweens.add({ targets: halo, scale: 1.24, alpha: { from: 0.1, to: 0.28 }, duration: 520, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.object, () => {
      if (scene.time.now < this.cooldownUntil) return;
      paco.controller.setOrb(this.power, 220);
      this.cooldownUntil = scene.time.now + 180;
    });
  }

  destroy() {
    this.tween.destroy();
    this.visual.destroy(true);
    this.object.destroy();
  }
}
