import * as Phaser from "phaser";
import type { StaticPlatformKind } from "./PlatformPrefab";

function shade(color: number, amount: number) {
  const r = Math.max(0, Math.min(255, ((color >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (color & 255) + amount));
  return (r << 16) | (g << 8) | b;
}

export class PlatformVisual {
  readonly container: Phaser.GameObjects.Container;
  private glow?: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    kind: StaticPlatformKind,
    accent: number,
  ) {
    const color = kind === "secret" ? 0x53dfff : kind === "boost" ? 0xffd452 : accent;
    const shadow = scene.add.rectangle(9, 18, width + 8, 24, 0x000000, 0.25).setOrigin(0.5);
    const side = scene.add.rectangle(0, 13, width, 26, shade(color, -82), 0.98).setOrigin(0.5);
    const front = scene.add.rectangle(0, 7, width, 16, shade(color, -46), 1).setOrigin(0.5);
    const top = scene.add.rectangle(0, -5, width, 18, color, 1).setOrigin(0.5);
    const highlight = scene.add.rectangle(0, -12, width - 10, 3, 0xffffff, 0.34).setOrigin(0.5);
    const edge = scene.add.rectangle(0, 0, width - 6, 3, 0x07111f, 0.32).setOrigin(0.5);

    const children: Phaser.GameObjects.GameObject[] = [shadow, side, front, top, highlight, edge];

    for (let bx = -width / 2 + 18; bx < width / 2 - 8; bx += 56) {
      const bolt = scene.add.circle(bx, -5, 2.3, 0xeaf3ff, 0.75).setStrokeStyle(1, 0x16283d, 0.7);
      children.push(bolt);
    }

    if (kind === "boost") {
      this.glow = scene.add.rectangle(0, -9, Math.max(40, width * 0.5), 8, 0x49d8ff, 0.56).setOrigin(0.5);
      const stripeA = scene.add.rectangle(-18, -8, 22, 3, 0x07111f, 0.72).setAngle(-12);
      const stripeB = scene.add.rectangle(18, -8, 22, 3, 0x07111f, 0.72).setAngle(12);
      children.push(this.glow, stripeA, stripeB);
      scene.tweens.add({ targets: this.glow, alpha: { from: 0.38, to: 0.82 }, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    }

    if (kind === "secret") {
      const secretGlow = scene.add.rectangle(0, -6, width + 14, 24, 0x58edff, 0.14).setOrigin(0.5);
      children.unshift(secretGlow);
      scene.tweens.add({ targets: secretGlow, alpha: { from: 0.08, to: 0.24 }, duration: 620, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    }

    this.container = scene.add.container(x, y, children).setDepth(18);
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }

  setAlpha(alpha: number) {
    this.container.setAlpha(alpha);
  }

  setAngle(angle: number) {
    this.container.setAngle(angle);
  }

  destroy() {
    this.container.destroy(true);
  }
}
