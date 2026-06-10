import { describe, it, expect } from "vitest";
import {
  celsiusToDisplay,
  formatTemp,
  parseUnitsParam,
  unitsQueryParam,
} from "./temperature";

describe("temperature utils", () => {
  it("converts celsius to fahrenheit for display", () => {
    expect(celsiusToDisplay(0, "fahrenheit")).toBe(32);
    expect(celsiusToDisplay(100, "celsius")).toBe(100);
  });

  it("formats temps with degree symbol", () => {
    expect(formatTemp(20, "celsius")).toBe("20°");
    expect(formatTemp(20, "fahrenheit")).toBe("68°");
  });

  it("maps units to query params", () => {
    expect(unitsQueryParam("celsius")).toBe("metric");
    expect(unitsQueryParam("fahrenheit")).toBe("imperial");
    expect(parseUnitsParam("imperial")).toBe("fahrenheit");
    expect(parseUnitsParam("metric")).toBe("celsius");
  });
});
