import * as Phaser from "phaser";
import type { Paco } from "../player/Paco";

export class CameraDirector {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private targetZoom = 1;
  private targetOffset = -190;

  constructor(private scene: Phaser.Scene, private paco: Paco) {
    this.camera = scene.cameras.main;
    this.camera.startFollow(paco.sprite, true, 0.13, 0.15);
    this.camera.setFollowOffset(this.targetOffset, 75);
    this.camera.setRoundPixels(false);
  }

  update(deltaMs: number, speed: number) {
    const dt = Math.min(0.05, deltaMs / 1000);
    this.targetOffset = Phaser.Math.Clamp(-145 - speed * 0.09, -240, -165);
    const currentOffsetX = this.camera.followOffset.x;
    const nextOffset = Phaser.Math.Linear(currentOffsetX, this.targetOffset, 1 - Math.exp(-7 * dt));
    this.camera.setFollowOffset(nextOffset, 75);
    this.camera.setZoom(Phaser.Math.Linear(this.camera.zoom, this.targetZoom, 1 - Math.exp(-4.5 * dt)));
  }

  setBounds(width: number, height: number) {
    this.camera.setBounds(0, 0, width, height);
  }

  setBossFraming(active: boolean) {
    this.targetZoom = active ? 0.9 : 1;
    this.targetOffset = active ? -260 : -190;
  }

  shake(intensity = 0.006, duration = 130) {
    this.camera.shake(duration, intensity);
  }

  flash(color = 0xffffff, duration = 100) {
    this.camera.flash(duration, (color >> 16) & 255, (color >> 8) & 255, color & 255);
  }
}
