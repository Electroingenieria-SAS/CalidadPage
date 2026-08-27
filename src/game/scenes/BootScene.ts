import * as Phaser from "phaser";
import { GameManager } from "../core/GameManager";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    GameManager.reset();

    const g = new Phaser.GameObjects.Graphics(this);

    g.clear().fillStyle(0xffffff, 1).fillRect(0, 0, 8, 8);
    g.generateTexture("road-pixel", 8, 8);
    g.generateTexture("vfx-dot", 8, 8);

    // Dedicated, fixed-size player body. The visual image is now a separate
    // object and can never resize / offset the Arcade hitbox.
    g.clear().fillStyle(0xffffff, 1).fillRect(0, 0, 64, 82);
    g.generateTexture("paco-body", 64, 82);

    g.clear().fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 64, 24, 12);
    g.generateTexture("vfx-pulse", 64, 24);

    g.destroy();
    this.scene.start("PreloadScene");
  }
}
