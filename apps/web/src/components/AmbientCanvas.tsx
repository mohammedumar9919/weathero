import type { AmbientTheme } from "../types/weather";

interface AmbientCanvasProps {
  theme: AmbientTheme;
}

export function AmbientCanvas({ theme }: AmbientCanvasProps) {
  return (
    <div
      className="ambient-canvas"
      aria-hidden="true"
      data-theme={theme}
    >
      <div className="ambient-canvas-base" />
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-secondary" />
    </div>
  );
}
