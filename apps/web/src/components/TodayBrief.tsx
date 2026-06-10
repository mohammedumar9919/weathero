import { Wind } from "lucide-react";
import type { AirQuality } from "../types/weather";
import { aqiChipLabel, aqiTone } from "../utils/metricsFormat";

interface TodayBriefProps {
  brief: string;
  airQuality?: AirQuality;
}

export function TodayBrief({ brief, airQuality }: TodayBriefProps) {
  return (
    <section className="today-brief showpiece-enter-1" aria-label="Today's brief">
      <p className="today-brief-text">{brief}</p>
      {airQuality ? (
        <div
          className={`today-brief-aqi today-brief-aqi-${aqiTone(airQuality.aqi)}`}
          role="status"
          aria-label={`Air quality ${airQuality.category}, PM2.5 ${airQuality.pm2_5} micrograms per cubic meter`}
        >
          <Wind size={16} aria-hidden className="today-brief-aqi-icon" />
          <span>{aqiChipLabel(airQuality)}</span>
          <span className="today-brief-aqi-pm">
            PM2.5 {airQuality.pm2_5.toFixed(1)}
          </span>
        </div>
      ) : null}
    </section>
  );
}
