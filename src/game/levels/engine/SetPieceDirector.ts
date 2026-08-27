import * as Phaser from "phaser";
import type { Paco } from "../../player/Paco";
import type { LevelDefinition, SetPieceKind } from "./LevelTypes";
import type { CameraDirector } from "../../camera/CameraDirector";
import { EventManager } from "../../core/EventManager";
import { GameManager } from "../../core/GameManager";
import type { VFXManager } from "../../vfx/VFXManager";

export class SetPieceDirector {
  private current: SetPieceKind = "nightworks";
  private overlay: Phaser.GameObjects.Rectangle;
  private rain: Phaser.GameObjects.Rectangle[] = [];
  private tunnelLights: Phaser.GameObjects.Arc[] = [];
  private nextLightningAt = 0;
  private chaseThreat?: Phaser.GameObjects.Arc;
  private chaseDistance = 390;
  private industrialConvoy: Phaser.GameObjects.Image[] = [];
  private ambient: Phaser.GameObjects.Arc[] = [];
  private lampProp?: Phaser.GameObjects.Image;
  private triggered = new Set<string>();
  private eventUnsubs: Array<() => void> = [];

  constructor(
    private scene: Phaser.Scene,
    private paco: Paco,
    private camera: CameraDirector,
    private vfx: VFXManager,
  ) {
    this.overlay = scene.add.rectangle(0, 0, 10, 10, 0x000000, 0).setOrigin(0).setScrollFactor(0).setDepth(200);
    this.eventUnsubs.push(
      EventManager.on("player:perfect", () => { this.chaseDistance += 38; }),
      EventManager.on("pickup:energy", ({ secret }) => { this.chaseDistance += secret ? 54 : 14; }),
    );
    scene.scale.on("resize", this.resize, this);
    this.resize(scene.scale.gameSize);
  }

  setLevel(level: LevelDefinition) {
    this.current = level.setPiece;
    this.triggered.clear();
    this.nextLightningAt = this.scene.time.now + 1500;
    this.overlay.setFillStyle(0x000000, 0);
    this.clearRain();
    this.clearTunnel();
    this.clearConvoy();
    this.clearChase();
    this.clearLamp();
    this.clearAmbient();
    this.makeAmbient(level.setPiece);

    if (level.setPiece === "electricRain") this.makeRain(22, 0x9fd8ff, 0.34);
    if (level.setPiece === "storm") this.makeRain(40, 0xd7e4ff, 0.48);
    if (level.setPiece === "tunnel") this.makeTunnelLights();
    if (level.setPiece === "industrial") this.makeConvoy();
    if (level.setPiece === "chase") this.makeChaseThreat();
    if (level.setPiece === "highVoltage") this.makeRain(16, 0x72f0ff, 0.22);
    if (level.setPiece === "master") this.makeRain(12, 0x70e6c3, 0.18);
  }

  trigger(kind: SetPieceKind, id: string) {
    if (this.triggered.has(id)) return;
    this.triggered.add(id);
    EventManager.emit("level:setpiece", { kind, active: true });

    if (kind === "nightworks") this.lightningLampStrike();
    if (kind === "electricRain") EventManager.emit("ui:message", { title: "DESVÍO DE ENERGÍA", body: "Las rutas altas tienen mayor recompensa.", tone: "normal" });
    if (kind === "storm") this.lightning(0.009);
    if (kind === "tunnel") EventManager.emit("ui:message", { title: "TÚNEL", body: "La iluminación caerá progresivamente. Lee las marcas de la vía.", tone: "warning" });
    if (kind === "industrial") EventManager.emit("ui:message", { title: "CONVOY INDUSTRIAL", body: "Mantén el ritmo entre patrones dobles.", tone: "normal" });
    if (kind === "chase") EventManager.emit("ui:message", { title: "PERSECUCIÓN", body: "La amenaza gana terreno si rompes el flujo.", tone: "warning" });
    if (kind === "highVoltage") EventManager.emit("ui:message", { title: "ALTA TENSIÓN", body: "Lee los bursts y usa los orbs para conservar el ritmo.", tone: "warning" });
    if (kind === "master") EventManager.emit("ui:message", { title: "CIRCUITO MAESTRO", body: "Pads, orbs, velocidad y atajos se combinan en una sola ruta.", tone: "warning" });
  }

  update(time: number, deltaMs: number, progress: number) {
    const dt = Math.min(0.05, deltaMs / 1000);
    this.updateRain(dt);
    this.updateAmbient(dt);

    if ((this.current === "storm" || this.current === "highVoltage" || this.current === "master") && time >= this.nextLightningAt) {
      const intensity = this.current === "storm" ? 0.006 : this.current === "highVoltage" ? 0.0045 : 0.0035;
      this.lightning(intensity);
      const min = this.current === "highVoltage" ? 1350 : this.current === "master" ? 1750 : 2200;
      const max = this.current === "highVoltage" ? 2400 : this.current === "master" ? 3000 : 3900;
      this.nextLightningAt = time + Phaser.Math.Between(min, max);
    }

    if (this.current === "highVoltage") {
      const pulse = 0.025 + (Math.sin(time * 0.006) + 1) * 0.015;
      this.overlay.setFillStyle(0x081830, pulse);
    }

    if (this.current === "master") {
      const pulse = 0.018 + (Math.sin(time * 0.004) + 1) * 0.012;
      this.overlay.setFillStyle(0x06221d, pulse);
    }

    if (this.current === "tunnel") {
      const darkness = Phaser.Math.Clamp(0.12 + progress * 0.58, 0.12, 0.7);
      this.overlay.setFillStyle(0x00070b, darkness);
      const lit = Math.ceil((1 - progress) * this.tunnelLights.length);
      this.tunnelLights.forEach((light, index) => light.setAlpha(index < lit ? 0.85 : 0.1));
    }

    if (this.current === "industrial") {
      this.industrialConvoy.forEach((item, index) => {
        item.x -= (80 + index * 12) * dt;
        if (item.x < -160) item.x = this.scene.scale.width + 240 + index * 180;
      });
    }

    if (this.current === "chase" && this.chaseThreat) {
      this.chaseDistance -= 9 * dt;
      if (GameManager.combo >= 6) this.chaseDistance += 5 * dt;
      this.chaseDistance = Phaser.Math.Clamp(this.chaseDistance, 72, 520);
      const targetX = this.paco.sprite.x - this.chaseDistance;
      this.chaseThreat.x = Phaser.Math.Linear(this.chaseThreat.x, targetX, 1 - Math.exp(-3.3 * dt));
      this.chaseThreat.y = this.paco.sprite.y - 60 + Math.sin(time * 0.009) * 24;
      if (this.chaseDistance <= 78) GameManager.gameOver();
    }
  }

  private makeRain(count: number, color: number, alpha: number) {
    this.clearRain();
    for (let index = 0; index < count; index += 1) {
      const drop = this.scene.add.rectangle(
        Phaser.Math.Between(0, this.scene.scale.width),
        Phaser.Math.Between(-this.scene.scale.height, this.scene.scale.height),
        2,
        Phaser.Math.Between(10, 20),
        color,
        alpha,
      ).setScrollFactor(0).setDepth(190).setAngle(12);
      drop.setData("speed", Phaser.Math.Between(520, 850));
      this.rain.push(drop);
    }
  }

  private updateRain(dt: number) {
    for (const drop of this.rain) {
      drop.y += Number(drop.getData("speed")) * dt;
      drop.x -= 115 * dt;
      if (drop.y > this.scene.scale.height + 30) {
        drop.y = -30;
        drop.x = Phaser.Math.Between(0, this.scene.scale.width + 120);
      }
    }
  }

  private makeTunnelLights() {
    for (let index = 0; index < 8; index += 1) {
      const light = this.scene.add.circle((index + 0.5) * (this.scene.scale.width / 8), 64, 7, 0xbefbff, 0.85)
        .setScrollFactor(0)
        .setDepth(205);
      this.tunnelLights.push(light);
    }
  }

  private makeConvoy() {
    for (let index = 0; index < 3; index += 1) {
      const item = this.scene.add.image(this.scene.scale.width + 150 + index * 260, this.scene.scale.height - 188, index % 2 ? "obstacle-reel" : "obstacle-cabinet")
        .setDisplaySize(index % 2 ? 88 : 74, index % 2 ? 88 : 108)
        .setAlpha(0.42)
        .setScrollFactor(0)
        .setDepth(5);
      this.industrialConvoy.push(item);
    }
  }

  private makeChaseThreat() {
    this.chaseDistance = 390;
    this.chaseThreat = this.scene.add.circle(this.paco.sprite.x - this.chaseDistance, this.paco.sprite.y - 60, 56, 0xff4466, 0.23)
      .setStrokeStyle(5, 0xff7187, 0.8)
      .setDepth(35);
    this.scene.tweens.add({ targets: this.chaseThreat, scale: 1.18, alpha: 0.42, duration: 540, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }

  private lightning(intensity: number) {
    this.camera.flash(0xeaf6ff, 80);
    this.camera.shake(intensity, 90);
    this.vfx.burst(this.paco.sprite.x + 260, 120, 0xaec8ff, 9, 130);
  }

  private lightningLampStrike() {
    this.clearLamp();
    const x = this.scene.scale.width * 0.72;
    const y = this.scene.scale.height - 155;
    this.lampProp = this.scene.add.image(x, y, "decor-lamp").setScrollFactor(0).setDisplaySize(92, 130).setDepth(25);
    this.lightning(0.01);
    this.scene.tweens.add({
      targets: this.lampProp,
      angle: 14,
      alpha: 0.32,
      duration: 220,
      ease: "Quad.out",
      onComplete: () => this.scene.time.delayedCall(1300, () => {
        if (!this.lampProp) return;
        this.scene.tweens.add({ targets: this.lampProp, angle: 0, alpha: 0.78, duration: 520, ease: "Back.out" });
      }),
    });
  }

  private resize(size: Phaser.Structs.Size) {
    this.overlay.setSize(size.width, size.height);
    this.industrialConvoy.forEach((item) => item.setY(size.height - 188));
  }

  private makeAmbient(kind: SetPieceKind) {
    const color = kind === "storm" ? 0xbfd7ff : kind === "highVoltage" ? 0x7ff5ff : kind === "industrial" ? 0xffd36c : kind === "boss" ? 0xff6f92 : 0xffffff;
    const count = kind === "storm" ? 16 : kind === "highVoltage" ? 20 : 10;
    for (let i = 0; i < count; i += 1) {
      const dot = this.scene.add.circle(Phaser.Math.Between(0, this.scene.scale.width), Phaser.Math.Between(40, this.scene.scale.height - 80), Phaser.Math.Between(1, 3), color, Phaser.Math.FloatBetween(0.08, 0.28)).setScrollFactor(0).setDepth(188);
      dot.setData("vx", Phaser.Math.Between(-55, -18)); dot.setData("vy", Phaser.Math.Between(-15, 18)); this.ambient.push(dot);
    }
  }

  private updateAmbient(dt: number) {
    for (const dot of this.ambient) {
      dot.x += Number(dot.getData("vx")) * dt; dot.y += Number(dot.getData("vy")) * dt;
      if (dot.x < -10) dot.x = this.scene.scale.width + 10;
      if (dot.y < 20) dot.y = this.scene.scale.height - 80; else if (dot.y > this.scene.scale.height - 50) dot.y = 30;
    }
  }

  private clearAmbient() { this.ambient.forEach((item) => item.destroy()); this.ambient = []; }

  private clearRain() { this.rain.forEach((item) => item.destroy()); this.rain = []; }
  private clearTunnel() { this.tunnelLights.forEach((item) => item.destroy()); this.tunnelLights = []; }
  private clearConvoy() { this.industrialConvoy.forEach((item) => item.destroy()); this.industrialConvoy = []; }
  private clearChase() { this.chaseThreat?.destroy(); this.chaseThreat = undefined; }
  private clearLamp() { this.lampProp?.destroy(); this.lampProp = undefined; }

  destroy() {
    this.clearRain();
    this.clearTunnel();
    this.clearConvoy();
    this.clearChase();
    this.clearLamp();
    this.clearAmbient();
    this.overlay.destroy();
    this.eventUnsubs.forEach((unsub) => unsub());
    this.scene.scale.off("resize", this.resize, this);
  }
}
