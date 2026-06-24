import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { getDeviceTier, tierProfile, useDeviceTier } from "./useDeviceTier";

describe("getDeviceTier heuristic", () => {
  it("returns low for weak memory or few cores", () => {
    expect(getDeviceTier({ deviceMemory: 4 })).toBe("low");
    expect(getDeviceTier({ hardwareConcurrency: 2 })).toBe("low");
    expect(getDeviceTier({ deviceMemory: 2, hardwareConcurrency: 8 })).toBe("low");
  });

  it("returns high for capable or unknown devices", () => {
    expect(getDeviceTier({ deviceMemory: 8, hardwareConcurrency: 8 })).toBe("high");
    expect(getDeviceTier({})).toBe("high");
  });

  it("tierProfile halves particle scale + fps cap for low tier", () => {
    expect(tierProfile("low")).toEqual({ particleScale: 0.5, fpsCap: 30 });
    expect(tierProfile("high")).toEqual({ particleScale: 1, fpsCap: 60 });
  });
});

describe("useDeviceTier", () => {
  it("returns a valid tier", () => {
    const { result } = renderHook(() => useDeviceTier());
    expect(["high", "low"]).toContain(result.current);
  });
});
