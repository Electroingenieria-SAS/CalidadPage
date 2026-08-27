import * as Phaser from "phaser";
import { ASSET_GROUPS } from "../config/AssetManifest";

export class AssetLoader {
  static queueGroups(scene: Phaser.Scene, groups: string[]) {
    const seen = new Set<string>();
    for (const group of groups) {
      for (const asset of ASSET_GROUPS[group] ?? []) {
        if (seen.has(asset.key) || scene.textures.exists(asset.key) || scene.cache.audio.exists(asset.key)) continue;
        seen.add(asset.key);
        if (asset.kind === "image") scene.load.image(asset.key, asset.url);
        if (asset.kind === "audio") scene.load.audio(asset.key, asset.url);
      }
    }
  }
}
