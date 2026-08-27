import * as Phaser from "phaser";
import { SpritePool } from "./SpritePool";

export class VFXManager {
  private sparkPool: SpritePool;
  private ghostPool: SpritePool;

  constructor(private scene: Phaser.Scene) {
    this.sparkPool = new SpritePool(scene, "vfx-dot", 96);
    this.ghostPool = new SpritePool(scene, "vfx-dot", 48);
  }

  burst(x: number, y: number, color = 0xffd452, count = 8, speed = 130) {
    for (let index = 0; index < count; index += 1) {
      const particle = this.sparkPool.acquire();
      if (!particle) break;
      const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
      const distance = Phaser.Math.Between(Math.round(speed * 0.55), speed);
      particle.setPosition(x, y).setTint(color).setAlpha(1).setScale(Phaser.Math.FloatBetween(0.5, 1.1)).setActive(true).setVisible(true).setDepth(100);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.15,
        duration: Phaser.Math.Between(260, 480),
        ease: "Quad.out",
        onComplete: () => this.sparkPool.release(particle),
      });
    }
  }

  ring(x: number, y: number, color = 0x66d9ff, radius = 24, endRadius = 84, alpha = 0.6) {
    const ring = this.scene.add.circle(x, y, radius, color, 0.08).setStrokeStyle(3, color, alpha).setDepth(98);
    this.scene.tweens.add({
      targets: ring,
      radius: endRadius,
      alpha: 0,
      duration: 280,
      ease: 'Quad.out',
      onComplete: () => ring.destroy(),
    });
  }

  afterImage(x: number, y: number, color = 0xffffff, scale = 18, alpha = 0.18) {
    const ghost = this.ghostPool.acquire();
    if (!ghost) return;
    ghost.setPosition(x, y).setTint(color).setScale(scale / 8).setAlpha(alpha).setDepth(46).setActive(true).setVisible(true);
    this.scene.tweens.add({
      targets: ghost,
      scale: 0.2,
      alpha: 0,
      duration: 180,
      onComplete: () => this.ghostPool.release(ghost),
    });
  }

  perfect(x: number, y: number) {
    this.burst(x, y, 0x66cfff, 10, 150);
    this.burst(x, y, 0xffd452, 8, 110);
    this.ring(x, y, 0xffffff, 12, 54, 0.42);
  }

  destroy() {
    this.sparkPool.destroy();
    this.ghostPool.destroy();
  }
}
