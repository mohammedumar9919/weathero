import type { HoursStripSlot } from "../types/weather";

export function formatCondition(family: string): string {
  return family.charAt(0).toUpperCase() + family.slice(1);
}

export function formatHourLabel(
  fetchedAt: string,
  offsetHours: number,
): string {
  const base = new Date(fetchedAt);
  base.setHours(base.getHours() + offsetHours);
  return base.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function buildSlotAriaLabel(
  slot: HoursStripSlot,
  fetchedAt: string,
): string {
  const time = formatHourLabel(fetchedAt, slot.offset_hours);
  const temp = Math.round(slot.temp_c);
  const rainPct = Math.round(slot.rain_prob * 100);
  return `${time}, ${temp} degrees, ${rainPct}% rain`;
}

export function rainBarHeight(rainProb: number): number {
  const clamped = Math.max(0, Math.min(1, rainProb));
  return Math.round(12 + clamped * 48);
}
