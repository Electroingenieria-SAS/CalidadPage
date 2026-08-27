import * as Phaser from "phaser";
import type { LevelDefinition } from "../levels/engine/LevelTypes";

export type PacoGameEventMap = {
  "game:ready": undefined;
  "game:start": undefined;
  "game:restart": undefined;
  "game:levels": undefined;
  "game:over": { score: number; distance: number; energy: number };
  "game:complete": { score: number; distance: number; energy: number };
  "level:changed": { level: LevelDefinition; index: number };
  "level:fact": { title: string; body: string };
  "level:setpiece": { kind: string; active: boolean };
  "player:jump": undefined;
  "player:doubleJump": undefined;
  "player:pad": { x: number; y: number; targetX: number; velocityY: number };
  "player:land": { impact: number };
  "player:gravity": { gravitySign: 1 | -1 };
  "player:mode": { mode: "runner" | "ship" | "wave" };
  "player:mini": { mini: boolean };
  "player:perfect": { x: number; y: number };
  "player:secret": undefined;
  "pickup:energy": { amount: number; secret: boolean };
  "combo:changed": { combo: number };
  "speed:changed": { speed: number };
  "boss:health": { current: number; max: number; phase: number };
  "boss:defeated": undefined;
  "ui:message": { title: string; body?: string; tone?: "normal" | "warning" | "success" };
};

class TypedEventManager {
  private emitter = new Phaser.Events.EventEmitter();

  emit<K extends keyof PacoGameEventMap>(event: K, payload?: PacoGameEventMap[K]) {
    this.emitter.emit(event as string, payload);
  }

  on<K extends keyof PacoGameEventMap>(event: K, handler: (payload: PacoGameEventMap[K]) => void, context?: unknown) {
    this.emitter.on(event as string, handler, context);
    return () => this.emitter.off(event as string, handler, context);
  }

  once<K extends keyof PacoGameEventMap>(event: K, handler: (payload: PacoGameEventMap[K]) => void, context?: unknown) {
    this.emitter.once(event as string, handler, context);
    return () => this.emitter.off(event as string, handler, context);
  }

  clear() {
    this.emitter.removeAllListeners();
  }
}

export const EventManager = new TypedEventManager();
