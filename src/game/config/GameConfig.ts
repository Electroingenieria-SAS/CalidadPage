import * as Phaser from "phaser";
import { PHYSICS_CONFIG } from "./PhysicsConfig";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { LevelScene } from "../scenes/LevelScene";
import { LevelSelectScene } from "../scenes/LevelSelectScene";
import { UIScene } from "../scenes/UIScene";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#07111f",
    transparent: false,
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: "high-performance",
    physics: PHYSICS_CONFIG,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    dom: { createContainer: true },
    fps: {
      target: 120,
      min: 30,
      forceSetTimeOut: false,
      smoothStep: true,
    },
    scene: [BootScene, PreloadScene, LevelSelectScene, LevelScene, UIScene],
  };
}
