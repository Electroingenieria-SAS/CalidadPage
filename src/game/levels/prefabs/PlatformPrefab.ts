import * as Phaser from "phaser";
import { PlatformVisual } from "./PlatformVisual";

export type StaticPlatformKind = "standard" | "boost" | "secret";

export class PlatformPrefab {
  readonly object: Phaser.GameObjects.Rectangle;
  readonly visual: PlatformVisual;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    kind: StaticPlatformKind,
    accent: number,
  ) {
    this.object = scene.add.rectangle(x + width / 2, y, width, 24, 0xffffff, 0.001).setDepth(17);
    scene.physics.add.existing(this.object, true);
    this.object.setData("platformKind", kind);
    this.visual = new PlatformVisual(scene, x + width / 2, y, width, kind, accent);
  }

  destroy() {
    this.visual.destroy();
    this.object.destroy();
  }
}
