import { useSWRConfig } from "swr";
import { Droplets, Thermometer } from "lucide-react";
import type { WeatherEnvelope } from "../types/weather";
import { weatherKey } from "../hooks/useWeatherBundle";
import { useUnits } from "../hooks/useUnits";
import { formatTemp } from "../utils/temperature";

interface CompareBarsProps {
  currentCity: string;
  compareCity: string;
}

function readEnvelope(
  cache: Map<string, unknown>,
  city: string,
  unit: ReturnType<typeof useUnits>["unit"],
): WeatherEnvelope | undefined {
  const entry = cache.get(weatherKey(city, unit)) as
    | { data?: WeatherEnvelope }
    | undefined;
  return entry?.data;
}

function barWidth(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(8, Math.round((value / max) * 100));
}

export function CompareBars({ currentCity, compareCity }: CompareBarsProps) {
  const { unit } = useUnits();
  const { cache } = useSWRConfig();

  const left = readEnvelope(cache as Map<string, unknown>, currentCity, unit);
  const right = readEnvelope(cache as Map<string, unknown>, compareCity, unit);

  if (!left || !right) return null;

  const leftTemp = left.snapshot.current.temp_c;
  const rightTemp = right.snapshot.current.temp_c;
  const leftRain = left.snapshot.current.rain_prob;
  const rightRain = right.snapshot.current.rain_prob;
  const maxTemp = Math.max(leftTemp, rightTemp, 1);
  const maxRain = Math.max(leftRain, rightRain, 0.01);

  return (
    <div className="compare-bars glass-card" role="group" aria-label="Temperature and rain comparison">
      <div className="compare-bars-row">
        <span className="compare-bars-city">{left.snapshot.city}</span>
        <span className="compare-bars-metric">
          <Thermometer size={16} aria-hidden /> Temp
        </span>
        <span className="compare-bars-city">{right.snapshot.city}</span>
      </div>
      <div className="compare-bars-pair">
        <div
          className="compare-bar compare-bar-left"
          style={{ width: `${barWidth(leftTemp, maxTemp)}%` }}
          aria-hidden
        />
        <div
          className="compare-bar compare-bar-right"
          style={{ width: `${barWidth(rightTemp, maxTemp)}%` }}
          aria-hidden
        />
      </div>
      <div className="compare-bars-values">
        <span>{formatTemp(leftTemp, unit)}</span>
        <span>{formatTemp(rightTemp, unit)}</span>
      </div>

      <div className="compare-bars-row compare-bars-row-rain">
        <span className="compare-bars-metric">
          <Droplets size={16} aria-hidden /> Rain %
        </span>
      </div>
      <div className="compare-bars-pair">
        <div
          className="compare-bar compare-bar-rain compare-bar-left"
          style={{ width: `${barWidth(leftRain, maxRain)}%` }}
          aria-hidden
        />
        <div
          className="compare-bar compare-bar-rain compare-bar-right"
          style={{ width: `${barWidth(rightRain, maxRain)}%` }}
          aria-hidden
        />
      </div>
      <div className="compare-bars-values">
        <span>{Math.round(leftRain * 100)}%</span>
        <span>{Math.round(rightRain * 100)}%</span>
      </div>
    </div>
  );
}
