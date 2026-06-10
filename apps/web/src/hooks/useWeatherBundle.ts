import useSWR from "swr";
import type { WeatherEnvelope } from "../types/weather";
import { normalizeCityQuery } from "../utils/cityQuery";
import type { TempUnit } from "../utils/temperature";
import { unitsQueryParam } from "../utils/temperature";

export async function fetchWeatherEnvelope(
  url: string,
): Promise<WeatherEnvelope> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.status}`);
  }
  return res.json() as Promise<WeatherEnvelope>;
}

export function weatherKey(city: string, unit: TempUnit = "celsius"): string {
  const normalized = normalizeCityQuery(city);
  const units = unitsQueryParam(unit);
  return `/api/v1/weather?city=${encodeURIComponent(normalized)}&units=${units}`;
}

export function useWeatherBundle(city: string, unit: TempUnit = "celsius") {
  const normalized = normalizeCityQuery(city);
  const key = normalized ? weatherKey(normalized, unit) : null;

  return useSWR<WeatherEnvelope>(key, fetchWeatherEnvelope, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true,
  });
}
