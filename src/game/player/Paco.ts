import * as Phaser from "phaser";
import { PLAYER_PHYSICS } from "../config/PhysicsConfig";
import { EventManager } from "../core/EventManager";
import { PacoAnimations } from "./PacoAnimations";
import { PacoController } from "./PacoController";

export class Paco {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly visual: Phaser.GameObjects.Image;
  readonly controller: PacoController;
  readonly animations: PacoAnimations;
  isMini = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "paco-body");
    this.sprite.setOrigin(0.5, 1).setAlpha(0.001).setDepth(49);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_PHYSICS.bodyWidth, PLAYER_PHYSICS.bodyHeight, false);
    body.setOffset(PLAYER_PHYSICS.bodyOffsetX, PLAYER_PHYSICS.bodyOffsetY);
    body.setMaxVelocity(1200, 1450); body.setCollideWorldBounds(false);
    this.visual = scene.add.image(x, y + PLAYER_PHYSICS.visualYOffset, "paco-idle").setDisplaySize(PLAYER_PHYSICS.visualSize, PLAYER_PHYSICS.visualSize).setOrigin(0.5).setDepth(50);
    this.controller = new PacoController(scene, this.sprite);
    this.animations = new PacoAnimations(scene, this.sprite, this.visual);
  }

  setMini(mini: boolean) {
    if (this.isMini === mini) return;
    this.isMini = mini;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (mini) { body.setSize(36, 48, false); body.setOffset(14, 34); }
    else { body.setSize(PLAYER_PHYSICS.bodyWidth, PLAYER_PHYSICS.bodyHeight, false); body.setOffset(PLAYER_PHYSICS.bodyOffsetX, PLAYER_PHYSICS.bodyOffsetY); }
    EventManager.emit('player:mini', { mini });
  }

  update(time: number, delta: number, speed: number) {
    this.controller.update(time, delta, speed);
    this.animations.update(this.controller.state.state, delta, speed, this.controller.mode, this.isMini);
  }

  destroy() { this.controller.destroy(); this.animations.destroy(); this.visual.destroy(); this.sprite.destroy(); }
}
