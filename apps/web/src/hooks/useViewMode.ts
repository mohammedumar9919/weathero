import { useCallback, useEffect, useState } from "react";

export type ViewMode = "pitch" | "app";

/**
 * Sidebar panel substate (contract v1.4.0). `view` stays pitch|app; `panel`
 * is the in-app navigation slot. Integration injects W3 ChatPanel into the
 * "assistant" slot — W2 has no compile dependency on it.
 */
export type PanelId =
  | "dashboard"
  | "charts"
  | "moon"
  | "air"
  | "compare"
  | "assistant";

export const PANEL_IDS: readonly PanelId[] = [
  "dashboard",
  "charts",
  "moon",
  "air",
  "compare",
  "assistant",
] as const;

export const DEFAULT_VIEW: ViewMode = "app";
export const DEFAULT_PANEL: PanelId = "dashboard";

export function getViewFromUrl(search = window.location.search): ViewMode {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  if (view === "pitch") return "pitch";
  return "app";
}

export function setViewInUrl(view: ViewMode): void {
  const url = new URL(window.location.href);
  if (view === "app") {
    url.searchParams.delete("view");
  } else {
    url.searchParams.set("view", view);
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

function isPanelId(value: string | null): value is PanelId {
  return value !== null && (PANEL_IDS as readonly string[]).includes(value);
}

export function getPanelFromUrl(search = window.location.search): PanelId {
  const params = new URLSearchParams(search);
  const panel = params.get("panel");
  return isPanelId(panel) ? panel : DEFAULT_PANEL;
}

export function setPanelInUrl(panel: PanelId): void {
  const url = new URL(window.location.href);
  if (panel === DEFAULT_PANEL) {
    url.searchParams.delete("panel");
  } else {
    url.searchParams.set("panel", panel);
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

export function launchApp(city = "Hyderabad"): void {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "app");
  url.searchParams.set("city", city);
  window.history.pushState(window.history.state, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useViewMode() {
  const [view, setViewState] = useState<ViewMode>(() => getViewFromUrl());
  const [panel, setPanelState] = useState<PanelId>(() => getPanelFromUrl());

  const setView = useCallback((next: ViewMode) => {
    setViewState(next);
    setViewInUrl(next);
  }, []);

  const setPanel = useCallback((next: PanelId) => {
    setPanelState(next);
    setPanelInUrl(next);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setViewState(getViewFromUrl());
      setPanelState(getPanelFromUrl());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return { view, setView, panel, setPanel, launchApp };
}
