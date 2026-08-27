import * as Phaser from "phaser";
import { EventManager } from "../core/EventManager";
import { GameManager } from "../core/GameManager";
import type { LevelDefinition } from "../levels/engine/LevelTypes";

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private challengeText!: Phaser.GameObjects.Text;
  private progressBg!: Phaser.GameObjects.Rectangle;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private levelSlate?: Phaser.GameObjects.Container;
  private factSlate?: Phaser.GameObjects.Container;
  private messageSlate?: Phaser.GameObjects.Container;
  private gameOverDom?: Phaser.GameObjects.DOMElement;
  private leaderboardText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private currentLevel?: LevelDefinition;
  private currentLevelIndex = 0;
  private unsubs: Array<() => void> = [];

  constructor() {
    super("UIScene");
  }

  create() {
    this.createHud();
    this.createLeaderboard();
    this.createGameOverDom();

    this.unsubs.push(
      EventManager.on("level:changed", ({ level, index }) => this.showLevel(level, index)),
      EventManager.on("level:fact", ({ title, body }) => this.showFact(title, body)),
      EventManager.on("ui:message", ({ title, body, tone }) => this.showMessage(title, body, tone)),
      EventManager.on("game:over", () => this.showRunEnd(false)),
      EventManager.on("game:complete", () => this.showRunEnd(true)),
      EventManager.on("game:restart", () => this.hideGameOver()),
      EventManager.on("boss:health", ({ current, max, phase }) => {
        this.bossText.setVisible(true).setText(`CENTRAL · FASE ${phase}   ${current}/${max}`);
      }),
      EventManager.on("boss:defeated", () => this.bossText.setText("CENTRAL DESCARGADA · 0/6")),
    );

    this.scale.on("resize", this.layout, this);
    this.layout(this.scale.gameSize);
    this.refreshLeaderboard();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
  }

  private createHud() {
    const panel = this.add.rectangle(0, 0, 10, 62, 0x041426, 0.74).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08).setDepth(500);
    panel.setName("hud-panel");

    this.levelText = this.add.text(22, 16, "CIRCUITO 01", this.smallStyle()).setDepth(510);
    this.scoreText = this.add.text(0, 15, "0", this.metricStyle()).setDepth(510);
    this.energyText = this.add.text(0, 15, "⚡ 0", this.metricStyle()).setDepth(510);
    this.comboText = this.add.text(0, 15, "x0", this.metricStyle()).setDepth(510);
    this.speedText = this.add.text(0, 15, "0 km/h", this.metricStyle()).setDepth(510);
    this.challengeText = this.add.text(22, 72, "", this.smallStyle()).setDepth(510).setAlpha(0.82);

    this.progressBg = this.add.rectangle(0, 0, 260, 5, 0xffffff, 0.1).setOrigin(0, 0.5).setDepth(510);
    this.progressFill = this.add.rectangle(0, 0, 260, 5, 0xffd452, 1).setOrigin(0, 0.5).setDepth(511).setScale(0, 1);

    this.bossText = this.add.text(0, 92, "", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffe36f",
      fontStyle: "bold",
      backgroundColor: "rgba(13,17,24,.72)",
      padding: { x: 10, y: 7 },
    }).setOrigin(1, 0).setDepth(520).setVisible(false);
  }

  private createLeaderboard() {
    this.leaderboardText = this.add.text(0, 0, "", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "11px",
      lineSpacing: 4,
      color: "rgba(236,246,255,.76)",
      align: "right",
      backgroundColor: "rgba(3,15,29,.48)",
      padding: { x: 10, y: 8 },
    }).setOrigin(1, 1).setDepth(510);
  }

  private createGameOverDom() {
    const element = document.createElement("div");
    element.className = "paco-gameover-dom";
    element.innerHTML = `
      <div class="paco-gameover-card">
        <span class="paco-gameover-kicker">FIN DEL RECORRIDO</span>
        <strong class="paco-gameover-title">Registra tu carrera</strong>
        <p class="paco-gameover-result" data-result></p>
        <input class="paco-gameover-input" data-name maxlength="26" placeholder="Tu nombre" autocomplete="off" />
        <div class="paco-gameover-actions">
          <button type="button" data-save>Guardar ranking</button>
          <button type="button" data-restart>Reintentar nivel</button>
          <button type="button" data-levels>Elegir nivel</button>
        </div>
      </div>
    `;

    this.gameOverDom = this.add.dom(this.scale.width / 2, this.scale.height / 2, element).setDepth(1000).setVisible(false);

    const input = element.querySelector<HTMLInputElement>("[data-name]");
    const result = element.querySelector<HTMLElement>("[data-result]");
    const save = element.querySelector<HTMLButtonElement>("[data-save]");
    const restart = element.querySelector<HTMLButtonElement>("[data-restart]");
    const levels = element.querySelector<HTMLButtonElement>("[data-levels]");

    save?.addEventListener("click", () => {
      if (!input?.value.trim()) return;
      GameManager.saveLeaderboard(input.value);
      this.refreshLeaderboard();
      save.textContent = "Guardado";
      save.disabled = true;
    });

    restart?.addEventListener("click", () => {
      if (result) result.textContent = "";
      if (input) input.value = "";
      if (save) { save.textContent = "Guardar ranking"; save.disabled = false; }
      this.hideGameOver();
      GameManager.reset();
      EventManager.emit("game:restart");
    });

    levels?.addEventListener("click", () => {
      this.hideGameOver();
      EventManager.emit("game:levels");
    });
  }

  private showRunEnd(completed: boolean) {
    if (!this.gameOverDom) return;
    const element = this.gameOverDom.node as HTMLElement;
    const kicker = element.querySelector<HTMLElement>(".paco-gameover-kicker");
    const title = element.querySelector<HTMLElement>(".paco-gameover-title");
    const result = element.querySelector<HTMLElement>("[data-result]");
    if (kicker) kicker.textContent = completed ? "RECORRIDO COMPLETO" : "FIN DEL RECORRIDO";
    if (title) title.textContent = completed ? "Superaste los 10 circuitos" : "Registra tu carrera";
    if (result) result.textContent = `${GameManager.score} puntos · ${Math.round(GameManager.distance)} m · ${GameManager.energy} energías`;
    this.gameOverDom.setVisible(true);
    this.tweens.add({ targets: this.gameOverDom, scale: { from: 0.92, to: 1 }, alpha: { from: 0, to: 1 }, duration: 220, ease: "Back.out" });
    window.setTimeout(() => element.querySelector<HTMLInputElement>("[data-name]")?.focus(), 120);
  }

  private hideGameOver() {
    this.gameOverDom?.setVisible(false).setAlpha(1).setScale(1);
    this.bossText.setVisible(false);
  }

  private showLevel(level: LevelDefinition, index: number) {
    this.currentLevel = level;
    this.currentLevelIndex = index;
    this.levelText.setText(`CIRCUITO ${String(index + 1).padStart(2, "0")} · ${level.name.toUpperCase()}`);
    this.challengeText.setText(`RETO · ${level.challenge.label}`);
    this.progressFill.setFillStyle(level.theme.accent, 1);

    this.levelSlate?.destroy(true);
    const container = this.add.container(this.scale.width / 2, this.scale.height * 0.27).setDepth(700);
    const bg = this.add.rectangle(0, 0, 500, 126, 0x041426, 0.84).setStrokeStyle(1, level.theme.accent, 0.48);
    const eyebrow = this.add.text(0, -35, `CIRCUITO ${String(index + 1).padStart(2, "0")}`, this.smallStyle()).setOrigin(0.5).setColor(Phaser.Display.Color.IntegerToColor(level.theme.accent).rgba);
    const title = this.add.text(0, -2, level.name.toUpperCase(), { ...this.titleStyle(), fontSize: "28px" }).setOrigin(0.5);
    const subtitle = this.add.text(0, 34, level.subtitle, { ...this.smallStyle(), color: "rgba(234,246,255,.72)" }).setOrigin(0.5);
    container.add([bg, eyebrow, title, subtitle]);
    container.setAlpha(0).setScale(0.96);
    this.levelSlate = container;

    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      y: this.scale.height * 0.25,
      duration: 260,
      ease: "Quad.out",
      onComplete: () => this.time.delayedCall(1500, () => {
        if (!container.active) return;
        this.tweens.add({ targets: container, alpha: 0, y: container.y - 18, duration: 260, ease: "Quad.in", onComplete: () => container.destroy(true) });
      }),
    });
  }

  private showFact(title: string, body: string) {
    this.factSlate?.destroy(true);
    const width = Math.min(520, this.scale.width - 44);
    const container = this.add.container(this.scale.width - 24, 128).setDepth(680);
    const bg = this.add.rectangle(0, 0, width, 100, 0x041426, 0.78).setOrigin(1, 0).setStrokeStyle(1, 0x66cfff, 0.24);
    const tag = this.add.text(-width + 18, 14, title.toUpperCase(), this.smallStyle()).setColor("#72d0ff");
    const text = this.add.text(-width + 18, 40, body, { ...this.smallStyle(), color: "rgba(235,244,255,.84)", wordWrap: { width: width - 36 }, lineSpacing: 3 });
    container.add([bg, tag, text]);
    container.setAlpha(0).setX(this.scale.width + 30);
    this.factSlate = container;

    this.tweens.add({ targets: container, x: this.scale.width - 24, alpha: 1, duration: 260, ease: "Quad.out", onComplete: () => this.time.delayedCall(3100, () => {
      if (!container.active) return;
      this.tweens.add({ targets: container, x: this.scale.width + 20, alpha: 0, duration: 240, ease: "Quad.in", onComplete: () => container.destroy(true) });
    }) });
  }

  private showMessage(title: string, body = "", tone: "normal" | "warning" | "success" = "normal") {
    this.messageSlate?.destroy(true);
    const colors = { normal: 0x66cfff, warning: 0xff657e, success: 0xffd452 };
    const container = this.add.container(this.scale.width / 2, this.scale.height - 118).setDepth(720);
    const bg = this.add.rectangle(0, 0, 470, body ? 84 : 58, 0x031425, 0.82).setStrokeStyle(1, colors[tone], 0.48);
    const titleText = this.add.text(0, body ? -16 : 0, title, { ...this.titleStyle(), fontSize: "15px" }).setOrigin(0.5);
    const bodyText = this.add.text(0, 15, body, { ...this.smallStyle(), color: "rgba(234,246,255,.74)" }).setOrigin(0.5);
    container.add([bg, titleText, bodyText]).setAlpha(0).setScale(0.96);
    this.messageSlate = container;
    this.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 180, ease: "Quad.out", onComplete: () => this.time.delayedCall(1800, () => {
      if (!container.active) return;
      this.tweens.add({ targets: container, alpha: 0, y: container.y - 12, duration: 210, onComplete: () => container.destroy(true) });
    }) });
  }

  private refreshLeaderboard() {
    const board = GameManager.loadLeaderboard().slice(0, 3);
    const text = board.length
      ? [`TOP PACO`, ...board.map((entry, index) => `#${index + 1}  ${entry.name}  ${entry.score}`)].join("\n")
      : "TOP PACO\nSin registros";
    this.leaderboardText.setText(text);
  }

  update() {
    const level = this.currentLevel;
    const totalLevels = 10;
    const speed = Math.round(GameManager.getEffectiveSpeed(this.time.now));
    this.scoreText.setText(`${GameManager.score}`);
    this.energyText.setText(`⚡ ${GameManager.energy}`);
    this.comboText.setText(`x${GameManager.combo}`);
    this.speedText.setText(`${speed}`);

    if (level) {
      const levelScene = this.scene.get("LevelScene") as Phaser.Scene & { levelManager?: { getLevelProgress: (x: number) => number }; paco?: { sprite: Phaser.GameObjects.Sprite } };
      const approximateOverall = Math.min(1, (this.currentLevelIndex + 0.02) / totalLevels);
      const levelProgress = levelScene.levelManager && levelScene.paco ? levelScene.levelManager.getLevelProgress(levelScene.paco.sprite.x) : 0;
      this.progressFill.setScale(Math.min(1, approximateOverall + levelProgress / totalLevels), 1);
    }
  }

  private layout(size: Phaser.Structs.Size) {
    const panel = this.children.getByName("hud-panel") as Phaser.GameObjects.Rectangle | null;
    panel?.setSize(size.width, 62);
    this.scoreText.setPosition(size.width - 390, 15);
    this.energyText.setPosition(size.width - 292, 15);
    this.comboText.setPosition(size.width - 200, 15);
    this.speedText.setPosition(size.width - 105, 15);
    this.progressBg.setPosition(size.width / 2 - 130, 31);
    this.progressFill.setPosition(size.width / 2 - 130, 31);
    this.leaderboardText.setPosition(size.width - 18, size.height - 18);
    this.bossText.setPosition(size.width - 18, 82);
    this.gameOverDom?.setPosition(size.width / 2, size.height / 2);
  }

  private smallStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: "Century Gothic, Arial, sans-serif", fontSize: "11px", color: "rgba(234,246,255,.78)", fontStyle: "bold" };
  }

  private metricStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: "Century Gothic, Arial, sans-serif", fontSize: "13px", color: "#ffffff", fontStyle: "bold" };
  }

  private titleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: "Century Gothic, Arial, sans-serif", fontSize: "18px", color: "#ffffff", fontStyle: "bold" };
  }

  private shutdown() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.scale.off("resize", this.layout, this);
  }
}
