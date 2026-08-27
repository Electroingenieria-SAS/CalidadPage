"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface PaperBurnTransitionProps {
  active: boolean;
  durationMs: number;
  pageRef: RefObject<HTMLElement | null>;
  onComplete: () => void;
}

type Seed = {
  y: number;
  phase: number;
  speed: number;
  size: number;
  drift: number;
};

// More contour samples make the burn edge visually continuous, while all
// particles now sample that already-computed contour instead of recalculating
// the expensive noise field independently on every frame.
const CONTOUR_POINTS = 42;
const SMOKE_COUNT = 22;
const SPARK_COUNT = 28;
const ASH_COUNT = 14;
const FLAME_COUNT = 20;

function finiteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function positiveFinite(value: number, fallback = 1) {
  const normalized = finiteNumber(value, fallback);
  return normalized > 0 ? normalized : fallback;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const denominator = edge1 - edge0;
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) return 0;
  const x = clamp((finiteNumber(value) - edge0) / denominator, 0, 1);
  return x * x * (3 - 2 * x);
}

function smootherstep01(value: number) {
  const x = clamp(value, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function easeBurn(value: number) {
  // C2-continuous motion: zero acceleration discontinuities at ignition and at
  // the final fibre. The previous piecewise curve changed velocity abruptly at
  // 18%, which is perceptible on high-refresh displays.
  const smooth = smootherstep01(value);
  return clamp(smooth * (1.06 - 0.06 * smooth), 0, 1);
}

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.731 + salt * 47.113) * 43758.5453;
  return value - Math.floor(value);
}

function hash1(value: number) {
  const hashed = Math.sin(value * 127.1 + 311.7) * 43758.5453123;
  return hashed - Math.floor(hashed);
}

function valueNoise1D(value: number) {
  const base = Math.floor(value);
  const fraction = value - base;
  const eased = fraction * fraction * (3 - 2 * fraction);
  const a = hash1(base);
  const b = hash1(base + 1);
  return a + (b - a) * eased;
}

function fbm1D(value: number) {
  let amplitude = 0.54;
  let frequency = 1;
  let total = 0;
  let norm = 0;
  for (let octave = 0; octave < 5; octave += 1) {
    total += valueNoise1D(value * frequency + octave * 19.17) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return total / norm;
}

function makeSeeds(count: number, salt: number): Seed[] {
  return Array.from({ length: count }, (_, index) => ({
    y: seeded(index, salt),
    phase: seeded(index + 41, salt) * Math.PI * 2,
    speed: 0.65 + seeded(index + 83, salt) * 1.2,
    size: 0.55 + seeded(index + 127, salt) * 0.9,
    drift: -0.5 + seeded(index + 173, salt),
  }));
}

const smokeSeeds = makeSeeds(SMOKE_COUNT, 3.7);
const sparkSeeds = makeSeeds(SPARK_COUNT, 8.2);
const ashSeeds = makeSeeds(ASH_COUNT, 12.6);
const flameSeeds = makeSeeds(FLAME_COUNT, 18.4);

function contourAt(yNorm: number, progress: number, time: number, width: number) {
  const safeWidth = positiveFinite(width, 1);
  const safeY = clamp(finiteNumber(yNorm), 0, 1);
  const safeProgress = clamp(finiteNumber(progress), 0, 1);
  const safeTime = finiteNumber(time);
  const base = safeWidth * (1.055 - safeProgress * 1.145);
  const catchStrength = smoothstep(0.015, 0.2, safeProgress) * (1 - smoothstep(0.87, 1, safeProgress));
  const broad = (fbm1D(safeY * 5.8 + safeTime * 0.15) - 0.5) * safeWidth * 0.063;
  const medium = (fbm1D(safeY * 14.2 - safeTime * 0.25 + 11.4) - 0.5) * safeWidth * 0.025;
  const fibre = (fbm1D(safeY * 34.8 + safeTime * 0.4 + 29.1) - 0.5) * safeWidth * 0.01;
  const lobe = Math.sin((safeY - 0.5) * Math.PI) * safeWidth * 0.011;
  return finiteNumber(base + (broad + medium + fibre + lobe) * catchStrength, base);
}

function buildContour(progress: number, time: number, width: number, target: Float32Array) {
  for (let index = 0; index < target.length; index += 1) {
    const yNorm = index / (target.length - 1);
    target[index] = contourAt(yNorm, progress, time, width);
  }
}

function sampleContourX(contour: Float32Array, yNorm: number) {
  const safeY = clamp(yNorm, 0, 1);
  const scaled = safeY * (contour.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(contour.length - 1, lower + 1);
  const fraction = scaled - lower;
  return contour[lower] + (contour[upper] - contour[lower]) * fraction;
}

function applyClip(page: HTMLElement, contour: Float32Array) {
  let points = "";
  for (let index = 0; index < contour.length; index += 1) {
    const x = clamp(contour[index], -1e6, 1e6);
    const yPercent = (index / (contour.length - 1)) * 100;
    if (index > 0) points += ",";
    points += `${x.toFixed(2)}px ${yPercent.toFixed(2)}%`;
  }
  page.style.clipPath = `polygon(0 0, ${points}, 0 100%)`;
  page.style.webkitClipPath = `polygon(0 0, ${points}, 0 100%)`;
}

function strokeContour(
  context: CanvasRenderingContext2D,
  contour: Float32Array,
  height: number,
  width: number,
  color: string,
  blur = 0,
) {
  if (!contour.length || !Number.isFinite(height) || height <= 0 || !Number.isFinite(width) || width <= 0) return;
  context.save();
  context.beginPath();
  context.moveTo(contour[0], 0);
  for (let index = 1; index < contour.length; index += 1) {
    const previousX = contour[index - 1];
    const previousY = ((index - 1) / (contour.length - 1)) * height;
    const x = contour[index];
    const y = (index / (contour.length - 1)) * height;
    context.quadraticCurveTo(previousX, previousY, (previousX + x) * 0.5, (previousY + y) * 0.5);
  }
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = color;
  context.shadowColor = color;
  context.shadowBlur = blur;
  context.stroke();
  context.restore();
}

function createSmokeSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = 128;
  sprite.height = 128;
  const context = sprite.getContext("2d", { alpha: true });
  if (!context) return sprite;
  const gradient = context.createRadialGradient(64, 64, 3, 64, 64, 60);
  gradient.addColorStop(0, "rgba(56,51,47,.72)");
  gradient.addColorStop(0.42, "rgba(79,74,70,.46)");
  gradient.addColorStop(0.72, "rgba(103,99,95,.18)");
  gradient.addColorStop(1, "rgba(116,112,108,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return sprite;
}

function createFlameSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = 96;
  sprite.height = 144;
  const context = sprite.getContext("2d", { alpha: true });
  if (!context) return sprite;
  context.globalCompositeOperation = "lighter";
  const gradient = context.createLinearGradient(48, 136, 48, 4);
  gradient.addColorStop(0, "rgba(255,66,6,.7)");
  gradient.addColorStop(0.28, "rgba(255,137,10,.96)");
  gradient.addColorStop(0.58, "rgba(255,221,84,.9)");
  gradient.addColorStop(0.8, "rgba(255,250,210,.58)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.beginPath();
  context.moveTo(17, 138);
  context.bezierCurveTo(5, 94, 34, 37, 52, 4);
  context.bezierCurveTo(56, 45, 92, 88, 79, 138);
  context.closePath();
  context.fillStyle = gradient;
  context.shadowColor = "rgba(255,120,18,.82)";
  context.shadowBlur = 18;
  context.fill();
  return sprite;
}

function drawFlameSprite(
  context: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
  pulse: number,
  phase: number,
  alpha: number,
) {
  if (![x, y, size, pulse, phase, alpha].every(Number.isFinite) || size <= 0 || alpha <= 0) return;
  const width = size * (0.76 + pulse * 0.08);
  const height = size * (1.55 + pulse * 0.22);
  context.save();
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = clamp(alpha, 0, 1);
  context.translate(x, y + 2);
  context.rotate(Math.sin(phase + pulse * Math.PI) * 0.035);
  context.drawImage(sprite, -width * 0.5, -height, width, height);
  context.restore();
}

export function PaperBurnTransition({ active, durationMs, pageRef, onComplete }: PaperBurnTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const page = pageRef.current;
    let fallbackTimer: number | null = null;
    let completed = false;

    const finishOnce = () => {
      if (completed) return;
      completed = true;
      completeRef.current();
    };

    if (!canvas || !page) {
      fallbackTimer = window.setTimeout(finishOnce, 80);
      return () => {
        if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      };
    }

    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) {
      fallbackTimer = window.setTimeout(finishOnce, 80);
      return () => {
        if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      };
    }

    const safeDurationMs = Math.max(500, positiveFinite(durationMs, 2050));
    const contour = new Float32Array(CONTOUR_POINTS);
    const smokeSprite = createSmokeSprite();
    const flameSprite = createFlameSprite();
    const start = performance.now();
    let finished = false;

    fallbackTimer = window.setTimeout(() => {
      if (!finished) finishOnce();
    }, safeDurationMs + 420);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssWidth = Number.isFinite(rect.width) && rect.width > 0 ? rect.width : canvas.clientWidth;
      const cssHeight = Number.isFinite(rect.height) && rect.height > 0 ? rect.height : canvas.clientHeight;
      if (!Number.isFinite(cssWidth) || !Number.isFinite(cssHeight) || cssWidth <= 0 || cssHeight <= 0) return;
      const rawDpr = Number.isFinite(window.devicePixelRatio) ? window.devicePixelRatio : 1;
      // 1.75 keeps the flame crisp while avoiding the 4x pixel cost of DPR 2
      // on 120 Hz / high-density panels.
      const dpr = clamp(rawDpr, 1, 1.75);
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    };

    resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);

    page.style.willChange = "clip-path";
    page.style.transform = "translate3d(0,0,0)";

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 1 || height <= 1 || !Number.isFinite(now)) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      const raw = clamp((now - start) / safeDurationMs, 0, 1);
      const progress = easeBurn(raw);
      const time = (now - start) / 1000;
      buildContour(progress, time, width, contour);
      applyClip(page, contour);

      // Smooth symmetric envelope. At the exact handoff frame the fire is
      // already visually at zero, so the canvas can disappear without a pop.
      const heat = smootherstep01(clamp(raw / 0.12, 0, 1)) * (1 - smootherstep01(clamp((raw - 0.86) / 0.14, 0, 1)));
      context.clearRect(0, 0, width, height);

      // Smoke uses a cached sprite. This eliminates dozens of radial-gradient
      // allocations per frame and leaves much more frame budget for 120 Hz.
      for (let index = 0; index < smokeSeeds.length; index += 1) {
        const seed = smokeSeeds[index];
        const cycle = (time * seed.speed * 0.22 + seed.phase / (Math.PI * 2)) % 1;
        const y = seed.y * height - cycle * 64 - Math.sin(time * 0.8 + seed.phase) * 10;
        const yNorm = clamp(y / height, 0, 1);
        const frontX = sampleContourX(contour, yNorm);
        const x = frontX + 10 + seed.drift * 34 + cycle * 30;
        const radius = (18 + 34 * cycle) * seed.size;
        const alpha = heat * (1 - cycle) * 0.2;
        if (![x, y, radius, alpha].every(Number.isFinite) || radius <= 0 || alpha <= 0) continue;
        context.save();
        context.globalAlpha = clamp(alpha, 0, 1);
        context.drawImage(smokeSprite, x - radius, y - radius, radius * 2, radius * 2);
        context.restore();
      }

      strokeContour(context, contour, height, Math.max(23, width * 0.026), `rgba(35,18,8,${0.6 * heat})`, 7);
      strokeContour(context, contour, height, Math.max(12, width * 0.0135), `rgba(139,45,4,${0.73 * heat})`, 14);
      strokeContour(context, contour, height, Math.max(5.5, width * 0.0058), `rgba(255,114,8,${0.94 * heat})`, 19);
      strokeContour(context, contour, height, Math.max(2, width * 0.002), `rgba(255,244,180,${0.92 * heat})`, 8);

      for (let index = 0; index < flameSeeds.length; index += 1) {
        const seed = flameSeeds[index];
        const y = seed.y * height;
        const x = sampleContourX(contour, seed.y) + 2 + Math.sin(time * 5.2 + seed.phase) * 4;
        const pulse = 0.5 + 0.5 * Math.sin(time * (4.2 + seed.speed) + seed.phase);
        const size = (10 + 17 * seed.size) * (0.74 + pulse * 0.32);
        drawFlameSprite(context, flameSprite, x, y, size, pulse, seed.phase, heat * (0.52 + 0.48 * seeded(index, 5.1)));
      }

      context.save();
      context.globalCompositeOperation = "lighter";
      for (let index = 0; index < sparkSeeds.length; index += 1) {
        const seed = sparkSeeds[index];
        const cycle = (time * seed.speed * 0.5 + seed.phase / (Math.PI * 2)) % 1;
        const yBase = seed.y * height;
        const frontX = sampleContourX(contour, seed.y);
        const x = frontX + cycle * (26 + seed.drift * 18);
        const y = yBase - cycle * (42 + seed.size * 38);
        const alpha = heat * (1 - cycle) * 0.88;
        const sparkRadius = Math.max(0.65, seed.size * 1.3);
        if (![x, y, alpha, sparkRadius].every(Number.isFinite) || sparkRadius <= 0) continue;
        context.strokeStyle = `rgba(255,169,36,${alpha * 0.52})`;
        context.lineWidth = Math.max(0.65, seed.size);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - 4 - seed.drift * 4, y + 8 + seed.size * 4);
        context.stroke();
        context.fillStyle = `rgba(255,229,130,${alpha})`;
        context.beginPath();
        context.arc(x, y, sparkRadius, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      for (let index = 0; index < ashSeeds.length; index += 1) {
        const seed = ashSeeds[index];
        const cycle = (time * seed.speed * 0.16 + seed.phase / (Math.PI * 2)) % 1;
        const yBase = seed.y * height;
        const frontX = sampleContourX(contour, seed.y);
        const x = frontX + 8 + cycle * (22 + seed.drift * 32);
        const y = yBase + Math.sin(time * 1.3 + seed.phase) * 12 - cycle * 18;
        if (![x, y, cycle].every(Number.isFinite)) continue;
        context.save();
        context.translate(x, y);
        context.rotate(time * seed.speed + seed.phase);
        context.fillStyle = `rgba(46,37,31,${heat * (1 - cycle) * 0.42})`;
        const size = 2.3 + seed.size * 3.2;
        context.fillRect(-size * 0.5, -size * 0.24, size, size * 0.48);
        context.restore();
      }

      if (raw >= 1) {
        finished = true;
        if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
        fallbackTimer = null;

        // Critical zero-flash handoff: DO NOT restore the outgoing page here.
        // It stays fully clipped until React commits the already-visible sheet
        // underneath. Restoring clip-path before that commit caused the old
        // banner to flash for a single compositor frame.
        finishOnce();
        return;
      }

      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      observer?.disconnect();
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      page.style.clipPath = "";
      page.style.webkitClipPath = "";
      page.style.filter = "";
      page.style.opacity = "";
      page.style.transition = "";
      page.style.willChange = "";
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, durationMs, pageRef]);

  return <canvas ref={canvasRef} className={`paper-burn-transition ${active ? "is-active" : ""}`} aria-hidden="true" />;
}
