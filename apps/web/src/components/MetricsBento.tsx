import {
  CloudRain,
  Droplets,
  Gauge,
  ThermometerSun,
  Wind,
} from "lucide-react";
import type { AirQuality, WeatherCurrent } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import {
  formatFeelsLike,
  formatHumidity,
  formatPm25,
  formatRainProb,
  formatWindSpeed,
  aqiChipLabel,
} from "../utils/metricsFormat";

interface MetricsBentoProps {
  current: WeatherCurrent;
  airQuality?: AirQuality;
  unit: TempUnit;
}

interface MetricTile {
  id: string;
  icon: typeof Droplets;
  label: string;
  value: string;
}

export function MetricsBento({ current, airQuality, unit }: MetricsBentoProps) {
  const tiles: MetricTile[] = [
    {
      id: "humidity",
      icon: Droplets,
      label: "Humidity",
      value: formatHumidity(current.humidity_pct),
    },
    {
      id: "wind",
      icon: Wind,
      label: "Wind",
      value: formatWindSpeed(current.wind_speed_mps),
    },
    {
      id: "feels",
      icon: ThermometerSun,
      label: "Feels like",
      value: formatFeelsLike(current.feels_like_c, unit),
    },
    {
      id: "rain",
      icon: CloudRain,
      label: "Rain chance",
      value: formatRainProb(current.rain_prob),
    },
  ];

  if (airQuality) {
    tiles.push({
      id: "aqi",
      icon: Gauge,
      label: "Air quality",
      value: `${aqiChipLabel(airQuality)} · ${formatPm25(airQuality.pm2_5)}`,
    });
  }

  return (
    <section
      className="metrics-bento showpiece-enter-3"
      aria-label="Current metrics"
    >
      <ul className="metrics-bento-grid">
        {tiles.map(({ id, icon: Icon, label, value }) => (
          <li key={id}>
            <article className="metrics-bento-tile">
              <Icon size={20} aria-hidden className="metrics-bento-icon" />
              <span className="metrics-bento-label">{label}</span>
              <span className="metrics-bento-value">{value}</span>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
