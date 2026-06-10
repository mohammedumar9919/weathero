import type { WeatherCurrent } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import { celsiusToDisplay, formatTemp } from "../utils/temperature";

interface FeelsLikeGaugeProps {
  current: WeatherCurrent;
  unit: TempUnit;
}

export function FeelsLikeGauge({ current, unit }: FeelsLikeGaugeProps) {
  const temp = celsiusToDisplay(current.temp_c, unit);
  const feels = celsiusToDisplay(current.feels_like_c, unit);
  const delta = Math.round(feels - temp);
  const spread = Math.max(Math.abs(delta), 4);
  const min = Math.min(temp, feels) - spread * 0.25;
  const max = Math.max(temp, feels) + spread * 0.25;
  const range = max - min || 1;
  const tempPct = ((temp - min) / range) * 100;
  const feelsPct = ((feels - min) / range) * 100;

  return (
    <div
      className="feels-like-gauge"
      role="group"
      aria-label={`Temperature ${Math.round(temp)} degrees, feels like ${Math.round(feels)} degrees`}
    >
      <p className="hero-temp">{formatTemp(current.temp_c, unit)}</p>
      <div className="feels-like-track" aria-hidden="true">
        <span
          className="feels-like-marker feels-like-marker-temp"
          style={{ left: `${tempPct}%` }}
        />
        <span
          className="feels-like-marker feels-like-marker-feels"
          style={{ left: `${feelsPct}%` }}
        />
      </div>
      <p className="feels-like-caption">
        Feels like <strong>{formatTemp(current.feels_like_c, unit)}</strong>
        {delta !== 0 ? (
          <span className="feels-like-delta">
            {" "}
            ({delta > 0 ? "+" : ""}
            {delta}°)
          </span>
        ) : null}
      </p>
    </div>
  );
}
