import { useCallback, useRef } from "react";
import { preload, useSWRConfig } from "swr";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react";
import type { ComponentType } from "react";
import type { WeatherEnvelope } from "../types/weather";
import { fetchWeatherEnvelope, weatherKey } from "../hooks/useWeatherBundle";
import { useSavedLocations } from "../hooks/useSavedLocations";
import { useUnits } from "../hooks/useUnits";
import { formatCondition } from "../utils/weatherFormat";
import { formatTemp } from "../utils/temperature";
import { isWeatherKeyCached } from "../utils/swrCache";

const CONDITION_ICONS: Record<
  string,
  ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>
> = {
  clear: Sun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
  atmosphere: CloudFog,
};

interface SavedCityCarouselProps {
  activeCity: string;
  onSelectCity: (city: string) => void;
}

function getCachedEnvelope(
  cache: Map<string, unknown>,
  city: string,
  unit: ReturnType<typeof useUnits>["unit"],
): WeatherEnvelope | undefined {
  const key = weatherKey(city, unit);
  const entry = cache.get(key) as { data?: WeatherEnvelope } | undefined;
  return entry?.data;
}

export function SavedCityCarousel({
  activeCity,
  onSelectCity,
}: SavedCityCarouselProps) {
  const { data: locations, isLoading } = useSavedLocations();
  const { unit } = useUnits();
  const { cache } = useSWRConfig();
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const schedulePrefetch = useCallback(
    (city: string) => {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = setTimeout(() => {
        const key = weatherKey(city, unit);
        if (!isWeatherKeyCached(cache as Map<string, unknown>, key)) {
          void preload(key, fetchWeatherEnvelope);
        }
      }, 200);
    },
    [cache, unit],
  );

  const cancelPrefetch = useCallback(() => {
    clearTimeout(prefetchTimer.current);
  }, []);

  if (isLoading) {
    return (
      <div className="saved-carousel saved-carousel-loading" aria-busy="true">
        <div className="skeleton skeleton-carousel-card" />
        <div className="skeleton skeleton-carousel-card" />
      </div>
    );
  }

  if (!locations?.length) {
    return (
      <p className="saved-carousel-empty">
        Save up to 3 cities via the API to see them here. Demo: POST{" "}
        <code>/api/v1/locations</code> for Hyderabad, Chennai, Mumbai.
      </p>
    );
  }

  return (
    <section className="saved-carousel" aria-label="Saved cities">
      <h2 className="saved-carousel-heading">Saved cities</h2>
      <ul className="saved-carousel-track">
        {locations.slice(0, 3).map((loc) => {
          const displayName = loc.city;
          const cached = getCachedEnvelope(
            cache as Map<string, unknown>,
            loc.city,
            unit,
          );
          const family = cached?.snapshot.current.condition_family ?? "cloud";
          const Icon = CONDITION_ICONS[family] ?? Cloud;
          const isActive =
            activeCity.toLowerCase() === loc.city.toLowerCase();
          const temp = cached
            ? formatTemp(cached.snapshot.current.temp_c, unit)
            : "—";

          return (
            <li key={loc.id}>
              <button
                type="button"
                className={`saved-carousel-card${isActive ? " saved-carousel-card-active" : ""}`}
                aria-label={`${displayName}, ${temp}, ${formatCondition(family)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelectCity(loc.city)}
                onMouseEnter={() => schedulePrefetch(loc.city)}
                onMouseLeave={cancelPrefetch}
                onFocus={() => schedulePrefetch(loc.city)}
                onBlur={cancelPrefetch}
              >
                <Icon size={20} aria-hidden className="saved-carousel-icon" />
                <span className="saved-carousel-name">{displayName}</span>
                <span className="saved-carousel-temp">{temp}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
