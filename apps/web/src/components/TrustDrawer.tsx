import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  FileCheck,
  Lock,
  Radio,
  ShieldCheck,
  X,
} from "lucide-react";
import type { WeatherEnvelope } from "../types/weather";
import {
  useBodyScrollLock,
  useDrawerKeyboard,
  useFocusTrap,
} from "../hooks/useFocusTrap";
import {
  getNextTrustTab,
  type TrustDrawerTab,
} from "../hooks/useDrawerState";

interface TrustDrawerProps {
  envelope: WeatherEnvelope;
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const TABS: { id: TrustDrawerTab; label: string; icon: typeof Radio }[] = [
  { id: "provenance", label: "Provenance", icon: Radio },
  { id: "eval", label: "Eval", icon: FileCheck },
  { id: "security", label: "Security", icon: Lock },
];

function formatCachedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function ProvenancePanel({ envelope }: { envelope: WeatherEnvelope }) {
  const { presentation, meta } = envelope;
  return (
    <div className="trust-panel-body">
      <dl className="trust-dl">
        <div>
          <dt>Provenance label</dt>
          <dd>{presentation.provenance_label}</dd>
        </div>
        <div>
          <dt>Tone</dt>
          <dd>{presentation.provenance_tone}</dd>
        </div>
        <div>
          <dt>Source badge</dt>
          <dd>{presentation.source_badge}</dd>
        </div>
        <div>
          <dt>Provider</dt>
          <dd>{meta.provider}</dd>
        </div>
        <div>
          <dt>Data source</dt>
          <dd>{meta.data_source}</dd>
        </div>
        <div>
          <dt>Cached at</dt>
          <dd>{formatCachedAt(meta.cached_at)}</dd>
        </div>
        <div>
          <dt>Stale fallback</dt>
          <dd>{meta.stale_fallback ? "Yes" : "No"}</dd>
        </div>
      </dl>
      <p className="trust-static-copy">
        Weathero uses a hybrid provider chain: OpenWeatherMap first, then
        Open-Meteo when OWM fails. The 45-minute Postgres cache stores{" "}
        <code>snapshot</code> only; provenance labels are computed at response
        time so live vs cache stays honest.
      </p>
    </div>
  );
}

function EvalPanel() {
  return (
    <div className="trust-panel-body">
      <p className="trust-lead">
        <strong>66 automated checks</strong> before viva demo:
      </p>
      <ul className="trust-list">
        <li>
          <strong>56 pytest</strong> — API contracts, gate shape, security
          bounds
        </li>
        <li>
          <strong>12 replay cities</strong> — mock envelope replay against gate
        </li>
        <li>
          <strong>vitest</strong> — frontend URL helpers, envelope fetch, UI
          utilities
        </li>
      </ul>
      <p className="trust-static-copy">
        The eval gate validates <code>snapshot</code> only.{" "}
        <code>presentation</code> (ambient theme, advisories, today brief,
        provenance) is rule-generated at response time — no LLM in the pipeline.
      </p>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="trust-panel-body">
      <p className="trust-lead">
        Production-<strong>style</strong> semester controls — not bank-grade.
      </p>
      <ul className="trust-list">
        <li>
          <strong>503</strong> when weather provider key missing — generic
          message, no secret echo
        </li>
        <li>
          Input bounds — city max 100 chars; session_id max 64, regex validated
          → 422
        </li>
        <li>
          Security headers — nosniff, DENY frame, referrer policy, permissions
        </li>
        <li>CORS tightened — GET, POST, DELETE; Content-Type header only</li>
        <li>Health endpoint rate limit — 30 requests/minute (slowapi)</li>
        <li>
          Production docs disabled — <code>ENV=production</code> hides Swagger
        </li>
      </ul>
      <p className="trust-static-copy trust-honest-limits">
        Honest limits: no authentication (session_id is client-supplied), no WAF,
        application-level rate limits only. Suitable for MJCET demo deployment,
        not PCI/SOC2.
      </p>
    </div>
  );
}

export function TrustDrawer({
  envelope,
  open,
  onClose,
  triggerRef,
}: TrustDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TrustDrawerTab>("provenance");

  const handleEscape = useCallback(() => {
    onClose();
  }, [onClose]);

  const onTabArrow = useCallback((direction: "next" | "prev") => {
    setTab((current) => getNextTrustTab(current, direction));
  }, []);

  useFocusTrap(panelRef, open, handleEscape, triggerRef);
  useBodyScrollLock(open);
  useDrawerKeyboard(open, onTabArrow);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`trust-tab-${tab}`)?.focus();
  }, [tab, open]);

  if (!open) return null;

  return (
    <div className="trust-drawer-root">
      <button
        type="button"
        className="trust-drawer-scrim"
        aria-label="Close trust panel"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="trust-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="trust-drawer-header">
          <h2 id={titleId} className="trust-drawer-title">
            <ShieldCheck size={22} aria-hidden />
            Trust &amp; provenance
          </h2>
          <button
            type="button"
            className="trust-drawer-close"
            onClick={onClose}
            aria-label="Close trust drawer"
          >
            <X size={20} aria-hidden />
          </button>
        </header>

        <div
          className="trust-tablist"
          role="tablist"
          aria-label="Trust information sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`trust-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`trust-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className={`trust-tab${tab === id ? " trust-tab-active" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon size={18} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="trust-panels">
          <div
            role="tabpanel"
            id="trust-panel-provenance"
            aria-labelledby="trust-tab-provenance"
            hidden={tab !== "provenance"}
            tabIndex={0}
            className="trust-panel"
          >
            {tab === "provenance" ? <ProvenancePanel envelope={envelope} /> : null}
          </div>
          <div
            role="tabpanel"
            id="trust-panel-eval"
            aria-labelledby="trust-tab-eval"
            hidden={tab !== "eval"}
            tabIndex={0}
            className="trust-panel"
          >
            {tab === "eval" ? <EvalPanel /> : null}
          </div>
          <div
            role="tabpanel"
            id="trust-panel-security"
            aria-labelledby="trust-tab-security"
            hidden={tab !== "security"}
            tabIndex={0}
            className="trust-panel"
          >
            {tab === "security" ? <SecurityPanel /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrustDrawerTriggerProps {
  onOpen: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function TrustDrawerTrigger({
  onOpen,
  triggerRef,
}: TrustDrawerTriggerProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      className="trust-drawer-trigger"
      onClick={onOpen}
      aria-haspopup="dialog"
    >
      <ShieldCheck size={16} aria-hidden />
      Trust
    </button>
  );
}
