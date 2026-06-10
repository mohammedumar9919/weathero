export type TempUnit = "celsius" | "fahrenheit";

export const UNITS_STORAGE_KEY = "weathero-units-v1";

export function celsiusToDisplay(valueC: number, unit: TempUnit): number {
  if (unit === "fahrenheit") {
    return (valueC * 9) / 5 + 32;
  }
  return valueC;
}

export function formatTemp(valueC: number, unit: TempUnit): string {
  return `${Math.round(celsiusToDisplay(valueC, unit))}°`;
}

export function unitSymbol(unit: TempUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

export function parseUnitsParam(value: string | null): TempUnit {
  if (value === "imperial" || value === "fahrenheit" || value === "f") {
    return "fahrenheit";
  }
  return "celsius";
}

export function unitsQueryParam(unit: TempUnit): string {
  return unit === "fahrenheit" ? "imperial" : "metric";
}
