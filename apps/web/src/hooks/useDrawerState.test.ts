import { describe, it, expect } from "vitest";
import { createDrawerState, getNextTrustTab } from "./useDrawerState";

describe("useDrawerState helpers", () => {
  it("cycles trust tabs with keyboard nav order", () => {
    expect(getNextTrustTab("provenance", "next")).toBe("eval");
    expect(getNextTrustTab("eval", "next")).toBe("security");
    expect(getNextTrustTab("security", "next")).toBe("provenance");
    expect(getNextTrustTab("provenance", "prev")).toBe("security");
  });

  it("opens and closes drawer state", () => {
    const drawer = createDrawerState(false);
    expect(drawer.isOpen).toBe(false);
    drawer.openDrawer();
    expect(drawer.isOpen).toBe(true);
    drawer.closeDrawer();
    expect(drawer.isOpen).toBe(false);
    drawer.toggleDrawer();
    expect(drawer.isOpen).toBe(true);
  });
});
