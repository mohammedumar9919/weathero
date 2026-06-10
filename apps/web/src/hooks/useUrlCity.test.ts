import { describe, it, expect, vi } from "vitest";
import { getCityFromUrl, setCityInUrl } from "./useUrlCity";

describe("useUrlCity URL helpers", () => {
  it("parses city from ?city= query param", () => {
    expect(getCityFromUrl("?city=Hyderabad")).toBe("Hyderabad");
    expect(getCityFromUrl("?foo=bar")).toBe("");
  });

  it("syncs city to URL via history.replaceState", () => {
    window.history.replaceState({}, "", "/");
    const replaceState = vi.spyOn(window.history, "replaceState");

    setCityInUrl("Hyderabad");

    expect(replaceState).toHaveBeenCalledOnce();
    const urlArg = replaceState.mock.calls[0]?.[2] as string;
    expect(urlArg).toContain("city=Hyderabad");
  });
});
