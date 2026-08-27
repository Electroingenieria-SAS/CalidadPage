import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";

export class MiniPortal {
  readonly zone: Phaser.GameObjects.Zone;
  private visual: Phaser.GameObjects.Container;
  private tween: Phaser.Tweens.Tween;
  private used = false;

  constructor(scene: Phaser.Scene, x: number, y: number, private mini: boolean) {
    const color = mini ? 0x70f0b6 : 0xffd452;
    this.zone = scene.add.zone(x, y, 82, 170);
    scene.physics.add.existing(this.zone, true);
    const halo = scene.add.ellipse(0, 0, 78, 132, color, 0.11).setStrokeStyle(2, color, 0.28);
    const ring = scene.add.ellipse(0, 0, 52, 102, 0x11243a, 0.95).setStrokeStyle(4, color, 0.92);
    const a = scene.add.rectangle(0, mini ? -8 : 8, mini ? 18 : 34, mini ? 18 : 34, color, 0.92).setStrokeStyle(2, 0xffffff, 0.58);
    const b = scene.add.rectangle(0, mini ? 16 : -18, mini ? 8 : 14, mini ? 8 : 14, 0xffffff, 0.8);
    this.visual = scene.add.container(x, y, [halo, ring, a, b]).setDepth(22);
    this.tween = scene.tweens.add({ targets: [halo, a], scale: { from: 0.94, to: 1.08 }, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.zone, () => {
      if (this.used) return;
      this.used = true;
      paco.setMini(this.mini);
      EventManager.emit('ui:message', { title: this.mini ? 'PORTAL MINI' : 'TAMAÑO NORMAL', body: this.mini ? 'Hitbox reducida: entra en corredores más estrechos.' : 'Paco recupera su tamaño normal.', tone: 'normal' });
      scene.tweens.add({ targets: this.visual, alpha: 0.35, scale: 1.2, duration: 160, yoyo: true, repeat: 1 });
    });
  }

  destroy() { this.tween.destroy(); this.visual.destroy(true); this.zone.destroy(); }
}
