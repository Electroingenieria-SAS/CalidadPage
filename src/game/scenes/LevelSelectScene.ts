import * as Phaser from "phaser";
import { LEVELS } from "../levels/data";
import { CampaignProgress } from "../campaign/CampaignProgress";
import { GameManager } from "../core/GameManager";

export class LevelSelectScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super("LevelSelectScene");
  }

  create() {
    CampaignProgress.load();
    this.cameras.main.setBackgroundColor(0x06111f);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x06111f, 1);

    for (let x = 0; x <= width; x += 64) {
      this.add.rectangle(x, height / 2, 1, height, 0x8bc8ff, 0.035);
    }
    for (let y = 0; y <= height; y += 64) {
      this.add.rectangle(width / 2, y, width, 1, 0x8bc8ff, 0.035);
    }

    this.add.text(width / 2, 54, "PACO · CIRCUITOS DE CALIDAD", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
      color: "#f3f8ff",
    }).setOrigin(0.5);

    this.add.text(width / 2, 92, "Niveles predefinidos · aprende el patrón · llega al 100%", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "13px",
      color: "rgba(226,238,252,.72)",
    }).setOrigin(0.5);

    const cols = 5;
    const cardW = 214;
    const cardH = 210;
    const gapX = 18;
    const gapY = 22;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = 235;

    LEVELS.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      this.createLevelCard(level, index, x, y, cardW, cardH);
    });

    this.add.text(width / 2, height - 34, "Clic / toque para jugar · SPACE / ↑ durante el nivel · los atajos elevados dan más energía y secretos", {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "11px",
      color: "rgba(222,233,247,.58)",
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(220, 0, 0, 0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyCards());
  }

  private createLevelCard(level: (typeof LEVELS)[number], index: number, x: number, y: number, w: number, h: number) {
    const unlocked = CampaignProgress.isUnlocked(index);
    const progress = CampaignProgress.getLevel(level.id);
    const container = this.add.container(x, y).setDepth(10);
    this.cards.push(container);

    const bg = this.add.rectangle(0, 0, w, h, unlocked ? 0x0c2139 : 0x0b1625, unlocked ? 0.94 : 0.72)
      .setStrokeStyle(1.4, unlocked ? level.theme.accent : 0x5b6877, unlocked ? 0.34 : 0.18);

    const accent = this.add.rectangle(-w / 2 + 4, 0, 6, h - 8, unlocked ? level.theme.accent : 0x4d5a68, unlocked ? 0.95 : 0.3);
    const number = this.add.text(-w / 2 + 20, -h / 2 + 17, String(index + 1).padStart(2, "0"), {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: unlocked ? Phaser.Display.Color.IntegerToColor(level.theme.accent).rgba : "rgba(192,202,214,.45)",
    });

    const title = this.add.text(-w / 2 + 20, -h / 2 + 44, level.name.toUpperCase(), {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "15px",
      fontStyle: "bold",
      color: unlocked ? "#f2f7ff" : "rgba(218,227,238,.42)",
      wordWrap: { width: w - 40 },
    });

    const difficulty = this.add.text(-w / 2 + 20, -2, `${"◆".repeat(Math.min(5, Math.ceil(level.difficulty / 2)))}${"◇".repeat(Math.max(0, 5 - Math.ceil(level.difficulty / 2)))}`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      color: unlocked ? "#ffd75a" : "rgba(204,211,220,.3)",
    });

    const metadata = this.add.text(-w / 2 + 20, 28, `${level.targetDurationSec}s aprox. · velocidad ${level.baseSpeed}`, {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "10px",
      color: unlocked ? "rgba(218,232,247,.64)" : "rgba(190,200,210,.32)",
    });

    const status = this.add.text(-w / 2 + 20, h / 2 - 38, unlocked
      ? progress.completed
        ? `${progress.medal === "gold" ? "★ ORO" : progress.medal === "silver" ? "◆ PLATA" : "● BRONCE"} · ${progress.bestScore} pts`
        : "DISPONIBLE"
      : "BLOQUEADO",
    {
      fontFamily: "Century Gothic, Arial, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: unlocked ? (progress.completed ? "#74f3bd" : "#8ad2ff") : "rgba(191,201,212,.36)",
    });

    const ranking = this.add.text(-w / 2 + 20, h / 2 - 18, progress.completed && progress.topRuns?.length ? `TOP · ${progress.topRuns.slice(0,3).map((r,i)=>`#${i+1} ${r.score}`).join("  ")}` : "", { fontFamily: "Century Gothic, Arial, sans-serif", fontSize: "9px", color: "rgba(220,232,245,.52)" });
    container.add([bg, accent, number, title, difficulty, metadata, status, ranking]);

    if (unlocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setFillStyle(0x12304f, 1).setStrokeStyle(2, level.theme.accent, 0.78);
        this.tweens.add({ targets: container, scale: 1.025, duration: 120, ease: "Quad.out" });
      });
      bg.on("pointerout", () => {
        bg.setFillStyle(0x0c2139, 0.94).setStrokeStyle(1.4, level.theme.accent, 0.34);
        this.tweens.add({ targets: container, scale: 1, duration: 120, ease: "Quad.out" });
      });
      bg.on("pointerdown", () => this.startLevel(index));
    }
  }

  private startLevel(levelIndex: number) {
    if (!CampaignProgress.isUnlocked(levelIndex)) return;
    GameManager.reset();
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.time.delayedCall(190, () => this.scene.start("LevelScene", { levelIndex }));
  }

  private destroyCards() {
    for (const card of this.cards) card.destroy(true);
    this.cards = [];
  }
}
