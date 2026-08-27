import { EventManager } from "./EventManager";
import type { LevelDefinition, LevelId } from "../levels/engine/LevelTypes";

export type GameStatus = "boot" | "ready" | "running" | "gameover" | "complete";

export type LeaderboardEntry = {
  name: string;
  score: number;
  distance: number;
  energy: number;
  date: string;
};

const LEADERBOARD_KEY = "calidadei-paco-phaser4-ranking-v1";
const MAX_SAFE_EFFECTIVE_SPEED = 600;

class PacoGameManager {
  status: GameStatus = "boot";
  score = 0;
  distance = 0;
  energy = 0;
  combo = 0;
  bestCombo = 0;
  perfect = 0;
  secrets = 0;
  currentLevelId: LevelId = "level_01";
  currentLevelIndex = 0;
  currentSpeed = 0;
  temporarySpeedMultiplier = 1;
  temporarySpeedUntil = 0;

  reset() {
    this.status = "ready";
    this.score = 0;
    this.distance = 0;
    this.energy = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.perfect = 0;
    this.secrets = 0;
    this.currentLevelId = "level_01";
    this.currentLevelIndex = 0;
    this.currentSpeed = 0;
    this.temporarySpeedMultiplier = 1;
    this.temporarySpeedUntil = 0;
  }

  start() {
    this.status = "running";
    EventManager.emit("game:start");
  }

  setLevel(level: LevelDefinition, index: number) {
    this.currentLevelId = level.id;
    this.currentLevelIndex = index;
    this.currentSpeed = level.baseSpeed;
    this.combo = 0;
    EventManager.emit("level:changed", { level, index });
    EventManager.emit("level:fact", { title: "Dato de calidad", body: level.qualityFact });
  }

  getEffectiveSpeed(now: number) {
    if (now > this.temporarySpeedUntil) this.temporarySpeedMultiplier = 1;
    return Math.min(this.currentSpeed * this.temporarySpeedMultiplier, MAX_SAFE_EFFECTIVE_SPEED);
  }

  setTemporarySpeed(multiplier: number, durationMs: number, now: number) {
    this.temporarySpeedMultiplier = Math.min(1.12, Math.max(0.75, multiplier));
    this.temporarySpeedUntil = Math.max(this.temporarySpeedUntil, now + durationMs);
    EventManager.emit("speed:changed", { speed: Math.min(this.currentSpeed * this.temporarySpeedMultiplier, MAX_SAFE_EFFECTIVE_SPEED) });
  }

  addScore(points: number) {
    this.score += Math.max(0, Math.round(points));
  }

  addDistance(px: number) {
    this.distance += Math.max(0, px / 10);
  }

  collectEnergy(amount = 1, secret = false) {
    this.energy += amount;
    this.addScore(secret ? 90 : 28 * amount);
    if (secret) this.secrets += 1;
    this.bumpCombo(secret ? 2 : 1);
    EventManager.emit("pickup:energy", { amount, secret });
    if (secret) EventManager.emit("player:secret");
  }

  perfectJump(x: number, y: number) {
    this.perfect += 1;
    this.addScore(120 + this.combo * 12);
    this.bumpCombo(2);
    EventManager.emit("player:perfect", { x, y });
  }

  bumpCombo(amount = 1) {
    this.combo += amount;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    EventManager.emit("combo:changed", { combo: this.combo });
  }

  breakCombo() {
    if (this.combo === 0) return;
    this.combo = 0;
    EventManager.emit("combo:changed", { combo: 0 });
  }

  gameOver() {
    if (this.status === "gameover") return;
    this.status = "gameover";
    EventManager.emit("game:over", { score: this.score, distance: Math.round(this.distance), energy: this.energy });
  }

  complete() {
    if (this.status === "complete") return;
    this.status = "complete";
    EventManager.emit("game:complete", { score: this.score, distance: Math.round(this.distance), energy: this.energy });
  }

  loadLeaderboard(): LeaderboardEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(LEADERBOARD_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data.slice(0, 8) : [];
    } catch {
      return [];
    }
  }

  saveLeaderboard(name: string) {
    if (typeof window === "undefined") return this.loadLeaderboard();
    const cleanName = name.trim().slice(0, 26);
    if (!cleanName) return this.loadLeaderboard();
    const entry: LeaderboardEntry = {
      name: cleanName,
      score: this.score,
      distance: Math.round(this.distance),
      energy: this.energy,
      date: new Date().toISOString(),
    };
    const board = [...this.loadLeaderboard(), entry]
      .sort((a, b) => b.score - a.score || b.energy - a.energy)
      .slice(0, 8);
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
    return board;
  }
}

export const GameManager = new PacoGameManager();
