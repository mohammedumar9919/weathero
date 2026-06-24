import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./Sidebar";
import type { PanelId } from "../hooks/useViewMode";

const panels: { id: PanelId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <span>d</span> },
  { id: "charts", label: "Charts", icon: <span>c</span> },
];

describe("Sidebar", () => {
  it("opens the panel on keyboard focus and closes it on ESC", () => {
    render(
      <Sidebar
        panels={panels}
        activePanel="dashboard"
        onPanelChange={vi.fn()}
        slots={{}}
      />,
    );

    // Collapsed: no expanded panel region yet.
    expect(screen.queryByRole("region")).toBeNull();

    // Keyboard focus on a rail button expands the rail/panel.
    const railButton = screen.getByRole("button", { name: /dashboard/i });
    fireEvent.focusIn(railButton);

    const region = screen.getByRole("region");
    expect(region).not.toBeNull();

    // ESC closes the panel.
    fireEvent.keyDown(region, { key: "Escape" });
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("opens on click and renders the injected assistant slot", () => {
    render(
      <Sidebar
        panels={[{ id: "assistant", label: "Assistant", icon: <span>a</span> }]}
        activePanel="assistant"
        onPanelChange={vi.fn()}
        slots={{ assistant: <div>CHAT_PANEL</div> }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));
    expect(screen.getByText("CHAT_PANEL")).not.toBeNull();
  });

  it("falls back to a placeholder when the assistant slot is undefined", () => {
    render(
      <Sidebar
        panels={[{ id: "assistant", label: "Assistant", icon: <span>a</span> }]}
        activePanel="assistant"
        onPanelChange={vi.fn()}
        slots={{}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));
    expect(screen.getByRole("note")).not.toBeNull();
  });
});
