import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getViewFromUrl,
  setViewInUrl,
  launchApp,
} from "./useViewMode";

describe("useViewMode URL helpers", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("parses view from query string", () => {
    expect(getViewFromUrl("?view=pitch")).toBe("pitch");
    expect(getViewFromUrl("?view=app")).toBe("app");
    expect(getViewFromUrl("?city=London")).toBe("app");
  });

  it("sets pitch view via replaceState", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    setViewInUrl("pitch");
    expect(replaceState).toHaveBeenCalledOnce();
    const urlArg = replaceState.mock.calls[0]?.[2] as string;
    expect(urlArg).toContain("view=pitch");
  });

  it("launchApp sets city and removes view", () => {
    window.history.replaceState({}, "", "/?view=pitch");
    const pushState = vi.spyOn(window.history, "pushState");
    launchApp("Hyderabad");
    expect(pushState).toHaveBeenCalledOnce();
    const urlArg = pushState.mock.calls[0]?.[2] as string;
    expect(urlArg).toContain("city=Hyderabad");
    expect(urlArg).toContain("view=app");
  });
});
