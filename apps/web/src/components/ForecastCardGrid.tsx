import type { ComponentType } from "react";
import { Cloud, CloudRain, Sun, Moon } from "lucide-react";
import type { HoursStripSlot } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import { formatTemp, celsiusToDisplay } from "../utils/temperature";
import { formatCondition } from "../utils/weatherFormat";

interface ForecastCardGridProps {
  hoursStrip: HoursStripSlot[];
  unit: TempUnit;
}

interface PeriodSummary {
  id: string;
  label: string;
  slots: HoursStripSlot[];
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}

function summarizePeriod(slots: HoursStripSlot[]) {
  if (slots.length === 0) {
    return { temp: 0, rain: 0, condition: "clear" };
  }
  const temp =
    slots.reduce((sum, s) => sum + s.temp_c, 0) / slots.length;
  const rain = Math.max(...slots.map((s) => s.rain_prob));
  const condition = slots[Math.floor(slots.length / 2)]?.condition_family ?? "clear";
  return { temp, rain, condition };
}

export function ForecastCardGrid({ hoursStrip, unit }: ForecastCardGridProps) {
  const periods: PeriodSummary[] = [
    {
      id: "morning",
      label: "Morning",
      slots: hoursStrip.slice(0, 2),
      Icon: Sun,
    },
    {
      id: "afternoon",
      label: "Afternoon",
      slots: hoursStrip.slice(2, 4),
      Icon: Cloud,
    },
    {
      id: "evening",
      label: "Evening",
      slots: hoursStrip.slice(4, 6),
      Icon: CloudRain,
    },
    {
      id: "night",
      label: "Night",
      slots: hoursStrip.slice(6, 8),
      Icon: Moon,
    },
  ];

  return (
    <div className="forecast-grid" role="list" aria-label="Forecast summary by period">
      {periods.map(({ id, label, slots, Icon }) => {
        const summary = summarizePeriod(slots);
        return (
          <article
            key={id}
            className="forecast-card glass-card"
            role="listitem"
            aria-label={`${label}: ${Math.round(celsiusToDisplay(summary.temp, unit))} degrees, ${Math.round(summary.rain * 100)}% rain, ${formatCondition(summary.condition)}`}
          >
            <Icon size={20} aria-hidden={true} className="forecast-card-icon" />
            <h3 className="forecast-card-label">{label}</h3>
            <p className="forecast-card-temp">
              {formatTemp(summary.temp, unit)}
            </p>
            <p className="forecast-card-meta">
              {formatCondition(summary.condition)} · {Math.round(summary.rain * 100)}% rain
            </p>
          </article>
        );
      })}
    </div>
  );
}
