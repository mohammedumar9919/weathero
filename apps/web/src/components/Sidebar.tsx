import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
} from "react";
import type { PanelId } from "../hooks/useViewMode";
import "../styles/wow.css";

export interface SidebarProps {
  panels: { id: PanelId; label: string; icon: ReactNode }[];
  activePanel: PanelId;
  onPanelChange: (id: PanelId) => void;
  /** Integration injects W3 ChatPanel into slots.assistant; others optional. */
  slots: Partial<Record<PanelId, ReactNode>>;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

/** Built-in placeholder body used when the integration hasn't injected a slot. */
function PanelPlaceholder({ label }: { label: string }) {
  return (
    <div className="sidebar-panel-placeholder" role="note">
      <p className="sidebar-panel-placeholder-title">{label}</p>
      <p className="sidebar-panel-placeholder-copy">
        This panel mounts here once wired in. Nothing to configure — it stays
        fully offline.
      </p>
    </div>
  );
}

export function Sidebar({
  panels,
  activePanel,
  onPanelChange,
  slots,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const railRefs = useRef<Partial<Record<PanelId, HTMLButtonElement | null>>>({});
  const moveFocusIntoPanel = useRef(false);

  const baseId = useId();
  const panelDomId = `${baseId}-panel`;

  const open = useCallback((focusPanel: boolean) => {
    if (focusPanel) moveFocusIntoPanel.current = true;
    setExpanded(true);
  }, []);

  const close = useCallback(
    (returnFocus: boolean) => {
      if (returnFocus) {
        railRefs.current[activePanel]?.focus();
      }
      moveFocusIntoPanel.current = false;
      setExpanded(false);
    },
    [activePanel],
  );

  // When a panel is opened via click/keyboard activation, move focus into it.
  useEffect(() => {
    if (!expanded || !moveFocusIntoPanel.current) return;
    const target =
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
    target?.focus();
    moveFocusIntoPanel.current = false;
  }, [expanded, activePanel]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape" && expanded) {
        event.preventDefault();
        close(true);
      }
    },
    [expanded, close],
  );

  // Collapse when focus leaves the whole sidebar (keyboard tab-away).
  const handleBlur = useCallback((event: ReactFocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    moveFocusIntoPanel.current = false;
    setExpanded(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const active = typeof document !== "undefined" ? document.activeElement : null;
    if (active && rootRef.current?.contains(active)) return;
    setExpanded(false);
  }, []);

  const selectPanel = useCallback(
    (id: PanelId) => {
      onPanelChange(id);
      open(true);
    },
    [onPanelChange, open],
  );

  const activeMeta = panels.find((p) => p.id === activePanel);
  const activeLabel = activeMeta?.label ?? activePanel;
  const body = slots[activePanel] ?? <PanelPlaceholder label={activeLabel} />;

  return (
    <div
      ref={rootRef}
      className="sidebar"
      data-expanded={expanded ? "true" : "false"}
      data-motion={reducedMotion ? "reduced" : "full"}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseEnter={() => open(false)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => open(false)}
    >
      <nav className="sidebar-rail" aria-label="Weathero panels">
        <ul className="sidebar-rail-list">
          {panels.map(({ id, label, icon }) => {
            const isActive = id === activePanel;
            return (
              <li key={id}>
                <button
                  type="button"
                  ref={(el) => {
                    railRefs.current[id] = el;
                  }}
                  className={`sidebar-rail-button${
                    isActive ? " sidebar-rail-button-active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-expanded={expanded}
                  aria-controls={panelDomId}
                  onClick={() => selectPanel(id)}
                >
                  <span className="sidebar-rail-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="sidebar-rail-label">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {expanded ? (
        <section
          ref={panelRef}
          id={panelDomId}
          className="sidebar-panel"
          role="region"
          aria-label={`${activeLabel} panel`}
          tabIndex={-1}
        >
          <header className="sidebar-panel-header">
            <h2 className="sidebar-panel-title">{activeLabel}</h2>
            <button
              type="button"
              className="sidebar-panel-close"
              onClick={() => close(true)}
              aria-label="Close panel"
            >
              Esc
            </button>
          </header>
          <div className="sidebar-panel-body">{body}</div>
        </section>
      ) : null}
    </div>
  );
}
