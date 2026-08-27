import * as Phaser from "phaser";

export class SpritePool {
  private pool: Phaser.GameObjects.Image[] = [];

  constructor(
    private scene: Phaser.Scene,
    private texture: string,
    size = 48,
  ) {
    for (let index = 0; index < size; index += 1) {
      const sprite = scene.add.image(-9999, -9999, texture).setActive(false).setVisible(false);
      this.pool.push(sprite);
    }
  }

  acquire() {
    return this.pool.find((item) => !item.active) ?? null;
  }

  release(sprite: Phaser.GameObjects.Image) {
    sprite.setActive(false).setVisible(false).setPosition(-9999, -9999).setAlpha(1).setScale(1).setAngle(0);
  }

  destroy() {
    this.pool.forEach((item) => item.destroy());
    this.pool = [];
  }
}
