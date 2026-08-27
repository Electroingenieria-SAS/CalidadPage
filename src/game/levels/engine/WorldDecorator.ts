import * as Phaser from "phaser";
import type { LevelDefinition } from "./LevelTypes";

function shade(color: number, amount: number) {
  const r = Math.max(0, Math.min(255, ((color >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (color & 255) + amount));
  return (r << 16) | (g << 8) | b;
}

/** Richer 2.5D dressing so the road feels like a built stage, not a flat strip. */
export class WorldDecorator {
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private scene: Phaser.Scene,
    private level: LevelDefinition,
    private groundY: number,
  ) {}

  build(startX: number, length: number) {
    const { scene, level, groundY } = this;
    const accent = level.theme.accent;
    const dark = shade(level.theme.road, -64);
    const mid = shade(level.theme.shoulder, -36);

    for (let x = startX + 420, index = 0; x < startX + length - 260; x += 520, index += 1) {
      const support = scene.add.rectangle(x, groundY - 46, 22, 104, dark, 0.85).setDepth(5);
      const base = scene.add.rectangle(x, groundY + 2, 34, 16, mid, 0.95).setDepth(6);
      const arm = scene.add.rectangle(x + 32, groundY - 86, 70, 10, dark, 0.92).setDepth(5);
      const sign = scene.add.rectangle(x + 62, groundY - 64, 52, 34, level.theme.shoulder, 0.6).setStrokeStyle(2, accent, 0.22).setDepth(5);
      const signGlow = scene.add.rectangle(x + 62, groundY - 64, 26, 5, accent, 0.28).setDepth(6);
      this.objects.push(support, base, arm, sign, signGlow);

      if (index % 2 === 0) {
        const lamp = scene.add.image(x - 112, groundY - 18, "decor-lamp")
          .setOrigin(0.5, 1)
          .setDisplaySize(80, 122)
          .setAlpha(0.58)
          .setDepth(5);
        this.objects.push(lamp);
      } else {
        const pole = scene.add.image(x + 118, groundY - 20, "decor-pole")
          .setOrigin(0.5, 1)
          .setDisplaySize(100, 146)
          .setAlpha(0.54)
          .setDepth(5);
        this.objects.push(pole);
      }
    }

    for (let x = startX + 980, index = 0; x < startX + length - 900; x += 1680, index += 1) {
      const archShadow = scene.add.rectangle(x + 8, groundY - 184, 412, 24, 0x000000, 0.18).setDepth(3);
      const archTop = scene.add.rectangle(x, groundY - 192, 396, 18, dark, 0.88).setDepth(4);
      const left = scene.add.rectangle(x - 188, groundY - 108, 22, 152, dark, 0.88).setDepth(4);
      const right = scene.add.rectangle(x + 188, groundY - 108, 22, 152, dark, 0.88).setDepth(4);
      const banner = scene.add.rectangle(x, groundY - 192, 220, 44, level.theme.shoulder, 0.42).setStrokeStyle(2, accent, 0.28).setDepth(5);
      const lightA = scene.add.circle(x - 70, groundY - 192, 6, accent, 0.45).setDepth(6);
      const lightB = scene.add.circle(x + 70, groundY - 192, 6, accent, 0.45).setDepth(6);
      this.objects.push(archShadow, archTop, left, right, banner, lightA, lightB);

      if (index % 2 === 1) {
        const scaffold = scene.add.rectangle(x + 260, groundY - 92, 96, 124, level.theme.shoulder, 0.22).setStrokeStyle(2, accent, 0.16).setDepth(3);
        this.objects.push(scaffold);
      }
    }
  }

  destroy() {
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }
}
