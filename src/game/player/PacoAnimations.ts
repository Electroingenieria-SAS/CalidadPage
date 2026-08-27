import * as Phaser from "phaser";
import { PLAYER_PHYSICS } from "../config/PhysicsConfig";
import type { PacoState } from "./PacoStateMachine";
import type { PacoMode } from "./PacoController";

type VisualMode = "idle" | "walk" | "jump" | "fall";

const TEXTURE: Record<VisualMode, string> = {
  idle: "paco-idle",
  walk: "paco-walk",
  jump: "paco-jump",
  fall: "paco-fall",
};

function visualModeFor(state: PacoState, speed: number): VisualMode {
  if (state === "dead" || state === "fall") return "fall";
  if (state === "prejump" || state === "rise" || state === "apex" || state === "boost") return "jump";
  if (state === "celebrate" || state === "land" || speed < 12) return "idle";
  return "walk";
}

export class PacoAnimations {
  private mode: VisualMode = "idle";
  private bobClock = 0;
  private landingPunch = 0;
  private boostPunch = 0;
  private lastState: PacoState = "run";

  constructor(
    private scene: Phaser.Scene,
    private bodySprite: Phaser.Physics.Arcade.Sprite,
    private visual: Phaser.GameObjects.Image,
  ) {}

  update(state: PacoState, deltaMs: number, speed: number, mode: PacoMode = "runner", mini = false) {
    const body = this.bodySprite.body as Phaser.Physics.Arcade.Body;
    const nextMode = visualModeFor(state, speed);

    if (nextMode !== this.mode) {
      this.mode = nextMode;
      this.visual.setTexture(TEXTURE[nextMode]);
    }

    if (state === "land" && this.lastState !== "land") this.landingPunch = 1;
    if (state === "boost" && this.lastState !== "boost") this.boostPunch = 1;
    this.lastState = state;

    const dt = Math.min(0.05, deltaMs / 1000);
    this.bobClock += dt * Phaser.Math.Clamp(speed / 82, 4.1, 8.4);
    this.landingPunch = Math.max(0, this.landingPunch - dt * 6.8);
    this.boostPunch = Math.max(0, this.boostPunch - dt * 5.2);

    const grounded = this.bodySprite.flipY ? (body.blocked.up || body.touching.up) : (body.blocked.down || body.touching.down);
    const relVY = body.velocity.y * (this.bodySprite.flipY ? -1 : 1);
    const walkBob = this.mode === "walk" && grounded ? Math.sin(this.bobClock * Math.PI * 2) * 2.4 : 0;
    const sideSway = this.mode === "walk" && grounded ? Math.sin(this.bobClock * Math.PI * 2) * 1.6 : 0;
    const landingYOffset = this.landingPunch * 3.2;
    const modeAngle = mode === "ship" ? (relVY < 0 ? -18 : 14) : mode === "wave" ? (relVY < 0 ? -28 : 28) : 0;
    const targetAngle = mode !== "runner" ? modeAngle : this.mode === "jump"
      ? Phaser.Math.Clamp(relVY / 210, -10.5, 3.5)
      : this.mode === "fall"
        ? Phaser.Math.Clamp(relVY / 125, 4.5, 12)
        : this.mode === "walk"
          ? sideSway * 1.25
          : 0;

    this.visual.setFlipY(this.bodySprite.flipY);
    this.visual.x = this.bodySprite.x + (this.mode === "walk" ? Math.sin(this.bobClock * Math.PI * 2) * 0.8 : 0);
    this.visual.y = this.bodySprite.y + PLAYER_PHYSICS.visualYOffset + (this.bodySprite.flipY ? -walkBob - landingYOffset : walkBob + landingYOffset);
    this.visual.angle = Phaser.Math.Linear(this.visual.angle, targetAngle * (this.bodySprite.flipY ? -1 : 1), 1 - Math.exp(-10 * dt));

    const base = PLAYER_PHYSICS.visualSize * (mini ? 0.68 : 1);
    let sx = 1;
    let sy = 1;

    if (this.mode === "walk" && grounded) {
      sx += Math.sin(this.bobClock * Math.PI * 2) * 0.025;
      sy -= Math.sin(this.bobClock * Math.PI * 2) * 0.035;
    }
    if (this.mode === "jump") {
      sx -= 0.04 + this.boostPunch * 0.03;
      sy += 0.05 + this.boostPunch * 0.05;
    }
    if (this.mode === "fall") {
      sx += 0.045;
      sy -= 0.035;
    }
    sx += this.landingPunch * 0.06;
    sy -= this.landingPunch * 0.08;

    if (state === "celebrate") {
      const celebrate = Math.sin(this.bobClock * Math.PI * 2) * 0.06;
      sx += celebrate;
      sy -= celebrate;
    }

    this.visual.displayWidth = base * sx;
    this.visual.displayHeight = base * sy;
  }

  destroy() {
    void this.scene;
  }
}
