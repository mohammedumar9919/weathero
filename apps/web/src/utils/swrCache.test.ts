import { describe, it, expect } from "vitest";
import { isWeatherKeyCached } from "./swrCache";
import type { WeatherEnvelope } from "../types/weather";

const envelope = {
  snapshot: { city: "Test" },
} as WeatherEnvelope;

describe("isWeatherKeyCached", () => {
  it("returns true when cache entry has snapshot data", () => {
    const cache = new Map<string, unknown>([
      ["/api/v1/weather?city=Test&units=metric", { data: envelope }],
    ]);
    expect(isWeatherKeyCached(cache, "/api/v1/weather?city=Test&units=metric")).toBe(
      true,
    );
  });

  it("returns false for missing or empty cache entries", () => {
    const cache = new Map<string, unknown>();
    expect(isWeatherKeyCached(cache, "/missing")).toBe(false);
    cache.set("/empty", {});
    expect(isWeatherKeyCached(cache, "/empty")).toBe(false);
  });
});
