import * as Phaser from "phaser";

export const OBSTACLE_SPECS: Record<string, { width: number; height: number; points: number; hitboxScale: number }> = {
  cone: { width: 48, height: 48, points: 16, hitboxScale: 0.62 },
  pothole: { width: 88, height: 42, points: 24, hitboxScale: 0.62 },
  toolbox: { width: 68, height: 56, points: 24, hitboxScale: 0.68 },
  reel: { width: 74, height: 74, points: 28, hitboxScale: 0.68 },
  barrier: { width: 90, height: 68, points: 28, hitboxScale: 0.7 },
  cabinet: { width: 68, height: 96, points: 32, hitboxScale: 0.68 },
  spikerack: { width: 92, height: 62, points: 30, hitboxScale: 0.72 },
  generator: { width: 88, height: 96, points: 34, hitboxScale: 0.7 },
  compressor: { width: 94, height: 82, points: 32, hitboxScale: 0.72 },
  saw: { width: 86, height: 86, points: 34, hitboxScale: 0.62 },
};

export class ObstacleFactory {
  private decorations: Phaser.GameObjects.GameObject[] = [];

  constructor(private scene: Phaser.Scene, private group: Phaser.Physics.Arcade.StaticGroup) {}

  create(key: string, x: number, groundY: number) {
    const spec = OBSTACLE_SPECS[key] ?? OBSTACLE_SPECS.cone;

    const shadow = this.scene.add.ellipse(x + 4, groundY + 5, spec.width * 0.82, 12, 0x000000, 0.27).setDepth(22);
    const contact = this.scene.add.rectangle(x, groundY + 1, Math.max(28, spec.width * 0.56), 3, 0x07111f, 0.35).setDepth(23);
    this.decorations.push(shadow, contact);

    const sprite = this.group.create(x, groundY, `obstacle-${key}`) as Phaser.Physics.Arcade.Sprite;
    sprite.setOrigin(0.5, 1).setDisplaySize(spec.width, spec.height).setDepth(24);
    sprite.setData("obstacleKey", key);
    sprite.setData("points", spec.points);
    sprite.setData("perfectChecked", false);
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(sprite.width * spec.hitboxScale, sprite.height * 0.72, false);
    body.setOffset((sprite.width - body.width) * 0.5, sprite.height - body.height);
    body.updateFromGameObject();

    if (key === 'saw') {
      this.scene.tweens.add({ targets: sprite, angle: 360, duration: 700, repeat: -1, ease: 'Linear' });
      const spark = this.scene.add.circle(x, groundY - spec.height + 12, 8, 0x9de5ff, 0.18).setDepth(23);
      this.scene.tweens.add({ targets: spark, alpha: { from: 0.15, to: 0.35 }, scale: 1.25, duration: 220, yoyo: true, repeat: -1 });
      this.decorations.push(spark);
    }

    if (key === 'generator' || key === 'compressor') {
      this.scene.tweens.add({ targets: sprite, alpha: { from: 0.9, to: 1 }, duration: key === 'generator' ? 560 : 720, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    if (key === 'spikerack') {
      const light = this.scene.add.rectangle(x, groundY - spec.height + 26, spec.width * 0.72, 6, 0xfff0a4, 0.2).setDepth(23);
      this.scene.tweens.add({ targets: light, alpha: { from: 0.08, to: 0.28 }, duration: 340, yoyo: true, repeat: -1 });
      this.decorations.push(light);
    }

    return sprite;
  }

  destroy() {
    this.decorations.forEach((item) => item.destroy());
    this.decorations = [];
  }
}
