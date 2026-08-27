import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";

/**
 * Controlled air-jump power. `jumps=1` means double jump, `jumps=2` means
 * triple jump. The trigger spans the playable runner corridor so the power
 * cannot be accidentally missed because of a few pixels of vertical offset.
 */
export class DoubleJumpPower {
  readonly object: Phaser.GameObjects.Rectangle;
  private visual: Phaser.GameObjects.Container;
  private collected = false;
  private tween: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private jumps = 1,
    private durationMs = 9000,
  ) {
    const safeJumps = Phaser.Math.Clamp(Math.floor(jumps), 1, 2);
    this.jumps = safeJumps;

    // PatternRegistry normalizes these powers to 85px above the road. Infer the
    // road line from the visual position so LevelBuilder keeps its stable API.
    const groundY = y + 85;
    // Mandatory powers are collected by crossing x, regardless of whether Paco
    // is on the road or on a nearby platform. The visual remains compact.
    this.object = scene.add.rectangle(x, groundY - 180, 96, 360, 0xffffff, 0.001).setDepth(22);
    scene.physics.add.existing(this.object, true);
    (this.object.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

    const triple = safeJumps >= 2;
    const auraColor = triple ? 0xff72d2 : 0x8c7cff;
    const halo = scene.add.circle(0, 0, 35, auraColor, 0.16).setStrokeStyle(2, 0xffffff, 0.36);
    const ring = scene.add.circle(0, 0, 24, 0x12203a, 0.96).setStrokeStyle(4, auraColor, 0.95);
    const core = scene.add.polygon(
      0,
      0,
      [0, -16, 6, -5, 16, -5, 8, 2, 10, 14, 0, 7, -10, 14, -8, 2, -16, -5, -6, -5],
      0xffd452,
      1,
    ).setStrokeStyle(2, 0xfff8c9, 0.9);
    const wingL = scene.add.triangle(-19, 0, 0, 0, 12, -6, 12, 6, 0x6ed0ff, 0.95);
    const wingR = scene.add.triangle(19, 0, 0, 0, -12, -6, -12, 6, 0x6ed0ff, 0.95);
    const label = scene.add.text(0, 31, triple ? "×3" : "×2", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#ffffff",
      backgroundColor: "rgba(5,13,28,.78)",
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5);

    this.visual = scene.add.container(x, y, [halo, wingL, wingR, ring, core, label]).setDepth(22);
    this.tween = scene.tweens.add({
      targets: [halo, core, wingL, wingR],
      y: "-=6",
      scale: { from: 1, to: 1.08 },
      alpha: { from: 0.92, to: 1 },
      duration: triple ? 400 : 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  attach(scene: Phaser.Scene, paco: Paco) {
    scene.physics.add.overlap(paco.sprite, this.object, () => {
      if (this.collected) return;
      this.collected = true;
      paco.controller.grantAirJumps(this.jumps, this.durationMs);

      const triple = this.jumps >= 2;
      EventManager.emit("ui:message", {
        title: triple ? "PODER · TRIPLE SALTO" : "PODER · DOBLE SALTO",
        body: triple
          ? "Durante esta sección puedes hacer dos saltos adicionales en el aire."
          : "Durante esta sección puedes hacer un salto adicional en el aire.",
        tone: "success",
      });

      this.tween.destroy();
      scene.tweens.add({
        targets: this.visual,
        alpha: 0,
        scale: 1.4,
        duration: 180,
        onComplete: () => this.visual.destroy(true),
      });
      this.object.destroy();
    });
  }

  destroy() {
    if (this.tween) this.tween.destroy();
    if (this.visual?.active) this.visual.destroy(true);
    if (this.object?.active) this.object.destroy();
  }
}
