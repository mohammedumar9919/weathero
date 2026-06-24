import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { AmbientBackground } from "./AmbientBackground";

function stubMatchMedia(matcher: (query: string) => boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: matcher(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AmbientBackground", () => {
  it("renders a static gradient and mounts NO canvas under reduced motion", () => {
    stubMatchMedia((q) => q.includes("reduced-motion"));

    const { container } = render(<AmbientBackground theme="rain" />);

    // Critical (audit C3/D3): the canvas/engine must never be mounted.
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector(".ambient-bg-static")).not.toBeNull();
  });

  it("renders a static gradient and NO canvas under reduced transparency", () => {
    stubMatchMedia((q) => q.includes("reduced-transparency"));

    const { container } = render(<AmbientBackground theme="snow" />);

    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector(".ambient-bg-static")).not.toBeNull();
  });

  it("mounts dual canvases when motion + transparency are allowed", () => {
    stubMatchMedia(() => false);

    const { container } = render(<AmbientBackground theme="clear" />);

    expect(container.querySelectorAll("canvas")).toHaveLength(2);
    expect(container.querySelector(".ambient-bg-canvas")).not.toBeNull();
  });
});
