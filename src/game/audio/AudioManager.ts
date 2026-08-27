import * as Phaser from "phaser";
import { EventManager } from "../core/EventManager";

export class AudioManager {
  private unsubs: Array<() => void> = [];
  private ctx?: AudioContext;
  private master = 0.04;

  constructor(private scene: Phaser.Scene) {
    const sound = scene.sound;
    this.ctx = "context" in sound ? (sound.context as AudioContext) : undefined;
    this.bindEvents();
  }

  private bindEvents() {
    this.unsubs.push(
      EventManager.on("game:start", () => this.resume()),
      EventManager.on("player:jump", () => this.sequence([[760, 0.05, 'square', 0], [980, 0.03, 'triangle', 0.015]], 0.9)),
      EventManager.on("player:doubleJump", () => this.sequence([[660, 0.04, 'square', 0], [880, 0.04, 'triangle', 0.02], [1160, 0.03, 'sine', 0.04]], 1.0)),
      EventManager.on("player:pad", () => this.sequence([[320,0.035,'square',0],[620,0.05,'triangle',0.018],[980,0.06,'sine',0.045]], 1.05)),
      EventManager.on("player:land", ({ impact }) => this.tone(140, 0.04, 'triangle', Phaser.Math.Clamp(impact / 1100, 0.25, 0.8))),
      EventManager.on("player:gravity", ({ gravitySign }) => this.sequence(gravitySign < 0 ? [[420,0.05,'sawtooth',0],[280,0.07,'triangle',0.03]] : [[300,0.05,'triangle',0],[470,0.06,'sine',0.03]], 1.0)),
      EventManager.on("player:mode", ({ mode }) => this.sequence(mode === "ship" ? [[330,0.04,'sawtooth',0],[520,0.05,'triangle',0.03],[760,0.06,'sine',0.06]] : mode === "wave" ? [[780,0.04,'square',0],[560,0.04,'square',0.03],[900,0.05,'triangle',0.06]] : [[440,0.04,'triangle',0],[660,0.05,'sine',0.04]], 0.85)),
      EventManager.on("player:mini", ({ mini }) => this.sequence(mini ? [[900,0.035,'triangle',0],[1220,0.05,'sine',0.03]] : [[520,0.04,'triangle',0],[760,0.05,'sine',0.03]], 0.8)),
      EventManager.on("pickup:energy", ({ secret }) => this.sequence(secret ? [[900,0.03,'triangle',0],[1140,0.03,'triangle',0.02],[1380,0.05,'sine',0.04]] : [[920,0.03,'sine',0],[1140,0.03,'triangle',0.02]], 0.8)),
      EventManager.on("speed:changed", () => this.sequence([[500,0.03,'square',0],[780,0.03,'square',0.02],[1040,0.04,'triangle',0.04]], 0.7)),
      EventManager.on("boss:health", ({ phase }) => this.tone(180 + phase * 60, 0.08, 'sawtooth', 1.0)),
      EventManager.on("boss:defeated", () => this.sequence([[520,0.08,'triangle',0],[660,0.08,'triangle',0.05],[830,0.1,'sine',0.1],[1040,0.14,'sine',0.16]], 1.1)),
      EventManager.on("game:over", () => this.sequence([[260,0.08,'sawtooth',0],[170,0.14,'triangle',0.06]], 1.1)),
      EventManager.on("game:complete", () => this.sequence([[640,0.08,'triangle',0],[820,0.09,'triangle',0.06],[1020,0.12,'sine',0.14]], 1.0)),
    );
  }

  private resume() {
    this.ctx?.resume?.();
  }

  private sequence(steps: Array<[number, number, OscillatorType, number]>, gainScale = 1) {
    for (const [freq, dur, type, when] of steps) this.tone(freq, dur, type, gainScale, when);
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', gainScale = 1, whenOffset = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + whenOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.max(700, freq * 4);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.92), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(this.master * gainScale, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  setMuted(muted: boolean) {
    this.scene.sound.mute = muted;
  }

  destroy() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
  }
}
