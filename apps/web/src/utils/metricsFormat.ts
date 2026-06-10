import type { AirQuality } from "../types/weather";
import type { TempUnit } from "./temperature";
import { formatTemp } from "./temperature";

export function formatHumidity(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatWindSpeed(mps: number): string {
  return `${mps.toFixed(1)} m/s`;
}

export function formatRainProb(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

export function formatFeelsLike(tempC: number, unit: TempUnit): string {
  return formatTemp(tempC, unit);
}

export function formatPm25(value: number): string {
  return `${value.toFixed(1)} μg/m³`;
}

export function aqiTone(aqi: number): string {
  if (aqi <= 2) return "good";
  if (aqi === 3) return "moderate";
  if (aqi === 4) return "poor";
  return "very-poor";
}

export function aqiChipLabel(airQuality: AirQuality): string {
  return `AQI ${airQuality.aqi} · ${airQuality.category}`;
}
