import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";

export class GravityTrigger {
  readonly zone: Phaser.GameObjects.Zone;
  private used = false;
  private visual: Phaser.GameObjects.Container;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, private gravityScale: 1 | -1) {
    this.zone = scene.add.zone(x, y, 90, 340);
    scene.physics.add.existing(this.zone, true);

    const color = gravityScale < 0 ? 0xc57cff : 0x6ed0ff;
    const haloBack = scene.add.ellipse(0, 0, 88, 142, color, 0.12).setStrokeStyle(2, 0xffffff, 0.15);
    const haloFront = scene.add.ellipse(0, 0, 58, 108, 0x11233d, 0.92).setStrokeStyle(4, color, 0.92);
    const arrowA = gravityScale < 0
      ? scene.add.triangle(0, -8, 0, 10, 14, -8, -14, -8, 0xffffff, 0.95)
      : scene.add.triangle(0, 8, 0, -10, 14, 8, -14, 8, 0xffffff, 0.95);
    const arrowB = gravityScale < 0
      ? scene.add.triangle(0, 18, 0, 10, 12, -6, -12, -6, color, 0.9)
      : scene.add.triangle(0, -18, 0, -10, 12, 6, -12, 6, color, 0.9);
    this.visual = scene.add.container(x, y, [haloBack, haloFront, arrowA, arrowB]).setDepth(21);
    this.tween = scene.tweens.add({ targets: [haloBack, haloFront], scaleX: 1.09, scaleY: 1.04, alpha: { from: 0.92, to: 1 }, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.zone, () => {
      if (this.used) return;
      this.used = true;
      paco.controller.setGravitySign(this.gravityScale);
      EventManager.emit('ui:message', {
        title: this.gravityScale < 0 ? 'PORTAL DE GRAVEDAD INVERTIDA' : 'PORTAL DE GRAVEDAD NORMAL',
        body: this.gravityScale < 0 ? 'Ahora debes leer el techo como si fuera el piso.' : 'Recupera la lectura normal del circuito.',
        tone: 'warning',
      });
      scene.tweens.add({
        targets: this.visual,
        alpha: 0.3,
        scaleX: 1.2,
        scaleY: 1.2,
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
