import * as Phaser from "phaser";

export class CollectibleFactory {
  private decorations: Phaser.GameObjects.GameObject[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(private scene: Phaser.Scene, private group: Phaser.Physics.Arcade.StaticGroup) {}

  create(x: number, y: number, secret = false) {
    const halo = this.scene.add.circle(x, y, secret ? 30 : 25, secret ? 0x64efff : 0xffd452, secret ? 0.15 : 0.11)
      .setDepth(21);
    const ring = this.scene.add.circle(x, y, secret ? 22 : 19, 0x07111f, 0)
      .setStrokeStyle(2, secret ? 0x88f7ff : 0xffec94, secret ? 0.45 : 0.3)
      .setDepth(21);
    this.decorations.push(halo, ring);

    const sprite = this.group.create(x, y, "pickup-lightbulb") as Phaser.Physics.Arcade.Sprite;
    const size = secret ? 42 : 36;
    sprite.setDisplaySize(size, size).setDepth(22).setData("secret", secret).setData("decorations", [halo, ring]);
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(28, 28, false);
    body.updateFromGameObject();
    if (secret) sprite.setTint(0x77f4ff);

    const tween = this.scene.tweens.add({
      targets: [sprite, halo, ring],
      y: y - 6,
      duration: secret ? 720 : 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    const pulse = this.scene.tweens.add({
      targets: halo,
      scale: 1.2,
      alpha: { from: halo.alpha, to: secret ? 0.28 : 0.2 },
      duration: secret ? 520 : 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.tweens.push(tween, pulse);
    return sprite;
  }

  destroy() {
    this.tweens.forEach((tween) => tween.destroy());
    this.tweens = [];
    this.decorations.forEach((item) => item.destroy());
    this.decorations = [];
  }
}
