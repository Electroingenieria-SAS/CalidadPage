import * as Phaser from "phaser";
import type { Paco } from "../../player/Paco";
import type { LevelDefinition, LevelPattern, PatternItem, SetPieceKind } from "./LevelTypes";
import { ObstacleFactory } from "../../obstacles/ObstacleFactory";
import { CollectibleFactory } from "../../collectibles/CollectibleFactory";
import { JumpPad } from "../../mechanics/JumpPad";
import { JumpOrb } from "../../mechanics/JumpOrb";
import { SpeedTrigger } from "../../mechanics/SpeedTrigger";
import { GravityTrigger } from "../../mechanics/GravityTrigger";
import { MovingPlatform } from "../../mechanics/MovingPlatform";
import { FallingPlatform } from "../../mechanics/FallingPlatform";
import { DoubleJumpPower } from "../../mechanics/DoubleJumpPower";
import { SpeedPortal } from "../../mechanics/SpeedPortal";
import { ModePortal } from "../../mechanics/ModePortal";
import { MiniPortal } from "../../mechanics/MiniPortal";
import type { SetPieceDirector } from "./SetPieceDirector";
import type { CameraDirector } from "../../camera/CameraDirector";
import type { VFXManager } from "../../vfx/VFXManager";
import { CentralBoss } from "../../bosses/CentralBoss";
import { EventManager } from "../../core/EventManager";
import { TriggerZone } from "../../triggers/TriggerZone";
import { PlatformPrefab } from "../prefabs/PlatformPrefab";
import { WorldDecorator } from "./WorldDecorator";
import { resolveJumpPadPlan } from "./PadSafetyPlanner";

function shade(color: number, amount: number) {
  const r = Math.max(0, Math.min(255, ((color >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (color & 255) + amount));
  return (r << 16) | (g << 8) | b;
}

export type LevelBuildContext = {
  scene: Phaser.Scene;
  paco: Paco;
  groundY: number;
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  platformGroup: Phaser.Physics.Arcade.StaticGroup;
  obstacleGroup: Phaser.Physics.Arcade.StaticGroup;
  pickupGroup: Phaser.Physics.Arcade.StaticGroup;
  setPieces: SetPieceDirector;
  camera: CameraDirector;
  vfx: VFXManager;
};

export type RoadGap = { x: number; width: number };

export class LevelBuilder {
  private obstacleFactory: ObstacleFactory;
  private collectibleFactory: CollectibleFactory;
  private destroyables: Array<{ destroy: () => void }> = [];
  private bosses: CentralBoss[] = [];
  private worldDecorator?: WorldDecorator;

  constructor(private context: LevelBuildContext) {
    this.obstacleFactory = new ObstacleFactory(context.scene, context.obstacleGroup);
    this.collectibleFactory = new CollectibleFactory(context.scene, context.pickupGroup);
  }

  buildRoad(startX: number, length: number, level: LevelDefinition, gaps: RoadGap[] = []) {
    const { scene, groundY } = this.context;
    this.worldDecorator = new WorldDecorator(scene, level, groundY);
    this.worldDecorator.build(startX, length);

    const ordered = [...gaps]
      .filter((gap) => gap.width >= 70)
      .sort((a, b) => a.x - b.x)
      .map((gap) => ({ start: gap.x - gap.width / 2, end: gap.x + gap.width / 2, width: gap.width }));

    let cursor = startX;
    for (const gap of ordered) {
      const segEnd = Phaser.Math.Clamp(gap.start, startX, startX + length);
      if (segEnd - cursor > 40) this.buildRoadSegment(cursor, segEnd, level);
      this.buildGapVisual(gap.start, gap.end, level);
      cursor = Math.max(cursor, gap.end);
    }
    if (startX + length - cursor > 40) this.buildRoadSegment(cursor, startX + length, level);
  }

  private buildRoadSegment(startX: number, endX: number, level: LevelDefinition) {
    const { scene, groundY, groundGroup } = this.context;
    const length = endX - startX;
    const center = startX + length / 2;
    const roadDark = shade(level.theme.road, -64);
    const roadMid = shade(level.theme.road, -28);

    const shadow = scene.add.rectangle(center + 9, groundY + 70, length + 8, 114, 0x000000, 0.25).setDepth(7);
    const face = scene.add.rectangle(center, groundY + 61, length, 108, roadDark, 1).setDepth(8);
    const midFace = scene.add.rectangle(center, groundY + 26, length, 38, roadMid, 1).setDepth(9);
    const top = scene.add.rectangle(center, groundY + 8, length, 18, level.theme.road, 1).setDepth(10);
    const shoulder = scene.add.rectangle(center, groundY + 1, length, 7, level.theme.shoulder, 1).setDepth(11);
    const edge = scene.add.rectangle(center, groundY - 2, length, 3, level.theme.accent, 0.78).setDepth(12);
    this.destroyables.push(shadow, face, midFace, top, shoulder, edge);

    const ground = scene.add.rectangle(center, groundY + 62, length, 124, 0xffffff, 0.001).setDepth(10);
    scene.physics.add.existing(ground, true);
    groundGroup.add(ground);
    const body = ground.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
    this.destroyables.push(ground);

    for (let x = startX + 80; x < endX - 30; x += 220) {
      const lane = scene.add.rectangle(x, groundY + 31, 92, 5, level.theme.lane, 0.76).setDepth(12);
      const laneShadow = scene.add.rectangle(x + 2, groundY + 34, 92, 3, 0x000000, 0.18).setDepth(11);
      this.destroyables.push(laneShadow, lane);
    }

    for (let x = startX + 160; x < endX - 80; x += 520) {
      const supportShadow = scene.add.rectangle(x + 8, groundY + 104, 46, 54, 0x000000, 0.22).setDepth(6);
      const support = scene.add.rectangle(x, groundY + 98, 42, 50, level.theme.shoulder, 0.62).setDepth(7);
      const cap = scene.add.rectangle(x, groundY + 74, 56, 7, level.theme.accent, 0.28).setDepth(8);
      this.destroyables.push(supportShadow, support, cap);
    }
  }

  private buildGapVisual(startX: number, endX: number, level: LevelDefinition) {
    const { scene, groundY } = this.context;
    const width = endX - startX;
    const center = startX + width / 2;
    const abyss = scene.add.rectangle(center, groundY + 68, width, 138, 0x02060c, 0.96).setDepth(6);
    const innerGlow = scene.add.rectangle(center, groundY + 12, Math.max(20, width - 14), 5, level.theme.accent, 0.1).setDepth(7);
    this.destroyables.push(abyss, innerGlow);

    for (const edgeX of [startX, endX]) {
      const side = scene.add.rectangle(edgeX, groundY + 52, 18, 104, shade(level.theme.road, -68), 1).setDepth(13);
      const lip = scene.add.rectangle(edgeX, groundY + 4, 24, 12, level.theme.shoulder, 1).setDepth(14);
      const marker = scene.add.rectangle(edgeX, groundY - 4, 18, 4, level.theme.accent, 0.92).setDepth(15);
      this.destroyables.push(side, lip, marker);
    }
  }

  buildPattern(pattern: LevelPattern, originX: number, level: LevelDefinition) {
    for (const item of pattern.items) this.buildItem(item, originX, level, pattern);
  }

  private buildItem(item: PatternItem, originX: number, level: LevelDefinition, pattern: LevelPattern) {
    const { scene, paco, groundY, platformGroup } = this.context;
    const x = originX + item.x;

    switch (item.kind) {
      case "gap":
        break;
      case "obstacle": {
        const obstacle = this.obstacleFactory.create(item.obstacle, x, groundY - (item.elevation ?? 0));
        this.destroyables.push(obstacle);
        break;
      }
      case "pickup": {
        const pickup = this.collectibleFactory.create(x, groundY - item.elevation, Boolean(item.secret));
        this.destroyables.push(pickup);
        break;
      }
      case "platform": {
        const y = groundY - item.elevation;
        const kind = item.platformKind ?? "standard";
        const prefab = new PlatformPrefab(scene, x, y, item.width, kind, level.theme.accent);
        platformGroup.add(prefab.object);
        this.destroyables.push(prefab);
        break;
      }
      case "jumpPad": {
        const plan = resolveJumpPadPlan(pattern, item, originX);
        const pad = new JumpPad(scene, plan.padX, groundY - plan.padElevation - 8, plan);
        pad.attach(scene, paco);
        this.destroyables.push(pad);
        break;
      }
      case "jumpOrb": {
        const orb = new JumpOrb(scene, x, groundY - item.elevation, item.power ?? 900);
        orb.attach(scene, paco);
        this.destroyables.push(orb);
        break;
      }
      case "doubleJumpPower": {
        const power = new DoubleJumpPower(scene, x, groundY - item.elevation, item.jumps ?? 1, item.durationMs ?? 9000);
        power.attach(scene, paco);
        this.destroyables.push(power);
        break;
      }
      case "speedPortal": {
        const portal = new SpeedPortal(scene, x, groundY - (item.elevation ?? 120), item.multiplier, item.durationMs);
        portal.attach(scene, paco);
        this.destroyables.push(portal);
        break;
      }
      case "modePortal": {
        const portal = new ModePortal(scene, x, groundY - (item.elevation ?? 130), item.mode);
        portal.attach(scene, paco);
        this.destroyables.push(portal);
        break;
      }
      case "miniPortal": {
        const portal = new MiniPortal(scene, x, groundY - (item.elevation ?? 120), item.mini);
        portal.attach(scene, paco);
        this.destroyables.push(portal);
        break;
      }
      case "speedTrigger": {
        const trigger = new SpeedTrigger(scene, x, groundY - 160, item.multiplier, item.durationMs);
        trigger.attach(scene, paco);
        this.destroyables.push(trigger);
        break;
      }
      case "gravityTrigger": {
        const trigger = new GravityTrigger(scene, x, groundY - 170, item.gravityScale);
        trigger.attach(scene, paco);
        this.destroyables.push(trigger);
        break;
      }
      case "movingPlatform": {
        const moving = new MovingPlatform(scene, x + item.width / 2, groundY - item.elevation, item.width, item.range, item.durationMs, level.theme.accent);
        platformGroup.add(moving.object);
        this.destroyables.push(moving);
        break;
      }
      case "fallingPlatform": {
        const falling = new FallingPlatform(scene, x + item.width / 2, groundY - item.elevation, item.width, item.delayMs, level.theme.accent);
        platformGroup.add(falling.object);
        falling.attach(scene, paco);
        this.destroyables.push(falling);
        break;
      }
    }
  }

  buildFinishGate(x: number, level: LevelDefinition) {
    const { scene, groundY } = this.context;
    const shadow = scene.add.ellipse(x + 6, groundY + 4, 92, 18, 0x000000, 0.25).setDepth(14);
    const glow = scene.add.circle(x, groundY - 80, 58, level.theme.accent, 0.12).setDepth(15);
    const outer = scene.add.circle(x, groundY - 80, 45, 0x07111f, 0.82).setStrokeStyle(7, level.theme.accent, 0.96).setDepth(16);
    const inner = scene.add.circle(x, groundY - 80, 27, level.theme.accent, 0.18).setStrokeStyle(2, 0xffffff, 0.62).setDepth(17);
    const base = scene.add.rectangle(x, groundY - 8, 84, 18, level.theme.shoulder, 1).setStrokeStyle(2, level.theme.accent, 0.45).setDepth(16);
    const label = scene.add.text(x, groundY - 154, "100%", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#f5f9ff",
      backgroundColor: "rgba(3,15,29,.68)",
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(18);
    scene.tweens.add({ targets: [glow, inner], scale: 1.12, alpha: { from: 0.18, to: 0.68 }, duration: 720, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.destroyables.push(shadow, glow, outer, inner, base, label);
  }

  buildSetPieceTrigger(kind: SetPieceKind, x: number, id: string) {
    const { scene, paco, groundY, setPieces } = this.context;
    const trigger = new TriggerZone(scene, paco.sprite, {
      x,
      y: groundY - 190,
      width: 120,
      height: 420,
      onEnter: () => setPieces.trigger(kind, id),
    });
    this.destroyables.push(trigger);
  }

  buildQualityMarker(x: number, fact: string) {
    const { scene, paco, groundY } = this.context;
    const trigger = new TriggerZone(scene, paco.sprite, {
      x,
      y: groundY - 190,
      width: 90,
      height: 420,
      onEnter: () => EventManager.emit("level:fact", { title: "Dato de calidad", body: fact }),
    });
    this.destroyables.push(trigger);
  }

  buildBoss(x: number, groundY: number) {
    const boss = new CentralBoss(this.context.scene, this.context.paco, x, groundY, this.context.camera, this.context.vfx);
    const trigger = new TriggerZone(this.context.scene, this.context.paco.sprite, {
      x: x - 620,
      y: groundY - 180,
      width: 100,
      height: 420,
      onEnter: () => boss.start(),
    });
    this.bosses.push(boss);
    this.destroyables.push(trigger, boss);
  }

  updateBosses(time: number, delta: number) {
    for (const boss of this.bosses) boss.update(time, delta);
  }

  destroy() {
    this.destroyables.forEach((item) => {
      try { item.destroy(); } catch { /* already destroyed */ }
    });
    this.destroyables = [];
    this.bosses = [];
    this.obstacleFactory.destroy();
    this.collectibleFactory.destroy();
    this.worldDecorator?.destroy();
    this.worldDecorator = undefined;
  }
}
