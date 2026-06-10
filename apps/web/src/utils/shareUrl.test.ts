import { describe, it, expect } from "vitest";
import { buildShareWeatherUrl } from "./shareUrl";

describe("buildShareWeatherUrl", () => {
  it("builds view=app and city params", () => {
    expect(
      buildShareWeatherUrl("Hyderabad", "", "http://localhost:5173", "/"),
    ).toBe("http://localhost:5173/?view=app&city=Hyderabad");
  });

  it("preserves units from current URL when present", () => {
    expect(
      buildShareWeatherUrl(
        "Chennai",
        "?units=imperial",
        "http://localhost:5173",
        "/",
      ),
    ).toBe("http://localhost:5173/?view=app&city=Chennai&units=imperial");
  });

  it("normalizes city whitespace", () => {
    expect(
      buildShareWeatherUrl("New  York", "", "http://localhost:5173", "/"),
    ).toBe("http://localhost:5173/?view=app&city=New+York");
  });
});
