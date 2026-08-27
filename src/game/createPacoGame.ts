import * as Phaser from "phaser";
import { createGameConfig } from "./config/GameConfig";
import { EventManager } from "./core/EventManager";
import { GameManager } from "./core/GameManager";

export function createPacoGame(parent: HTMLElement) {
  GameManager.reset();
  const game = new Phaser.Game(createGameConfig(parent));

  return () => {
    EventManager.clear();
    game.destroy(true);
  };
}
