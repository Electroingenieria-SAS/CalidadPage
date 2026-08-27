import * as Phaser from "phaser";
import { LevelLoader } from "../levels/engine/LevelLoader";
import { LevelEngine } from "../levels/engine/LevelEngine";
import { LevelBuilder } from "../levels/engine/LevelBuilder";
import { LevelManager } from "../core/LevelManager";
import { GameManager } from "../core/GameManager";
import { CheckpointManager } from "../core/CheckpointManager";
import { EventManager } from "../core/EventManager";
import { Paco } from "../player/Paco";
import { CameraDirector } from "../camera/CameraDirector";
import { ParallaxBackground } from "../camera/ParallaxBackground";
import { VFXManager } from "../vfx/VFXManager";
import { SetPieceDirector } from "../levels/engine/SetPieceDirector";
import { DebugOverlay } from "../debug/DebugOverlay";
import { CampaignProgress } from "../campaign/CampaignProgress";
import { AudioManager } from "../audio/AudioManager";
import type { BuiltLevel, LevelDefinition } from "../levels/engine/LevelTypes";

const WORLD_HEIGHT = 720;
const GROUND_Y = 610;
const PLAYER_START_X = 210;
const LEVEL_EXIT_MARGIN = 260;

export class LevelScene extends Phaser.Scene {
  paco!: Paco;
  levelManager = new LevelManager();

  private levelIndex = 0;
  private level!: LevelDefinition;
  private builtLevel!: BuiltLevel;
  private transitioning = false;
  private cameraDirector!: CameraDirector;
  private background!: ParallaxBackground;
  private vfx!: VFXManager;
  private setPieces!: SetPieceDirector;
  private debug!: DebugOverlay;
  private builder!: LevelBuilder;
  private audioManager!: AudioManager;

  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private pickupGroup!: Phaser.Physics.Arcade.StaticGroup;

  private unsubs: Array<() => void> = [];
  private lastPlayerX = PLAYER_START_X;
  private startedInputInstalled = false;
  private levelStartScore = 0;
  private levelStartEnergy = 0;
  private levelStartPerfect = 0;
  private levelStartSecrets = 0;
  private runClockStartedAt = 0;

  constructor() {
    super("LevelScene");
  }

  init(data?: { levelIndex?: number }) {
    const levels = LevelLoader.loadAll();
    this.levelIndex = Phaser.Math.Clamp(Math.floor(data?.levelIndex ?? 0), 0, levels.length - 1);
    this.level = levels[this.levelIndex];
  }

  create() {
    CheckpointManager.clear();
    this.transitioning = false;
    this.lastPlayerX = PLAYER_START_X;
    this.levelStartScore = GameManager.score;
    this.levelStartEnergy = GameManager.energy;
    this.levelStartPerfect = GameManager.perfect;
    this.levelStartSecrets = GameManager.secrets;

    this.groundGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();
    this.obstacleGroup = this.physics.add.staticGroup();
    this.pickupGroup = this.physics.add.staticGroup();

    this.background = new ParallaxBackground(this);
    this.background.setTheme(this.level.theme);

    this.paco = new Paco(this, PLAYER_START_X, GROUND_Y);
    this.vfx = new VFXManager(this);
    this.audioManager = new AudioManager(this);
    this.cameraDirector = new CameraDirector(this, this.paco);
    this.setPieces = new SetPieceDirector(this, this.paco, this.cameraDirector, this.vfx);
    this.setPieces.setLevel(this.level);
    this.debug = new DebugOverlay(this);

    this.builder = new LevelBuilder({
      scene: this,
      paco: this.paco,
      groundY: GROUND_Y,
      groundGroup: this.groundGroup,
      platformGroup: this.platformGroup,
      obstacleGroup: this.obstacleGroup,
      pickupGroup: this.pickupGroup,
      setPieces: this.setPieces,
      camera: this.cameraDirector,
      vfx: this.vfx,
    });

    this.builtLevel = LevelEngine.buildLevel(this.builder, this.level, 0);
    this.levelManager.setBuiltLevels([this.builtLevel], this.levelIndex);

    const worldWidth = this.builtLevel.endX + 620;
    this.physics.world.setBounds(0, 0, worldWidth, WORLD_HEIGHT + 800, false, false, false, false);
    this.cameraDirector.setBounds(worldWidth, WORLD_HEIGHT);

    this.physics.add.collider(this.paco.sprite, this.groundGroup);
    this.physics.add.collider(this.paco.sprite, this.platformGroup);
    this.physics.add.collider(this.paco.sprite, this.obstacleGroup, this.onObstacleCollision, undefined, this);
    this.physics.add.overlap(this.paco.sprite, this.pickupGroup, this.onPickup, undefined, this);

    this.unsubs.push(
      EventManager.on("level:changed", ({ level }) => this.onLevelChanged(level)),
      EventManager.on("player:perfect", ({ x, y }) => this.vfx.perfect(x, y)),
      EventManager.on("player:doubleJump", () => { this.vfx.burst(this.paco.sprite.x, this.paco.sprite.y - 36, 0x8c7cff, 12, 150); this.vfx.ring(this.paco.sprite.x, this.paco.sprite.y - 30, 0x8c7cff, 12, 60, 0.4); }),
      EventManager.on("player:pad", ({ x, y }) => { this.vfx.burst(x, y - 12, 0x66dfff, 16, 155); this.vfx.ring(x, y - 10, 0x9eeeff, 10, 68, 0.55); }),
      EventManager.on("player:gravity", ({ gravitySign }) => { this.vfx.burst(this.paco.sprite.x, this.paco.sprite.y - 20, gravitySign < 0 ? 0xc57cff : 0x6ed0ff, 16, 170); this.vfx.ring(this.paco.sprite.x, this.paco.sprite.y - 20, gravitySign < 0 ? 0xc57cff : 0x6ed0ff, 18, 90, 0.65); }),
      EventManager.on("player:mode", ({ mode }) => { const color = mode === "ship" ? 0x6ed0ff : mode === "wave" ? 0xc77dff : 0xffd452; this.vfx.burst(this.paco.sprite.x, this.paco.sprite.y - 24, color, 18, 170); this.vfx.ring(this.paco.sprite.x, this.paco.sprite.y - 24, color, 16, 92, 0.62); }),
      EventManager.on("player:mini", ({ mini }) => { this.vfx.ring(this.paco.sprite.x, this.paco.sprite.y - 20, mini ? 0x70f0b6 : 0xffd452, 12, mini ? 62 : 90, 0.5); }),
      EventManager.on("game:over", () => this.onGameOver()),
      EventManager.on("game:restart", () => this.restartRun()),
      EventManager.on("game:levels", () => this.returnToLevels()),
      EventManager.on("boss:defeated", () => this.onBossDefeated()),
    );

    if (!this.scene.isActive("UIScene")) this.scene.launch("UIScene");

    // Defer the event one tick so UIScene is listening before the level slate/fact emit.
    this.time.delayedCall(0, () => {
      this.levelManager.update(this.paco.sprite.x);
      CheckpointManager.set({
        id: `${this.level.id}:entry`,
        levelId: this.level.id,
        x: PLAYER_START_X,
        createdAt: this.time.now,
      });
    });

    this.installStartInput();
    this.cameras.main.fadeIn(260, 0, 0, 0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
  }

  private installStartInput() {
    if (this.startedInputInstalled) return;
    this.startedInputInstalled = true;

    const start = () => {
      if (GameManager.status === "ready") GameManager.start();
    };

    this.input.on("pointerdown", start);
    this.input.keyboard?.on("keydown-SPACE", start);
    this.input.keyboard?.on("keydown-UP", start);
    this.input.keyboard?.on("keydown-W", start);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", start);
      this.input.keyboard?.off("keydown-SPACE", start);
      this.input.keyboard?.off("keydown-UP", start);
      this.input.keyboard?.off("keydown-W", start);
    });
  }

  private onLevelChanged(level: LevelDefinition) {
    // Background and set-piece are already prepared before the first rendered frame.
    // Avoid destroying/recreating them here: that caused a visible one-frame pop.
    this.cameras.main.setBackgroundColor(level.theme.sky);
    this.vfx.burst(this.paco.sprite.x + 40, this.paco.sprite.y - 80, level.theme.accent, 14, 150);
    if (this.levelIndex > 0) this.paco.controller.celebrate(420);
  }

  private onPickup(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
  ) {
    const pickup = object as Phaser.Physics.Arcade.Sprite;
    if (!pickup.active) return;
    const secret = Boolean(pickup.getData("secret"));
    const x = pickup.x;
    const y = pickup.y;
    const decorations = pickup.getData("decorations") as Phaser.GameObjects.GameObject[] | undefined;
    decorations?.forEach((item) => item.destroy());
    pickup.disableBody(true, true);
    GameManager.collectEnergy(1, secret);
    this.vfx.burst(x, y, secret ? 0x66f4ff : 0xffd452, secret ? 16 : 9, secret ? 165 : 110);
  }

  private onObstacleCollision() {
    if (GameManager.status !== "running" || this.transitioning) return;
    GameManager.breakCombo();
    GameManager.gameOver();
  }

  private onGameOver() {
    this.physics.pause();
    this.paco.controller.kill();
    this.cameraDirector.shake(0.01, 180);
    this.cameras.main.flash(120, 255, 72, 92);
  }

  private restartRun() {
    GameManager.reset();
    this.scene.restart({ levelIndex: this.levelIndex });
  }

  private returnToLevels() {
    GameManager.reset();
    if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");
    this.scene.start("LevelSelectScene");
  }

  private recordLevelCompletion() {
    CampaignProgress.completeLevel(this.level.id, this.levelIndex, {
      score: Math.max(0, GameManager.score - this.levelStartScore),
      energy: Math.max(0, GameManager.energy - this.levelStartEnergy),
      perfect: Math.max(0, GameManager.perfect - this.levelStartPerfect),
      secrets: Math.max(0, GameManager.secrets - this.levelStartSecrets),
      timeMs: Math.max(1, this.time.now - (this.runClockStartedAt || this.time.now)),
      targetDurationSec: this.level.targetDurationSec,
    });
  }

  private onBossDefeated() {
    if (this.levelIndex !== LevelLoader.loadAll().length - 1) return;
    this.transitioning = true;
    this.recordLevelCompletion();
    this.paco.controller.celebrate(900);
    EventManager.emit("ui:message", {
      title: "CENTRAL DE CALIDAD SUPERADA",
      body: "Completaste los 10 circuitos de Paco.",
      tone: "success",
    });
    this.time.delayedCall(950, () => GameManager.complete());
  }

  private completeLevel() {
    if (this.transitioning || this.levelIndex >= LevelLoader.loadAll().length - 1) return;
    this.transitioning = true;
    this.recordLevelCompletion();

    const body = this.paco.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    this.paco.controller.celebrate(620);
    this.vfx.burst(this.paco.sprite.x + 32, this.paco.sprite.y - 62, this.level.theme.accent, 20, 180);

    EventManager.emit("ui:message", {
      title: `CIRCUITO ${String(this.levelIndex + 1).padStart(2, "0")} COMPLETO`,
      body: `Entrando a ${LevelLoader.loadAll()[this.levelIndex + 1].name}.`,
      tone: "success",
    });

    this.time.delayedCall(430, () => this.cameras.main.fadeOut(240, 0, 0, 0));
    this.time.delayedCall(720, () => {
      this.scene.restart({ levelIndex: this.levelIndex + 1 });
    });
  }

  private checkPassedObstacles() {
    const playerBody = this.paco.sprite.body as Phaser.Physics.Arcade.Body;
    for (const child of this.obstacleGroup.getChildren()) {
      const obstacle = child as Phaser.Physics.Arcade.Sprite;
      if (!obstacle.active || obstacle.getData("perfectChecked")) continue;
      if (obstacle.x >= this.paco.sprite.x - 2) continue;

      obstacle.setData("perfectChecked", true);
      const obstacleBody = obstacle.body as Phaser.Physics.Arcade.StaticBody;
      const clearance = obstacleBody.top - playerBody.bottom;
      const airborne = !(playerBody.blocked.down || playerBody.touching.down || playerBody.blocked.up || playerBody.touching.up);

      if (airborne && clearance >= -4 && clearance <= 34) {
        GameManager.perfectJump(this.paco.sprite.x, this.paco.sprite.y - 70);
      } else {
        GameManager.addScore(Number(obstacle.getData("points")) || 16);
        GameManager.bumpCombo(1);
      }
    }
  }

  update(time: number, delta: number) {
    const effectiveSpeed = GameManager.status === "running" && !this.transitioning
      ? GameManager.getEffectiveSpeed(time)
      : 0;

    this.paco.update(time, delta, effectiveSpeed);

    if (GameManager.status === "running" && !this.transitioning) {
      if (!this.runClockStartedAt) this.runClockStartedAt = time;
      const dx = Math.max(0, this.paco.sprite.x - this.lastPlayerX);
      GameManager.addDistance(dx);
      this.lastPlayerX = this.paco.sprite.x;
      this.checkPassedObstacles();

      const progress = this.levelManager.getLevelProgress(this.paco.sprite.x);
      this.setPieces.update(time, delta, progress);
      this.builder.updateBosses(time, delta);

      if (this.levelIndex < LevelLoader.loadAll().length - 1 && this.paco.sprite.x >= this.builtLevel.endX - LEVEL_EXIT_MARGIN) {
        this.completeLevel();
      }

      if (this.paco.sprite.y > WORLD_HEIGHT + 220 || this.paco.sprite.y < -220) GameManager.gameOver();
    }

    if (GameManager.status === "running" && effectiveSpeed > 430 && time % 90 < delta) this.vfx.afterImage(this.paco.sprite.x - 16, this.paco.sprite.y - 18, 0xffffff, 10, 0.12);
    this.background.update(this.cameras.main.scrollX);
    this.cameraDirector.update(delta, effectiveSpeed || GameManager.currentSpeed);
    this.debug.update(this, this.paco.sprite);
  }

  private shutdown() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.builder?.destroy();
    this.setPieces?.destroy();
    this.background?.destroy();
    this.audioManager?.destroy();
    this.vfx?.destroy();
    this.debug?.destroy();
    this.paco?.destroy();
    this.startedInputInstalled = false;
  }
}
