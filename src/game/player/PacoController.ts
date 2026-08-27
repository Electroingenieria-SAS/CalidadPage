import * as Phaser from "phaser";
import { PLAYER_PHYSICS } from "../config/PhysicsConfig";
import { EventManager } from "../core/EventManager";
import { PacoStateMachine } from "./PacoStateMachine";

export type PacoMode = "runner" | "ship" | "wave";

export class PacoController {
  readonly state = new PacoStateMachine();
  gravitySign: 1 | -1 = 1;
  mode: PacoMode = "runner";
  private jumpPressedAt = -Infinity;
  private jumpHeld = false;
  private coyoteUntil = -Infinity;
  private landingUntil = -Infinity;
  private boostUntil = -Infinity;
  private orbAvailableUntil = -Infinity;
  private orbPower = 0;
  private isDead = false;
  private wasGrounded = false;
  private previousRelativeVelocityY = 0;
  private airJumps = 0;
  private airJumpCapacity = 0;
  private airJumpsExpireAt = -Infinity;
  private padLaunchActive = false;
  private pointerDownHandler = () => this.pressJump(this.scene.time.now);
  private pointerUpHandler = () => this.releaseJump();

  constructor(private scene: Phaser.Scene, readonly sprite: Phaser.Physics.Arcade.Sprite) {
    this.scene.input.on("pointerdown", this.pointerDownHandler);
    this.scene.input.on("pointerup", this.pointerUpHandler);
    this.scene.input.keyboard?.on("keydown-SPACE", this.onKeyboardDown, this);
    this.scene.input.keyboard?.on("keyup-SPACE", this.onKeyboardUp, this);
    this.scene.input.keyboard?.on("keydown-UP", this.onKeyboardDown, this);
    this.scene.input.keyboard?.on("keyup-UP", this.onKeyboardUp, this);
    this.scene.input.keyboard?.on("keydown-W", this.onKeyboardDown, this);
    this.scene.input.keyboard?.on("keyup-W", this.onKeyboardUp, this);
  }

  private onKeyboardDown() { this.pressJump(this.scene.time.now); }
  private onKeyboardUp() { this.releaseJump(); }
  private isGrounded(body: Phaser.Physics.Arcade.Body) { return this.gravitySign > 0 ? (body.blocked.down || body.touching.down) : (body.blocked.up || body.touching.up); }

  setMode(mode: PacoMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (mode === 'runner') body.setGravityY(PLAYER_PHYSICS.baseGravity * this.gravitySign);
    if (mode === 'ship') body.setGravityY(980 * this.gravitySign);
    if (mode === 'wave') body.setGravityY(0);
    body.setVelocityY(Phaser.Math.Clamp(body.velocity.y, -440, 440));
    EventManager.emit('player:mode', { mode });
  }

  setGravitySign(sign: 1 | -1) {
    if (this.gravitySign === sign) return;
    this.gravitySign = sign;
    this.sprite.setFlipY(sign < 0);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setGravityY((this.mode === 'ship' ? 980 : this.mode === 'wave' ? 0 : PLAYER_PHYSICS.baseGravity) * this.gravitySign);
    EventManager.emit("player:gravity", { gravitySign: sign });
  }

  pressJump(now: number) { if (!this.isDead) { this.jumpPressedAt = now; this.jumpHeld = true; } }
  releaseJump() { this.jumpHeld = false; }
  setOrb(power = 900, windowMs = 180) { this.orbAvailableUntil = this.scene.time.now + windowMs; this.orbPower = power; }
  grantAirJumps(count = 1, durationMs = 9000) {
    const capacity = Phaser.Math.Clamp(Math.floor(count), 1, 2);
    this.airJumpCapacity = Math.max(this.airJumpCapacity, capacity);
    this.airJumps = this.airJumpCapacity;
    this.airJumpsExpireAt = Math.max(this.airJumpsExpireAt, this.scene.time.now + durationMs);
  }

  launch(power = 920) {
    if (this.isDead) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-Math.abs(power) * this.gravitySign);
    this.boostUntil = this.scene.time.now + 180;
    this.state.set("boost", this.scene.time.now);
  }


  launchFromPad(velocityY: number) {
    if (this.isDead) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-Math.abs(velocityY) * this.gravitySign);
    this.padLaunchActive = true;
    this.boostUntil = this.scene.time.now + 180;
    this.state.set("boost", this.scene.time.now);
  }

  celebrate(durationMs = 650) { if (!this.isDead) { this.state.set("celebrate", this.scene.time.now); this.boostUntil = this.scene.time.now + durationMs; } }
  kill() {
    if (this.isDead) return;
    this.isDead = true; this.jumpHeld = false; this.padLaunchActive = false; this.jumpPressedAt = -Infinity; this.airJumps = 0; this.airJumpCapacity = 0; this.state.set("dead", this.scene.time.now);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0); body.setVelocityY(-240 * this.gravitySign); body.setGravityY(PLAYER_PHYSICS.fallGravity * 0.74 * this.gravitySign);
  }

  private updateShip(body: Phaser.Physics.Arcade.Body, dt: number, speed: number) {
    body.setVelocityX(speed);
    body.setGravityY(980 * this.gravitySign);
    let relativeVY = body.velocity.y * this.gravitySign;
    if (this.jumpHeld) relativeVY -= 1680 * dt;
    relativeVY = Phaser.Math.Clamp(relativeVY, -480, 520);
    body.setVelocityY(relativeVY * this.gravitySign);
    this.state.set(relativeVY < -50 ? 'rise' : relativeVY > 70 ? 'fall' : 'apex', this.scene.time.now);
  }

  private updateWave(body: Phaser.Physics.Arcade.Body, speed: number) {
    body.setVelocityX(speed);
    body.setGravityY(0);
    const waveSpeed = 355;
    body.setVelocityY((this.jumpHeld ? -waveSpeed : waveSpeed) * this.gravitySign);
    this.state.set(this.jumpHeld ? 'rise' : 'fall', this.scene.time.now);
  }

  update(now: number, deltaMs: number, speed: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const dt = Math.min(0.04, deltaMs / 1000);
    const grounded = this.isGrounded(body);

    if (this.isDead) { body.setVelocityX(0); body.setGravityY(PLAYER_PHYSICS.fallGravity * 0.74 * this.gravitySign); return; }
    if (now > this.airJumpsExpireAt) {
      this.airJumps = 0;
      this.airJumpCapacity = 0;
    } else if (grounded && this.airJumpCapacity > 0) {
      this.airJumps = this.airJumpCapacity;
    }

    if (this.mode === 'ship') { this.updateShip(body, dt, speed); return; }
    if (this.mode === 'wave') { this.updateWave(body, speed); return; }

    body.setVelocityX(speed);
    if (grounded) {
      this.coyoteUntil = now + PLAYER_PHYSICS.coyoteMs;
      if (!this.wasGrounded && this.previousRelativeVelocityY > 250) { this.landingUntil = now + 92; EventManager.emit("player:land", { impact: this.previousRelativeVelocityY }); }
    }

    const buffered = now - this.jumpPressedAt <= PLAYER_PHYSICS.jumpBufferMs;
    const canCoyote = grounded || now <= this.coyoteUntil;
    const canOrb = now <= this.orbAvailableUntil;
    const canAirJump = !grounded && !canOrb && this.airJumps > 0;
    if (buffered && canOrb) {
      body.setVelocityY(-Math.abs(this.orbPower || 900) * this.gravitySign); this.jumpPressedAt = -Infinity; this.orbAvailableUntil = -Infinity; EventManager.emit("player:jump");
    } else if (buffered && canCoyote) {
      body.setVelocityY(PLAYER_PHYSICS.jumpVelocity * this.gravitySign); this.jumpPressedAt = -Infinity; this.coyoteUntil = -Infinity; EventManager.emit("player:jump");
    } else if (buffered && canAirJump) {
      this.airJumps -= 1; body.setVelocityY(PLAYER_PHYSICS.jumpVelocity * 0.97 * this.gravitySign); this.jumpPressedAt = -Infinity; this.boostUntil = now + 120; this.state.set("boost", now); EventManager.emit("player:doubleJump");
    }

    const newRelativeVY = body.velocity.y * this.gravitySign;
    if (this.padLaunchActive && (newRelativeVY >= -8 || grounded)) this.padLaunchActive = false;
    if (!this.padLaunchActive && !this.jumpHeld && newRelativeVY < PLAYER_PHYSICS.jumpCutVelocity) body.setVelocityY(Phaser.Math.Linear(newRelativeVY, PLAYER_PHYSICS.jumpCutVelocity, 0.18) * this.gravitySign);

    const relVY = body.velocity.y * this.gravitySign;
    const nearApex = Math.abs(relVY) < 112 && !grounded;
    body.setGravityY((nearApex ? PLAYER_PHYSICS.apexGravity : relVY > 0 ? PLAYER_PHYSICS.fallGravity : PLAYER_PHYSICS.baseGravity) * this.gravitySign);

    let nextState = this.state.state;
    if (now < this.boostUntil && this.state.state === "celebrate") nextState = "celebrate";
    else if (now < this.boostUntil) nextState = "boost";
    else if (now < this.landingUntil) nextState = "land";
    else if (grounded) nextState = "run";
    else if (relVY < -125) nextState = "rise";
    else if (nearApex) nextState = "apex";
    else if (relVY > 90) nextState = "fall";
    else nextState = "prejump";
    this.state.set(nextState, now); this.wasGrounded = grounded; this.previousRelativeVelocityY = relVY;
  }

  destroy() {
    this.scene.input.off("pointerdown", this.pointerDownHandler); this.scene.input.off("pointerup", this.pointerUpHandler);
    this.scene.input.keyboard?.off("keydown-SPACE", this.onKeyboardDown, this); this.scene.input.keyboard?.off("keyup-SPACE", this.onKeyboardUp, this);
    this.scene.input.keyboard?.off("keydown-UP", this.onKeyboardDown, this); this.scene.input.keyboard?.off("keyup-UP", this.onKeyboardUp, this);
    this.scene.input.keyboard?.off("keydown-W", this.onKeyboardDown, this); this.scene.input.keyboard?.off("keyup-W", this.onKeyboardUp, this);
  }
}
