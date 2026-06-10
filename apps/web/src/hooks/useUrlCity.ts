import { useCallback, useEffect, useState } from "react";

export const DEFAULT_CITY = "London";

export function getCityFromUrl(search = window.location.search): string {
  const params = new URLSearchParams(search);
  const raw = params.get("city") ?? "";
  return raw.trim().replace(/\s+/g, " ");
}

export function setCityInUrl(city: string): void {
  const url = new URL(window.location.href);
  if (city) {
    url.searchParams.set("city", city);
  } else {
    url.searchParams.delete("city");
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

export function useUrlCity() {
  const [city, setCityState] = useState<string>(() => {
    const fromUrl = getCityFromUrl();
    return fromUrl || DEFAULT_CITY;
  });

  const setCity = useCallback((next: string) => {
    const trimmed = next.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    setCityState(trimmed);
    setCityInUrl(trimmed);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const fromUrl = getCityFromUrl();
      if (fromUrl) setCityState(fromUrl);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return { city, setCity };
}
