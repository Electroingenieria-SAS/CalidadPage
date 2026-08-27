import * as Phaser from "phaser";
import { GameManager } from "../core/GameManager";

export class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private enabled = false;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(12, 12, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#bde7ff",
      backgroundColor: "rgba(3,12,24,.72)",
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    scene.input.keyboard?.on("keydown-F3", () => {
      this.enabled = !this.enabled;
      this.text.setVisible(this.enabled);
    });
  }

  update(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    if (!this.enabled) return;
    const body = player.body as Phaser.Physics.Arcade.Body;
    this.text.setText([
      `FPS ${Math.round(scene.game.loop.actualFps)}`,
      `Level ${GameManager.currentLevelId}`,
      `Speed ${Math.round(GameManager.getEffectiveSpeed(scene.time.now))}`,
      `Player x=${Math.round(player.x)} y=${Math.round(player.y)}`,
      `Velocity ${Math.round(body.velocity.x)}, ${Math.round(body.velocity.y)}`,
      `Score ${GameManager.score} Combo x${GameManager.combo}`,
    ]);
  }

  destroy() {
    this.text.destroy();
  }
}
