import * as Phaser from "phaser";
import { AssetLoader } from "../core/AssetLoader";
import { SHARED_ASSET_GROUPS } from "../config/AssetManifest";
import { EventManager } from "../core/EventManager";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x07111f);
    const title = this.add.text(width / 2, height / 2 - 30, "ENERGIZANDO A PACO", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "18px",
      color: "#eaf6ff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const track = this.add.rectangle(width / 2, height / 2 + 18, 360, 6, 0x19324c, 1).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 180, height / 2 + 18, 360, 6, 0xffd452, 1).setOrigin(0, 0.5).setScale(0, 1);

    this.load.on("progress", (value: number) => bar.setScale(value, 1));
    this.load.once("complete", () => {
      bg.destroy(); title.destroy(); track.destroy(); bar.destroy();
    });

    AssetLoader.queueGroups(this, SHARED_ASSET_GROUPS);
  }

  create() {
    EventManager.emit("game:ready");
    this.scene.start("LevelSelectScene");
  }
}
