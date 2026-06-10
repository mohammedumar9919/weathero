import { describe, it, expect } from "vitest";
import {
  formatHumidity,
  formatWindSpeed,
  formatRainProb,
  aqiChipLabel,
  aqiTone,
} from "./metricsFormat";

describe("metricsFormat", () => {
  it("formats humidity and wind", () => {
    expect(formatHumidity(65.4)).toBe("65%");
    expect(formatWindSpeed(3.5)).toBe("3.5 m/s");
  });

  it("formats rain probability as percent", () => {
    expect(formatRainProb(0.1)).toBe("10%");
    expect(formatRainProb(0)).toBe("0%");
  });

  it("builds AQI chip label and tone", () => {
    expect(aqiChipLabel({ aqi: 2, category: "Fair", pm2_5: 12.3 })).toBe(
      "AQI 2 · Fair",
    );
    expect(aqiTone(1)).toBe("good");
    expect(aqiTone(5)).toBe("very-poor");
  });
});
