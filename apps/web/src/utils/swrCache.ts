import type { WeatherEnvelope } from "../types/weather";

type SwrCacheEntry = {
  data?: WeatherEnvelope;
  error?: unknown;
  isValidating?: boolean;
};

export function isWeatherKeyCached(
  cache: Map<string, unknown>,
  key: string,
): boolean {
  const entry = cache.get(key) as SwrCacheEntry | undefined;
  return Boolean(entry?.data?.snapshot);
}
