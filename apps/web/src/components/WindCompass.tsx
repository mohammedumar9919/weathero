import { Navigation } from "lucide-react";
import type { WeatherCurrent } from "../types/weather";

interface WindCompassProps {
  current: WeatherCurrent;
}

export function WindCompass({ current }: WindCompassProps) {
  const rotation = current.wind_deg ?? 0;
  const hasDirection = current.wind_deg !== undefined;

  return (
    <div
      className="wind-compass glass-card"
      role="group"
      aria-label={`Wind speed ${current.wind_speed_mps.toFixed(1)} meters per second${hasDirection ? `, direction ${rotation} degrees` : ""}`}
    >
      <div className="wind-compass-dial">
        <Navigation
          size={28}
          aria-hidden="true"
          className="wind-compass-arrow"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
      <div className="wind-compass-meta">
        <span className="wind-compass-label">Wind</span>
        <span className="wind-compass-value">
          {current.wind_speed_mps.toFixed(1)} m/s
        </span>
        {!hasDirection ? (
          <span className="wind-compass-note">Direction unavailable</span>
        ) : null}
      </div>
    </div>
  );
}
