import { Clock, ShieldCheck, TestTube2 } from "lucide-react";
import { launchApp } from "../hooks/useViewMode";

const FEATURES = [
  {
    id: "trust",
    icon: ShieldCheck,
    title: "Cache-first honesty",
    copy: "Provenance chips show live vs cache. Hybrid OpenWeather + Open-Meteo fallback — no surprise API bills.",
  },
  {
    id: "eval",
    icon: TestTube2,
    title: "66 automated checks",
    copy: "46 backend pytest cases plus 12-city mock replay. Gate validates every snapshot before it reaches the UI.",
  },
  {
    id: "hours",
    icon: Clock,
    title: "Hours that explain themselves",
    copy: "Eight 3-hour slots with rain bars and tap-to-expand detail. Built for quick viva demos, not map clutter.",
  },
] as const;

export function PitchLanding() {
  return (
    <div className="pitch-landing">
      <div className="pitch-aurora" aria-hidden="true">
        <span className="pitch-aurora-blob pitch-aurora-a" />
        <span className="pitch-aurora-blob pitch-aurora-b" />
        <span className="pitch-aurora-grid" />
      </div>

      <header className="pitch-hero">
        <p className="pitch-eyebrow">Team A15 · MJCET Mini Project</p>
        <h1 className="pitch-headline">
          Weather you can <span className="pitch-headline-accent">verify</span>.
        </h1>
        <p className="pitch-subcopy">
          Weathero is an ambient OLED dashboard with a versioned weather envelope,
          rule-based advisories, and deterministic eval — Tier 0 scope, no maps,
          no LLM.
        </p>
      </header>

      <section className="pitch-bento" aria-label="Key features">
        <ul className="pitch-bento-grid">
          {FEATURES.map(({ id, icon: Icon, title, copy }) => (
            <li key={id}>
              <article className="pitch-bento-card">
                <Icon size={24} aria-hidden className="pitch-bento-icon" />
                <h2 className="pitch-bento-title">{title}</h2>
                <p className="pitch-bento-copy">{copy}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <aside className="pitch-social-proof" role="status">
        <span className="pitch-proof-badge">66 automated checks</span>
        <span className="pitch-proof-detail">
          56 pytest + 12 replay cities · contracts v1.3.0
        </span>
      </aside>

      <footer className="pitch-cta-bar">
        <button
          type="button"
          className="pitch-cta"
          onClick={() => launchApp("Hyderabad")}
        >
          Launch Weathero
        </button>
        <p className="pitch-cta-hint">
          Opens the live dashboard at Hyderabad. Use{" "}
          <code>?view=app</code> to skip this pitch anytime.
        </p>
      </footer>
    </div>
  );
}
