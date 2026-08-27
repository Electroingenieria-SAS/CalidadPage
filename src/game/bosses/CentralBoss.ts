import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";
import { EventManager } from "../core/EventManager";
import { GameManager } from "../core/GameManager";
import type { CameraDirector } from "../camera/CameraDirector";
import type { VFXManager } from "../vfx/VFXManager";

type AttackType = 'ground' | 'high' | 'drop';

export class CentralBoss {
  readonly root: Phaser.GameObjects.Container;
  private projectiles: Phaser.Physics.Arcade.Group;
  private health = 8;
  private maxHealth = 8;
  private nextAttackAt = 0;
  private active = false;
  private phase = 1;
  private readonly anchorDistance = 760;
  private ringA: Phaser.GameObjects.Arc;
  private ringB: Phaser.GameObjects.Arc;
  private core: Phaser.GameObjects.Arc;
  private wingL: Phaser.GameObjects.Rectangle;
  private wingR: Phaser.GameObjects.Rectangle;

  constructor(
    private scene: Phaser.Scene,
    private paco: Paco,
    x: number,
    groundY: number,
    private camera: CameraDirector,
    private vfx: VFXManager,
  ) {
    const shadow = scene.add.ellipse(0, 96, 210, 34, 0x000000, 0.28);
    const halo = scene.add.circle(0, 0, 86, 0xffc562, 0.08).setStrokeStyle(3, 0xffcf5d, 0.18);
    this.ringA = scene.add.circle(0, 0, 70, 0x1d2d43, 0.92).setStrokeStyle(8, 0xffd95e, 0.96);
    this.ringB = scene.add.circle(0, 0, 44, 0x0f1a2a, 1).setStrokeStyle(5, 0xff688c, 0.86);
    this.core = scene.add.circle(0, 0, 20, 0x76ecff, 0.95).setStrokeStyle(3, 0xffffff, 0.88);
    this.wingL = scene.add.rectangle(-86, 10, 70, 28, 0x29394b, 1).setStrokeStyle(3, 0xffd95e, 0.7);
    this.wingR = scene.add.rectangle(86, 10, 70, 28, 0x29394b, 1).setStrokeStyle(3, 0xffd95e, 0.7);
    const finL = scene.add.triangle(-118, 8, 0, 0, 26, -18, 26, 18, 0xff6a8a, 0.88);
    const finR = scene.add.triangle(118, 8, 0, 0, -26, -18, -26, 18, 0xff6a8a, 0.88);
    this.root = scene.add.container(x, groundY - 130, [shadow, halo, this.wingL, this.wingR, finL, finR, this.ringA, this.ringB, this.core]).setDepth(30);

    scene.tweens.add({ targets: [this.ringA, this.ringB], angle: 360, duration: 3600, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: halo, scale: 1.15, alpha: { from: 0.06, to: 0.16 }, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    scene.tweens.add({ targets: this.core, scale: 1.08, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.projectiles = scene.physics.add.group({ allowGravity: false, immovable: true, maxSize: 28 });
    scene.physics.add.overlap(paco.sprite, this.projectiles, (_player, object) => this.hitByProjectile(object as Phaser.Physics.Arcade.Image));
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.root.setAlpha(0).setScale(0.62).setY(this.root.y - 180);
    this.scene.tweens.add({ targets: this.root, y: this.root.y + 180, alpha: 1, scale: 1, duration: 760, ease: "Back.out", onStart: () => { this.camera.shake(0.006, 180); this.camera.flash(0xffd95e, 150); } });
    this.nextAttackAt = this.scene.time.now + 1450;
    this.camera.setBossFraming(true);
    this.camera.flash(0xffdf72, 180);
    EventManager.emit("boss:health", { current: this.health, max: this.maxHealth, phase: this.phase });
    EventManager.emit("ui:message", { title: "CENTRAL DE CALIDAD · FASE FINAL", body: "Lee los pulsos, evita las descargas y vacía las 8 cargas del núcleo.", tone: "warning" });
  }

  private hitByProjectile(projectile: Phaser.Physics.Arcade.Image) {
    if (!projectile.active || GameManager.status !== "running") return;
    this.releaseProjectile(projectile);
    GameManager.breakCombo();
    GameManager.gameOver();
  }

  private spawnAttack(type: AttackType) {
    if (type === 'drop') {
      const x = this.paco.sprite.x + Phaser.Math.Between(280, 420);
      const projectile = this.projectiles.get(x, 30, "vfx-pulse") as Phaser.Physics.Arcade.Image | null;
      if (!projectile) return;
      projectile.setActive(true).setVisible(true).setDisplaySize(42, 110).setTint(0xff667e).setDepth(28);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.enable = true; body.setAllowGravity(false); body.setVelocity(0, 520 + this.phase * 70); body.setSize(26, 90, true);
      projectile.setData('checked', true);
      projectile.setData('attackType', 'drop');
      return;
    }

    const high = type === 'high';
    const projectile = this.projectiles.get(this.root.x - 80, this.root.y + (high ? -12 : 74), "vfx-pulse") as Phaser.Physics.Arcade.Image | null;
    if (!projectile) return;
    projectile.setActive(true).setVisible(true).setDisplaySize(high ? 64 : 86, high ? 20 : 30).setTint(high ? 0x76ecff : this.phase === 3 ? 0xff657e : 0x66cfff).setDepth(28);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setVelocityX(-(560 + this.phase * 100));
    body.setVelocityY(0);
    body.setSize(high ? 52 : 68, high ? 14 : 20, true);
    projectile.setData('checked', false);
    projectile.setData('attackType', type);
  }

  private releaseProjectile(projectile: Phaser.Physics.Arcade.Image) {
    projectile.setActive(false).setVisible(false).setPosition(-9999, -9999);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.stop();
    body.enable = false;
  }

  private registerPerfect(projectile: Phaser.Physics.Arcade.Image) {
    projectile.setData("checked", true);
    this.health = Math.max(0, this.health - 1);
    GameManager.perfectJump(this.paco.sprite.x, this.paco.sprite.y - 70);
    this.vfx.perfect(this.paco.sprite.x, this.paco.sprite.y - 70);
    this.vfx.ring(this.root.x, this.root.y, 0xffd95e, 20, 120, 0.6);
    this.camera.shake(0.004, 120);

    const nextPhase = this.health <= 2 ? 3 : this.health <= 5 ? 2 : 1;
    if (nextPhase !== this.phase) {
      this.phase = nextPhase;
      this.wingL.setFillStyle(this.phase === 3 ? 0x512334 : 0x29394b);
      this.wingR.setFillStyle(this.phase === 3 ? 0x512334 : 0x29394b);
      EventManager.emit("ui:message", {
        title: `FASE ${this.phase}`,
        body: this.phase === 3 ? "Sobrecarga crítica: mezcla de pulsos y descargas verticales." : "La Central acelera y alterna alturas de ataque.",
        tone: "warning",
      });
    }
    EventManager.emit("boss:health", { current: this.health, max: this.maxHealth, phase: this.phase });

    if (this.health <= 0) {
      this.active = false;
      GameManager.addScore(1400);
      this.camera.setBossFraming(false);
      this.camera.flash(0xffe36f, 260);
      this.camera.shake(0.008, 240);
      this.vfx.burst(this.root.x, this.root.y, 0xffe36f, 36, 260);
      this.vfx.ring(this.root.x, this.root.y, 0xffffff, 16, 180, 0.78);
      EventManager.emit("boss:defeated");
      EventManager.emit("ui:message", { title: "CENTRAL DESCARGADA", body: "+1400 · jefe final neutralizado", tone: "success" });
      this.scene.tweens.add({ targets: this.root, alpha: 0, scale: 1.18, duration: 280 });
    }
  }

  update(time: number, delta: number) {
    if (!this.active || GameManager.status !== "running") return;

    const targetBossX = this.paco.sprite.x + this.anchorDistance;
    this.root.x = Phaser.Math.Linear(this.root.x, targetBossX, Math.min(1, delta / 180));

    if (time >= this.nextAttackAt) {
      const options: AttackType[] = this.phase === 1 ? ['ground','ground','high'] : this.phase === 2 ? ['ground','high','drop'] : ['ground','high','drop','drop'];
      this.spawnAttack(options[Phaser.Math.Between(0, options.length - 1)]);
      const interval = this.phase === 1 ? 1180 : this.phase === 2 ? 900 : 650;
      this.nextAttackAt = time + interval;
    }

    const playerBody = this.paco.sprite.body as Phaser.Physics.Arcade.Body;
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Phaser.Physics.Arcade.Image;
      if (!projectile.active) continue;
      const attackType = String(projectile.getData('attackType') || 'ground') as AttackType;
      if ((attackType === 'ground' || attackType === 'high') && projectile.x < this.paco.sprite.x - 24 && !projectile.getData("checked")) {
        const airborne = !(playerBody.blocked.down || playerBody.touching.down || playerBody.blocked.up || playerBody.touching.up);
        const clearance = attackType === 'high'
          ? Math.abs(this.paco.sprite.y - projectile.y) > 50
          : this.paco.sprite.y < projectile.y - 52;
        if (airborne && clearance) this.registerPerfect(projectile);
        else projectile.setData("checked", true);
      }
      if (attackType === 'drop' && projectile.y > this.scene.scale.height + 100) this.releaseProjectile(projectile);
      if ((attackType === 'ground' || attackType === 'high') && projectile.x < this.scene.cameras.main.scrollX - 150) this.releaseProjectile(projectile);
    }

    this.root.y += Math.sin(time * 0.003) * delta * 0.0018;
  }

  get x() { return this.root.x; }
  get y() { return this.root.y; }

  destroy() {
    this.camera.setBossFraming(false);
    this.projectiles.clear(true, true);
    this.root.destroy(true);
  }
}
