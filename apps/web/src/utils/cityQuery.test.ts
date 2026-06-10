import { describe, it, expect } from "vitest";
import { normalizeCityQuery } from "./cityQuery";

describe("normalizeCityQuery", () => {
  it("trims and collapses internal whitespace", () => {
    expect(normalizeCityQuery("  new   york  ")).toBe("new york");
    expect(normalizeCityQuery("London")).toBe("London");
  });
});
