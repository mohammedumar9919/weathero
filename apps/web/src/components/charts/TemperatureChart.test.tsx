import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import TemperatureChart from "./TemperatureChart";
import type { HoursStripSlot } from "../../types/weather";

// Recharts' ResponsiveContainer observes size; jsdom lacks ResizeObserver.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

const slots: HoursStripSlot[] = Array.from({ length: 8 }, (_, i) => ({
  offset_hours: i * 3,
  temp_c: 20 + i,
  rain_prob: i * 0.05,
  condition_code: 800,
  condition_family: "clear",
}));

describe("TemperatureChart", () => {
  it("renders a figure with one accessible data point per hours_strip slot", () => {
    const { container } = render(
      <TemperatureChart
        slots={slots}
        fetchedAt="2026-06-08T12:00:00Z"
        unit="celsius"
      />,
    );

    const figure = container.querySelector("figure.temp-chart");
    expect(figure).not.toBeNull();
    expect(figure?.getAttribute("aria-label")).toMatch(/temperature trend/i);

    const points = container.querySelectorAll(".temp-chart-data li");
    expect(points).toHaveLength(8);
    expect(points[0]?.getAttribute("data-offset")).toBe("0");
    expect(points[7]?.getAttribute("data-offset")).toBe("21");
  });

  it("renders an empty state when there are no slots", () => {
    const { container } = render(
      <TemperatureChart slots={[]} fetchedAt="2026-06-08T12:00:00Z" />,
    );
    expect(container.querySelector(".temp-chart-empty")).not.toBeNull();
  });
});
