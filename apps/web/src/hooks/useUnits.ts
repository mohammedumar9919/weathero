import { useCallback, useSyncExternalStore } from "react";
import {
  parseUnitsParam,
  UNITS_STORAGE_KEY,
  type TempUnit,
  unitsQueryParam,
} from "../utils/temperature";

function readUnit(): TempUnit {
  return parseUnitsParam(localStorage.getItem(UNITS_STORAGE_KEY));
}

function subscribe(onStoreChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === UNITS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("weathero-units-change", onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("weathero-units-change", onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useUnits() {
  const unit = useSyncExternalStore(subscribe, readUnit, () => "celsius" as TempUnit);

  const setUnit = useCallback((next: TempUnit) => {
    localStorage.setItem(UNITS_STORAGE_KEY, unitsQueryParam(next));
    window.dispatchEvent(new Event("weathero-units-change"));
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit(unit === "celsius" ? "fahrenheit" : "celsius");
  }, [setUnit, unit]);

  return { unit, setUnit, toggleUnit, unitsParam: unitsQueryParam(unit) };
}
