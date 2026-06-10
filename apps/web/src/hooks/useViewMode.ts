import { useCallback, useEffect, useState } from "react";

export type ViewMode = "pitch" | "app";

export const DEFAULT_VIEW: ViewMode = "app";

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

export function launchApp(city = "Hyderabad"): void {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "app");
  url.searchParams.set("city", city);
  window.history.pushState(window.history.state, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useViewMode() {
  const [view, setViewState] = useState<ViewMode>(() => getViewFromUrl());

  const setView = useCallback((next: ViewMode) => {
    setViewState(next);
    setViewInUrl(next);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setViewState(getViewFromUrl());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return { view, setView, launchApp };
}
