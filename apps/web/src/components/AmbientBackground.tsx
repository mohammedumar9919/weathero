import { useEffect, useRef, useState } from "react";
import type { AmbientTheme } from "../types/weather";
import { useDeviceTier, type DeviceTier } from "../hooks/useDeviceTier";
import type { ParticleEngine } from "../engine/particleEngine";
import "../styles/wow.css";

interface AmbientBackgroundProps {
  theme: AmbientTheme;
}

const STATIC_QUERIES = [
  "(prefers-reduced-motion: reduce)",
  "(prefers-reduced-transparency: reduce)",
];

/**
 * True when the user prefers reduced motion OR reduced transparency. Either one
 * means we must render a static gradient and NEVER mount the canvas/engine.
 * This decision lives in React (not CSS) so the animation loop is never created
 * for these users — audit C3/D3.
 */
function usePrefersStatic(): boolean {
  const compute = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? STATIC_QUERIES.some((q) => window.matchMedia(q).matches)
      : false;

  const [matches, setMatches] = useState<boolean>(compute);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mqls = STATIC_QUERIES.map((q) => window.matchMedia(q));
    const onChange = () => setMatches(mqls.some((m) => m.matches));
    mqls.forEach((m) => m.addEventListener?.("change", onChange));
    return () => mqls.forEach((m) => m.removeEventListener?.("change", onChange));
  }, []);

  return matches;
}

/** Animated canvas layer — only ever mounted when motion is allowed. */
function AmbientCanvasLayer({ theme, tier }: { theme: AmbientTheme; tier: DeviceTier }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  // Construct + start the engine once (lazy-imported so it stays out of the
  // main bundle). Cleanup stops the rAF loop and listeners.
  useEffect(() => {
    let disposed = false;
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;

    void import("../engine/particleEngine").then(({ ParticleEngine }) => {
      if (disposed) return;
      try {
        const engine = new ParticleEngine({ front, back, theme, tier });
        engineRef.current = engine;
        engine.start();
      } catch {
        // 2D context unavailable (e.g. headless) — degrade silently.
        engineRef.current = null;
      }
    });

    const onResize = () => engineRef.current?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      engineRef.current?.stop();
      engineRef.current = null;
    };
    // theme/tier handled below; engine is created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade to the new theme without recreating the engine.
  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="ambient-bg ambient-bg-canvas"
      data-theme={theme}
      aria-hidden="true"
    >
      <canvas ref={backRef} className="ambient-bg-layer" />
      <canvas ref={frontRef} className="ambient-bg-layer" />
    </div>
  );
}

/**
 * Themed ambient background. Replaces the CSS-orb AmbientCanvas with a Canvas 2D
 * particle field; falls back to a static gradient for reduced-motion /
 * reduced-transparency users (no canvas, no engine).
 */
export function AmbientBackground({ theme }: AmbientBackgroundProps) {
  const prefersStatic = usePrefersStatic();
  const tier = useDeviceTier();

  if (prefersStatic) {
    return (
      <div
        className="ambient-bg ambient-bg-static"
        data-theme={theme}
        aria-hidden="true"
      />
    );
  }

  return <AmbientCanvasLayer theme={theme} tier={tier} />;
}

export default AmbientBackground;
