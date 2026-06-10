import type { AmbientTheme } from "../types/weather";

const THEME_GRADIENTS: Record<AmbientTheme, string> = {
  clear:
    "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(56, 189, 248, 0.35) 0%, transparent 55%), linear-gradient(180deg, #0c1222 0%, #0a0a0a 70%)",
  cloud:
    "radial-gradient(ellipse 100% 60% at 40% 10%, rgba(148, 163, 184, 0.25) 0%, transparent 50%), linear-gradient(180deg, #111827 0%, #0a0a0a 75%)",
  rain:
    "radial-gradient(ellipse 90% 70% at 60% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 55%), linear-gradient(180deg, #0f172a 0%, #0a0a0a 70%)",
  storm:
    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.35) 0%, transparent 50%), linear-gradient(180deg, #0b0f1a 0%, #0a0a0a 80%)",
  snow:
    "radial-gradient(ellipse 100% 70% at 50% 0%, rgba(186, 230, 253, 0.2) 0%, transparent 55%), linear-gradient(180deg, #0f1419 0%, #0a0a0a 75%)",
  fog:
    "radial-gradient(ellipse 110% 80% at 50% 20%, rgba(161, 161, 170, 0.18) 0%, transparent 60%), linear-gradient(180deg, #141414 0%, #0a0a0a 80%)",
  atmosphere:
    "radial-gradient(ellipse 100% 60% at 30% 0%, rgba(167, 139, 250, 0.22) 0%, transparent 55%), linear-gradient(180deg, #120f1a 0%, #0a0a0a 75%)",
};

interface AmbientCanvasProps {
  theme: AmbientTheme;
}

export function AmbientCanvas({ theme }: AmbientCanvasProps) {
  return (
    <div
      className="ambient-canvas"
      style={{ background: THEME_GRADIENTS[theme] ?? THEME_GRADIENTS.clear }}
      aria-hidden="true"
      data-theme={theme}
    />
  );
}
