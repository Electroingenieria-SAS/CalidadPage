import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";
import { GameManager } from "../core/GameManager";
import { solvePadTrajectory, type PadTargetKind } from "./PadTrajectory";

export type JumpPadPlan = {
  padX: number;
  padElevation: number;
  targetX: number;
  targetElevation: number;
  targetKind: PadTargetKind;
  landingMinX?: number;
  landingMaxX?: number;
  gapEndX?: number;
};

/**
 * Deterministic safe jump pad. The pad calculates one impulse from Paco's
 * actual contact position and current horizontal speed. After that one launch,
 * the normal PacoController owns the character again.
 */
export class JumpPad {
  readonly object: Phaser.GameObjects.Rectangle;
  private visual: Phaser.GameObjects.Container;
  private glow: Phaser.GameObjects.Arc;
  private top: Phaser.GameObjects.Rectangle;
  private arrowA: Phaser.GameObjects.Triangle;
  private arrowB: Phaser.GameObjects.Triangle;
  private tween: Phaser.Tweens.Tween;
  private cooldownUntil = -Infinity;

  constructor(private scene: Phaser.Scene, x: number, y: number, private plan: JumpPadPlan) {
    // Thin x-gate inside the pad: with Paco's 50px body this creates a broad
    // enough overlap window to never be skipped at 600px/s, while making the
    // actual launch x deterministic (near the visual pad center).
    this.object = scene.add.rectangle(x + 28, y - 20, 8, 60, 0xffffff, 0.001).setDepth(20);
    scene.physics.add.existing(this.object, true);
    const body = this.object.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(8, 60, true);
    body.updateFromGameObject();

    const shadow = scene.add.ellipse(5, 11, 82, 17, 0x000000, 0.3);
    const base = scene.add.rectangle(0, 4, 72, 20, 0x14283e, 1).setStrokeStyle(2, 0x3c5f79, 0.92);
    this.top = scene.add.rectangle(0, -5, 63, 12, 0x1f85ff, 1).setStrokeStyle(2, 0xb8f2ff, 0.95);
    this.glow = scene.add.circle(0, -9, 33, 0x34cfff, 0.16).setStrokeStyle(2, 0x74eaff, 0.44);
    this.arrowA = scene.add.triangle(-12, -7, 0, 10, 13, 0, 0, -10, 0xf5fcff, 0.98);
    this.arrowB = scene.add.triangle(12, -7, 0, 10, 13, 0, 0, -10, 0xf5fcff, 0.98);
    this.visual = scene.add.container(x, y, [shadow, this.glow, base, this.top, this.arrowA, this.arrowB]).setDepth(20);
    this.tween = scene.tweens.add({ targets: this.glow, scale: 1.2, alpha: { from: 0.12, to: 0.32 }, duration: 390, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.object, () => {
      if (scene.time.now < this.cooldownUntil || paco.controller.mode !== "runner") return;
      const body = paco.sprite.body as Phaser.Physics.Arcade.Body;
      const relativeVY = body.velocity.y * paco.controller.gravitySign;
      if (relativeVY < -240) return;

      const speed = GameManager.getEffectiveSpeed(scene.time.now);
      const solution = solvePadTrajectory({
        launchX: paco.sprite.x,
        speed,
        padElevation: this.plan.padElevation,
        targetKind: this.plan.targetKind,
        targetX: this.plan.targetX,
        targetElevation: this.plan.targetElevation,
        landingMinX: this.plan.landingMinX,
        landingMaxX: this.plan.landingMaxX,
        gapEndX: this.plan.gapEndX,
      });

      this.cooldownUntil = scene.time.now + 360;
      paco.controller.launchFromPad(solution.velocityY);
      EventManager.emit("player:pad", {
        x: this.visual.x,
        y: this.visual.y,
        targetX: solution.landingX,
        velocityY: solution.velocityY,
      });
      this.activateVisual(solution.safe);
    });
  }

  private activateVisual(safe: boolean) {
    this.scene.tweens.killTweensOf([this.top, this.arrowA, this.arrowB]);
    this.scene.tweens.add({ targets: this.top, y: 2, scaleX: 0.9, duration: 65, yoyo: true, ease: "Quad.out" });
    this.scene.tweens.add({ targets: [this.arrowA, this.arrowB], y: -17, alpha: { from: 1, to: 0.25 }, duration: 110, yoyo: true, ease: "Quad.out" });
    this.scene.tweens.add({ targets: this.glow, scale: safe ? 1.6 : 1.35, alpha: safe ? 0.58 : 0.42, duration: 115, yoyo: true, ease: "Quad.out" });
  }

  destroy() {
    this.tween.destroy();
    this.visual.destroy(true);
    this.object.destroy();
  }
}
