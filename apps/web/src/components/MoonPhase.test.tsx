import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MoonPhase, illuminationFraction } from "./MoonPhase";

describe("illuminationFraction", () => {
  it("maps synodic age to illumination (new=0, full=1, quarter=0.5)", () => {
    expect(illuminationFraction(0)).toBe(0);
    expect(illuminationFraction(0.5)).toBeCloseTo(1, 6);
    expect(illuminationFraction(0.25)).toBeCloseTo(0.5, 6);
    expect(illuminationFraction(0.75)).toBeCloseTo(0.5, 6);
  });
});

describe("MoonPhase", () => {
  // Fixed date → deterministic, offline lunar math (no network).
  const fixed = new Date("2026-04-01T00:00:00Z");

  it("renders a deterministic phase snapshot for a fixed date", () => {
    const { container } = render(<MoonPhase date={fixed} />);
    const figure = container.querySelector("figure.moon-phase");
    expect(figure).not.toBeNull();

    const label = figure?.getAttribute("aria-label");
    const name = container.querySelector(".moon-phase-name")?.textContent;
    const meta = container.querySelector(".moon-phase-meta")?.textContent;
    expect({ label, name, meta }).toMatchSnapshot();
  });

  it("exposes a non-empty phase name and a 0-100 illumination figure", () => {
    const { container } = render(<MoonPhase date={fixed} />);
    const name = container.querySelector(".moon-phase-name")?.textContent ?? "";
    const meta = container.querySelector(".moon-phase-meta")?.textContent ?? "";
    expect(name.length).toBeGreaterThan(0);
    const pct = Number(meta.match(/(\d+)%/)?.[1]);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});
