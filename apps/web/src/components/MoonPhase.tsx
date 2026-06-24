import { useMemo } from "react";
import { Moon } from "lunarphase-js";
import "../styles/wow.css";

export interface MoonPhaseProps {
  /** Defaults to now; tests pass a fixed date for deterministic output. */
  date?: Date;
}

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Illuminated fraction derived from synodic age. lunarphase-js exposes phase
 * name, emoji, and age percent but not illumination, so we compute it with the
 * standard cosine relation: 0 at new moon, 1 at full. Pure date math, offline.
 */
export function illuminationFraction(agePercent: number): number {
  const f = (1 - Math.cos(2 * Math.PI * agePercent)) / 2;
  return Math.max(0, Math.min(1, f));
}

export function MoonPhase({ date }: MoonPhaseProps) {
  const { phaseName, emoji, illumPct, waxing, dashOffset } = useMemo(() => {
    const when = date ?? new Date();
    const agePercent = Moon.lunarAgePercent(when);
    const illum = illuminationFraction(agePercent);
    return {
      phaseName: Moon.lunarPhase(when),
      emoji: Moon.lunarPhaseEmoji(when),
      illumPct: Math.round(illum * 100),
      waxing: Moon.isWaxing(when),
      dashOffset: RING_CIRCUMFERENCE * (1 - illum),
    };
  }, [date]);

  return (
    <figure
      className="moon-phase"
      aria-label={`Moon phase: ${phaseName}, ${illumPct}% illuminated`}
    >
      <div className="moon-phase-disc">
        <svg viewBox="0 0 100 100" className="moon-phase-ring" aria-hidden="true">
          <circle
            className="moon-phase-ring-track"
            cx="50"
            cy="50"
            r={RING_RADIUS}
          />
          <circle
            className="moon-phase-ring-fill"
            cx="50"
            cy="50"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="moon-phase-emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <figcaption className="moon-phase-caption">
        <span className="moon-phase-name">{phaseName}</span>
        <span className="moon-phase-meta">
          {illumPct}% lit · {waxing ? "waxing" : "waning"}
        </span>
      </figcaption>
    </figure>
  );
}

export default MoonPhase;
