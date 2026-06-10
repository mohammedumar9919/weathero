import { useSWRConfig } from "swr";
import type { ReactNode } from "react";
import { weatherKey } from "../hooks/useWeatherBundle";
import { useUnits } from "../hooks/useUnits";
import { isWeatherKeyCached } from "../utils/swrCache";

interface ComparePreflightProps {
  currentCity: string;
  compareCity: string | null;
  onCompareCityChange: (city: string | null) => void;
  compareOptions: string[];
  children: ReactNode;
}

export function ComparePreflight({
  currentCity,
  compareCity,
  onCompareCityChange,
  compareOptions,
  children,
}: ComparePreflightProps) {
  const { unit } = useUnits();
  const { cache } = useSWRConfig();

  const currentKey = currentCity ? weatherKey(currentCity, unit) : "";
  const compareKey = compareCity ? weatherKey(compareCity, unit) : "";

  const currentCached = currentKey
    ? isWeatherKeyCached(cache as Map<string, unknown>, currentKey)
    : false;
  const compareCached = compareKey
    ? isWeatherKeyCached(cache as Map<string, unknown>, compareKey)
    : false;

  const ready = Boolean(
    compareCity &&
      compareCity.toLowerCase() !== currentCity.toLowerCase() &&
      currentCached &&
      compareCached,
  );

  const options = compareOptions.filter(
    (city) => city.toLowerCase() !== currentCity.toLowerCase(),
  );

  return (
    <section className="compare-section" aria-label="City comparison">
      <div className="compare-preflight">
        <h2 className="compare-heading">Compare (cache only)</h2>
        <label className="compare-select-label" htmlFor="compare-city-select">
          Second city
        </label>
        <select
          id="compare-city-select"
          className="compare-select"
          value={compareCity ?? ""}
          onChange={(event) =>
            onCompareCityChange(event.target.value || null)
          }
        >
          <option value="">Select a saved city…</option>
          {options.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {!compareCity ? (
          <p className="compare-hint" role="status">
            Choose a second city. Compare uses cached data only — no extra live
            API calls.
          </p>
        ) : !currentCached || !compareCached ? (
          <p className="compare-hint compare-hint-warn" role="status">
            Waiting for both cities in cache. Hover saved cards to prefetch, or
            visit each city once.
          </p>
        ) : null}
      </div>
      {ready ? children : null}
    </section>
  );
}
