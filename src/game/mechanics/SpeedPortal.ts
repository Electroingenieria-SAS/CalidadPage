import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { GameManager } from "../core/GameManager";
import { EventManager } from "../core/EventManager";

export class SpeedPortal {
  readonly zone: Phaser.GameObjects.Zone;
  private visual: Phaser.GameObjects.Container;
  private used = false;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, private multiplier: number, private durationMs: number) {
    this.zone = scene.add.zone(x, y, 84, 150);
    scene.physics.add.existing(this.zone, true);

    const haloBack = scene.add.ellipse(0, 0, 82, 128, 0x60d7ff, 0.12).setStrokeStyle(3, 0xbef1ff, 0.44);
    const haloFront = scene.add.ellipse(0, 0, 54, 94, 0x102640, 0.92).setStrokeStyle(5, 0x60d7ff, 0.92);
    const core = scene.add.ellipse(0, 0, 26, 70, 0xffd452, 0.88).setStrokeStyle(2, 0xfff3bb, 0.94);
    const markA = scene.add.triangle(-10, 0, 0, -12, 20, 0, 0, 12, 0xffffff, 0.96);
    const markB = scene.add.triangle(10, 0, 0, -12, 20, 0, 0, 12, 0xffffff, 0.96);
    this.visual = scene.add.container(x, y, [haloBack, haloFront, core, markA, markB]).setDepth(22);

    this.tween = scene.tweens.add({
      targets: [haloBack, haloFront],
      scaleX: { from: 1, to: 1.09 },
      scaleY: { from: 1, to: 1.04 },
      alpha: { from: 0.92, to: 1 },
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.zone, () => {
      if (this.used) return;
      this.used = true;
      GameManager.setTemporarySpeed(this.multiplier, this.durationMs, scene.time.now);
      EventManager.emit('ui:message', {
        title: 'PORTAL DE VELOCIDAD',
        body: `Flujo aumentado x${this.multiplier.toFixed(2)}.`,
        tone: 'normal',
      });
      scene.tweens.add({
        targets: this.visual,
        alpha: 0.4,
        scaleX: 1.24,
        duration: 180,
        yoyo: true,
        repeat: 1,
      });
    });
  }

  destroy() {
    this.tween.destroy();
    this.visual.destroy(true);
    this.zone.destroy();
  }
}
