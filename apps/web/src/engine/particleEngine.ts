import { createNoise2D } from "simplex-noise";
import type { AmbientTheme } from "../types/weather";
import { tierProfile, type DeviceTier } from "../hooks/useDeviceTier";

/**
 * Canvas 2D ambient particle engine.
 *
 * Design constraints (audit C3/D3 + perf):
 * - Single requestAnimationFrame loop.
 * - dt clamped at 100ms so a backgrounded tab can't fast-forward physics.
 * - Object pool sized to the worst-case theme; particle count never grows.
 * - deviceTier halves particle count + frame target on weak laptops.
 * - Dual-canvas crossfade on theme change (old frame frozen, new fades in).
 * - Loop pauses while document.hidden.
 *
 * The engine is only ever constructed when motion + transparency are allowed
 * (decided in React, never CSS). It paints particles only — the themed gradient
 * lives behind it in CSS, so the canvas itself stays transparent.
 */

const MAX_DT_MS = 100;
const CROSSFADE_MS = 700;
/** Pool size — the densest theme (storm) caps here. */
const WORST_CASE_PARTICLES = 240;

type ParticleKind = "rain" | "snow" | "motes" | "haze";

interface ThemeVisual {
  kind: ParticleKind;
  count: number;
  rgb: [number, number, number];
  speed: number;
  size: [number, number];
}

const THEME_VISUALS: Record<AmbientTheme, ThemeVisual> = {
  clear: { kind: "motes", count: 70, rgb: [186, 230, 253], speed: 14, size: [1, 2.4] },
  cloud: { kind: "haze", count: 42, rgb: [148, 163, 184], speed: 10, size: [40, 96] },
  rain: { kind: "rain", count: 190, rgb: [125, 211, 252], speed: 620, size: [8, 18] },
  storm: { kind: "rain", count: 240, rgb: [165, 180, 252], speed: 820, size: [10, 22] },
  snow: { kind: "snow", count: 150, rgb: [224, 242, 254], speed: 46, size: [1.4, 3.6] },
  fog: { kind: "haze", count: 30, rgb: [161, 161, 170], speed: 6, size: [60, 130] },
  atmosphere: { kind: "motes", count: 64, rgb: [192, 132, 252], speed: 12, size: [1.2, 2.8] },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  seed: number;
  active: boolean;
}

interface Layer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  opacity: number;
}

export interface ParticleEngineOptions {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  theme: AmbientTheme;
  tier: DeviceTier;
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class ParticleEngine {
  private layers: [Layer, Layer];
  private activeIndex = 0;
  private theme: AmbientTheme;
  private readonly profile: ReturnType<typeof tierProfile>;
  private readonly noise2D = createNoise2D();

  private readonly pool: Particle[] = [];
  private activeCount = 0;

  private width = 0;
  private height = 0;
  private dpr = 1;

  private rafId: number | null = null;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private elapsed = 0;
  private crossfadeRemaining = 0;

  private readonly onVisibility = () => {
    if (typeof document !== "undefined" && document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  constructor(options: ParticleEngineOptions) {
    const frontCtx = options.front.getContext("2d");
    const backCtx = options.back.getContext("2d");
    if (!frontCtx || !backCtx) {
      throw new Error("ParticleEngine: 2D context unavailable");
    }
    this.layers = [
      { canvas: options.front, ctx: frontCtx, opacity: 1 },
      { canvas: options.back, ctx: backCtx, opacity: 0 },
    ];
    this.theme = options.theme;
    this.profile = tierProfile(options.tier);

    for (let i = 0; i < WORST_CASE_PARTICLES; i += 1) {
      this.pool.push({
        x: 0, y: 0, vx: 0, vy: 0, size: 1, alpha: 1, seed: 0, active: false,
      });
    }
  }

  start(): void {
    if (this.running) return;
    this.resize();
    this.seedParticles(this.theme);
    this.running = true;
    this.lastTime = performance.now();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    this.scheduleFrame();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
  }

  private pause(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private resume(): void {
    if (!this.running || this.rafId !== null) return;
    this.lastTime = performance.now();
    this.scheduleFrame();
  }

  setTheme(theme: AmbientTheme): void {
    if (theme === this.theme) return;
    // Freeze the current layer, paint the new theme onto the other, crossfade.
    this.theme = theme;
    this.activeIndex = this.activeIndex === 0 ? 1 : 0;
    this.seedParticles(theme);
    this.crossfadeRemaining = CROSSFADE_MS;
  }

  resize(): void {
    const { canvas } = this.layers[0];
    const parent = canvas.parentElement;
    const rect = parent?.getBoundingClientRect();
    this.dpr = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      2,
    );
    this.width = Math.max(1, Math.floor(rect?.width ?? canvas.clientWidth ?? 1));
    this.height = Math.max(1, Math.floor(rect?.height ?? canvas.clientHeight ?? 1));
    for (const layer of this.layers) {
      layer.canvas.width = Math.floor(this.width * this.dpr);
      layer.canvas.height = Math.floor(this.height * this.dpr);
      layer.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  private seedParticles(theme: AmbientTheme): void {
    const visual = THEME_VISUALS[theme];
    this.activeCount = Math.min(
      WORST_CASE_PARTICLES,
      Math.max(1, Math.round(visual.count * this.profile.particleScale)),
    );
    for (let i = 0; i < this.pool.length; i += 1) {
      const p = this.pool[i]!;
      p.active = i < this.activeCount;
      if (p.active) this.resetParticle(p, visual, true);
    }
  }

  private resetParticle(p: Particle, visual: ThemeVisual, initial: boolean): void {
    p.size = randRange(visual.size[0], visual.size[1]);
    p.seed = Math.random() * 1000;
    p.alpha = randRange(0.25, 0.7);
    p.x = Math.random() * this.width;

    switch (visual.kind) {
      case "rain": {
        p.y = initial ? Math.random() * this.height : -p.size;
        p.vx = visual.speed * 0.12;
        p.vy = visual.speed * randRange(0.85, 1.15);
        break;
      }
      case "snow": {
        p.y = initial ? Math.random() * this.height : -p.size;
        p.vx = 0;
        p.vy = visual.speed * randRange(0.7, 1.3);
        break;
      }
      case "motes": {
        p.y = Math.random() * this.height;
        p.vx = randRange(-visual.speed, visual.speed) * 0.4;
        p.vy = -visual.speed * randRange(0.4, 1);
        break;
      }
      case "haze": {
        p.y = Math.random() * this.height;
        p.vx = randRange(-visual.speed, visual.speed);
        p.vy = randRange(-visual.speed, visual.speed) * 0.4;
        p.alpha = randRange(0.04, 0.12);
        break;
      }
    }
  }

  private scheduleFrame(): void {
    this.rafId = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const rawDt = now - this.lastTime;
    this.lastTime = now;
    const dt = Math.min(rawDt, MAX_DT_MS);
    this.elapsed += dt;

    const frameInterval = 1000 / this.profile.fpsCap;
    this.accumulator += dt;
    if (this.accumulator >= frameInterval) {
      this.step(this.accumulator / 1000);
      this.render(dt);
      this.accumulator = 0;
    }

    this.scheduleFrame();
  };

  private step(dtSeconds: number): void {
    const visual = THEME_VISUALS[this.theme];
    for (let i = 0; i < this.activeCount; i += 1) {
      const p = this.pool[i]!;
      if (!p.active) continue;

      if (visual.kind === "snow" || visual.kind === "motes") {
        const sway = this.noise2D(p.seed, this.elapsed * 0.0004);
        p.x += (p.vx + sway * 18) * dtSeconds;
      } else {
        p.x += p.vx * dtSeconds;
      }
      p.y += p.vy * dtSeconds;

      const off =
        p.y > this.height + p.size ||
        p.y < -p.size - 4 ||
        p.x < -p.size - 4 ||
        p.x > this.width + p.size + 4;
      if (off) this.resetParticle(p, visual, false);
    }
  }

  private render(dt: number): void {
    // Advance crossfade opacities.
    if (this.crossfadeRemaining > 0) {
      this.crossfadeRemaining = Math.max(0, this.crossfadeRemaining - dt);
    }
    const t = this.crossfadeRemaining > 0 ? this.crossfadeRemaining / CROSSFADE_MS : 0;
    const active = this.layers[this.activeIndex];
    const idle = this.layers[this.activeIndex === 0 ? 1 : 0];
    active.opacity = 1 - t;
    idle.opacity = t;
    active.canvas.style.opacity = String(active.opacity);
    idle.canvas.style.opacity = String(idle.opacity);

    const { ctx } = active;
    ctx.clearRect(0, 0, this.width, this.height);

    const visual = THEME_VISUALS[this.theme];
    const [r, g, b] = visual.rgb;

    if (visual.kind === "rain") {
      ctx.lineCap = "round";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < this.activeCount; i += 1) {
        const p = this.pool[i]!;
        if (!p.active) continue;
        ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.02, p.y - p.size);
        ctx.stroke();
      }
      return;
    }

    for (let i = 0; i < this.activeCount; i += 1) {
      const p = this.pool[i]!;
      if (!p.active) continue;
      if (visual.kind === "haze") {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(${r},${g},${b},${p.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default ParticleEngine;
