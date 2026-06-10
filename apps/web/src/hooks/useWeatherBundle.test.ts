import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWeatherEnvelope, weatherKey } from "./useWeatherBundle";
import type { WeatherEnvelope } from "../types/weather";

const mockEnvelope: WeatherEnvelope = {
  snapshot: {
    city: "Hyderabad",
    country: "IN",
    lat: 17.385,
    lon: 78.4867,
    fetched_at: "2026-06-08T12:00:00Z",
    current: {
      temp_c: 32,
      feels_like_c: 35,
      humidity_pct: 65,
      wind_speed_mps: 3.5,
      condition_code: 800,
      condition_family: "clear",
      rain_prob: 0.1,
    },
    hours_strip: Array.from({ length: 8 }, (_, i) => ({
      offset_hours: i * 3,
      temp_c: 30 + i,
      rain_prob: i * 0.05,
      condition_code: 800,
      condition_family: "clear",
    })),
  },
  presentation: {
    ambient_theme: "clear",
    temp_band: "hot",
    source_badge: "OpenWeather",
    advisories: [],
    provenance_label: "Live · just now",
    provenance_pulse: true,
    provenance_tone: "live",
    today_brief: "Hot and clear — stay hydrated if outdoors.",
  },
  meta: {
    data_source: "live",
    provider: "openweather",
    cached_at: "2026-06-08T12:00:00Z",
    stale_fallback: false,
  },
};

describe("useWeatherBundle envelope", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("builds weather API key with encoded city and units", () => {
    expect(weatherKey("New York")).toBe(
      "/api/v1/weather?city=New%20York&units=metric",
    );
    expect(weatherKey("New York", "fahrenheit")).toBe(
      "/api/v1/weather?city=New%20York&units=imperial",
    );
  });

  it("fetchWeatherEnvelope returns v1.3.0 envelope shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEnvelope),
      }),
    );

    const result = await fetchWeatherEnvelope("/api/v1/weather?city=Hyderabad");

    expect(result.snapshot.city).toBe("Hyderabad");
    expect(result.presentation.ambient_theme).toBe("clear");
    expect(result.meta.data_source).toBe("live");
    expect(result.snapshot.hours_strip).toHaveLength(8);
    expect(result.presentation.today_brief).toBeTruthy();
  });

  it("fetchWeatherEnvelope throws on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );

    await expect(
      fetchWeatherEnvelope("/api/v1/weather?city=Bad"),
    ).rejects.toThrow("Failed to fetch weather: 502");
  });
});
