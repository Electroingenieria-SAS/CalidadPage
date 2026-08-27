import * as Phaser from "phaser";
import type { LevelTheme } from "../levels/engine/LevelTypes";

const BG_WIDTH = 1024;
const BG_HEIGHT = 300;

function ensureProceduralTextures(scene: Phaser.Scene) {
  if (scene.textures.exists("paco-bg-far")) return;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Far mountains: multiple shaded faces produce a clean 2.5D silhouette.
  g.clear();
  g.fillStyle(0xffffff, 0.74);
  g.fillTriangle(0, 300, 170, 80, 360, 300);
  g.fillTriangle(250, 300, 510, 40, 760, 300);
  g.fillTriangle(620, 300, 850, 92, 1024, 300);
  g.fillStyle(0xb6b6b6, 0.88);
  g.fillTriangle(170, 80, 360, 300, 270, 300);
  g.fillTriangle(510, 40, 760, 300, 620, 300);
  g.fillTriangle(850, 92, 1024, 300, 955, 300);
  g.fillStyle(0xf2f2f2, 0.58);
  g.fillTriangle(170, 80, 122, 142, 208, 122);
  g.fillTriangle(510, 40, 456, 116, 550, 98);
  g.fillTriangle(850, 92, 806, 146, 884, 132);
  g.generateTexture("paco-bg-far", BG_WIDTH, BG_HEIGHT);

  // Mid landscape / engineered viaducts.
  g.clear();
  g.fillStyle(0xd5d5d5, 0.88);
  for (let x = 0; x < BG_WIDTH; x += 180) {
    const h = 70 + ((x / 180) % 3) * 16;
    g.fillRoundedRect(x + 18, 300 - h, 125, h, 14);
    g.fillStyle(0x8f8f8f, 0.92);
    g.fillRect(x + 32, 300 - h + 16, 18, h - 16);
    g.fillRect(x + 94, 300 - h + 16, 18, h - 16);
    g.fillStyle(0xd5d5d5, 0.88);
  }
  g.fillStyle(0xb0b0b0, 0.9);
  g.fillRect(0, 250, BG_WIDTH, 14);
  for (let x = 40; x < BG_WIDTH; x += 150) g.fillRect(x, 250, 16, 50);
  g.generateTexture("paco-bg-mid", BG_WIDTH, BG_HEIGHT);

  // Industrial skyline with depth faces.
  g.clear();
  for (let x = 12, i = 0; x < BG_WIDTH; x += 110, i += 1) {
    const w = 58 + (i % 3) * 12;
    const h = 78 + (i % 4) * 24;
    g.fillStyle(0xcfcfcf, 0.92);
    g.fillRoundedRect(x, 300 - h, w, h, 6);
    g.fillStyle(0x888888, 0.96);
    g.fillRect(x + w - 11, 300 - h + 8, 11, h - 8);
    g.fillStyle(0xf3f3f3, 0.45);
    for (let wy = 300 - h + 18; wy < 286; wy += 22) g.fillRect(x + 10, wy, Math.max(14, w - 32), 4);
    if (i % 2 === 0) {
      g.fillStyle(0xbcbcbc, 0.9);
      g.fillRect(x + w * 0.44, 300 - h - 30, 8, 30);
      g.fillCircle(x + w * 0.44 + 4, 300 - h - 34, 6);
    }
  }
  g.generateTexture("paco-bg-city", BG_WIDTH, BG_HEIGHT);

  // Near foliage / guard silhouettes.
  g.clear();
  g.fillStyle(0x8d8d8d, 0.96);
  for (let x = -20; x < BG_WIDTH; x += 72) {
    g.fillCircle(x + 28, 250, 48);
    g.fillCircle(x + 58, 266, 40);
  }
  g.fillStyle(0x666666, 1);
  g.fillRect(0, 274, BG_WIDTH, 26);
  g.generateTexture("paco-bg-near", BG_WIDTH, BG_HEIGHT);

  g.destroy();
}

export class ParallaxBackground {
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private shade: Phaser.GameObjects.Rectangle;
  private horizon: Phaser.GameObjects.Rectangle;
  private ambientGlow: Phaser.GameObjects.Arc;
  private factors = [0.018, 0.045, 0.085, 0.145];

  constructor(private scene: Phaser.Scene) {
    ensureProceduralTextures(scene);
    const { width, height } = scene.scale.gameSize;
    const keys = ["paco-bg-far", "paco-bg-mid", "paco-bg-city", "paco-bg-near"];
    const yOffsets = [height * 0.25, height * 0.42, height * 0.48, height * 0.53];
    const heights = [height * 0.48, height * 0.4, height * 0.38, height * 0.34];

    keys.forEach((key, index) => {
      const layer = scene.add.tileSprite(0, yOffsets[index], width, heights[index], key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-90 + index * 3)
        .setAlpha(index === 0 ? 0.52 : index === 3 ? 0.72 : 0.6);
      layer.tileScaleY = heights[index] / BG_HEIGHT;
      layer.tileScaleX = layer.tileScaleY;
      this.layers.push(layer);
    });

    this.ambientGlow = scene.add.circle(width * 0.72, height * 0.22, 150, 0xffffff, 0.055)
      .setScrollFactor(0)
      .setDepth(-95);

    this.shade = scene.add.rectangle(0, 0, width, height, 0x071426, 0.15)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-70)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.horizon = scene.add.rectangle(0, height * 0.62, width, height * 0.38, 0x0b213b, 0.12)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-69);

    scene.scale.on("resize", this.resize, this);
  }

  setTheme(theme: LevelTheme) {
    this.scene.cameras.main.setBackgroundColor(theme.sky);
    const tint = theme.tint ?? 0x88a8cb;
    this.layers[0]?.setTint(levelColor(tint, 44));
    this.layers[1]?.setTint(levelColor(tint, 16));
    this.layers[2]?.setTint(levelColor(theme.shoulder, 12));
    this.layers[3]?.setTint(levelColor(theme.road, 18));
    this.ambientGlow.setFillStyle(theme.accent, 0.07);
    this.shade.setFillStyle(theme.sky, theme.fogAlpha != null ? Math.max(0.1, theme.fogAlpha + 0.08) : 0.15);
    this.horizon.setFillStyle(theme.accent, 0.055);
  }

  update(cameraX: number) {
    this.layers.forEach((layer, index) => {
      const scale = Math.max(0.001, layer.tileScaleX);
      layer.tilePositionX = (cameraX * this.factors[index]) / scale;
    });
  }

  private resize(size: Phaser.Structs.Size) {
    const width = size.width;
    const height = size.height;
    const yOffsets = [height * 0.25, height * 0.42, height * 0.48, height * 0.53];
    const heights = [height * 0.48, height * 0.4, height * 0.38, height * 0.34];
    this.layers.forEach((layer, index) => {
      layer.setPosition(0, yOffsets[index]).setSize(width, heights[index]);
      layer.tileScaleY = heights[index] / BG_HEIGHT;
      layer.tileScaleX = layer.tileScaleY;
    });
    this.ambientGlow.setPosition(width * 0.72, height * 0.22);
    this.shade.setSize(width, height);
    this.horizon.setPosition(0, height * 0.62).setSize(width, height * 0.38);
  }

  destroy() {
    this.scene.scale.off("resize", this.resize, this);
    this.layers.forEach((layer) => layer.destroy());
    this.layers = [];
    this.ambientGlow.destroy();
    this.shade.destroy();
    this.horizon.destroy();
  }
}

function levelColor(color: number, amount: number) {
  const r = Math.max(0, Math.min(255, ((color >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (color & 255) + amount));
  return (r << 16) | (g << 8) | b;
}
