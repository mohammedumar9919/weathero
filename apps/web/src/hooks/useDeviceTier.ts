import { useMemo } from "react";

export type DeviceTier = "high" | "low";

interface DeviceCapabilities {
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

/**
 * Pure GPU/memory heuristic. Weak laptops (≤4 GB RAM or ≤4 logical cores) get
 * the "low" tier; the ambient engine halves particle count + frame target for
 * them. Unknown capabilities default to "high" so capable devices aren't
 * penalised. Exported separately so it's trivially unit-testable.
 */
export function getDeviceTier(caps: DeviceCapabilities = {}): DeviceTier {
  const memory = caps.deviceMemory;
  const cores = caps.hardwareConcurrency;
  const weakMemory = typeof memory === "number" && memory <= 4;
  const weakCpu = typeof cores === "number" && cores <= 4;
  return weakMemory || weakCpu ? "low" : "high";
}

export interface TierProfile {
  /** Multiplier applied to a theme's worst-case particle count. */
  particleScale: number;
  /** Target frames per second for the rAF loop. */
  fpsCap: number;
}

export function tierProfile(tier: DeviceTier): TierProfile {
  return tier === "low"
    ? { particleScale: 0.5, fpsCap: 30 }
    : { particleScale: 1, fpsCap: 60 };
}

function readNavigatorCaps(): DeviceCapabilities {
  if (typeof navigator === "undefined") return {};
  const nav = navigator as Navigator & DeviceCapabilities;
  return {
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}

export function useDeviceTier(): DeviceTier {
  return useMemo(() => getDeviceTier(readNavigatorCaps()), []);
}
