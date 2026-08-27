import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";
import type { PacoMode } from "../player/PacoController";

const MODE_COLOR: Record<PacoMode, number> = {
  runner: 0xffd452,
  ship: 0x6ed0ff,
  wave: 0xc77dff,
};

export class ModePortal {
  readonly zone: Phaser.GameObjects.Zone;
  private visual: Phaser.GameObjects.Container;
  private used = false;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, private mode: PacoMode) {
    const color = MODE_COLOR[mode];
    this.zone = scene.add.zone(x, y, 92, 190);
    scene.physics.add.existing(this.zone, true);

    const halo = scene.add.ellipse(0, 0, 90, 146, color, 0.12).setStrokeStyle(2, 0xffffff, 0.16);
    const outer = scene.add.ellipse(0, 0, 62, 116, 0x10233a, 0.96).setStrokeStyle(5, color, 0.94);
    const inner = scene.add.ellipse(0, 0, 34, 82, color, 0.24).setStrokeStyle(2, 0xffffff, 0.38);
    const symbol = mode === 'ship'
      ? scene.add.triangle(0, 0, -16, 10, 16, 0, -16, -10, 0xffffff, 0.95)
      : mode === 'wave'
        ? scene.add.polygon(0, 0, [-18,8,-8,-8,4,8,16,-8], 0xffffff, 0.95)
        : scene.add.circle(0, 0, 11, 0xffffff, 0.95);
    this.visual = scene.add.container(x, y, [halo, outer, inner, symbol]).setDepth(22);
    this.tween = scene.tweens.add({ targets: [halo, inner], scale: 1.12, alpha: { from: 0.72, to: 1 }, duration: 440, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.zone, () => {
      if (this.used) return;
      this.used = true;
      paco.controller.setMode(this.mode);
      EventManager.emit('ui:message', {
        title: `MODO ${this.mode.toUpperCase()}`,
        body: this.mode === 'ship' ? 'Mantén pulsado para elevarte; suelta para descender.' : this.mode === 'wave' ? 'Pulsado sube en diagonal; suelta para bajar.' : 'Control clásico de salto restaurado.',
        tone: 'normal',
      });
      scene.tweens.add({ targets: this.visual, scaleX: 1.25, alpha: 0.35, duration: 170, yoyo: true, repeat: 1 });
    });
  }

  destroy() { this.tween.destroy(); this.visual.destroy(true); this.zone.destroy(); }
}
