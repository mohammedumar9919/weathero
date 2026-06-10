import { Droplets, Thermometer, Wind } from "lucide-react";
import type { HoursStripSlot } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import { formatTemp } from "../utils/temperature";
import { formatCondition, formatHourLabel } from "../utils/weatherFormat";

interface HourDetailExpandProps {
  slot: HoursStripSlot;
  fetchedAt: string;
  unit: TempUnit;
  onClose: () => void;
}

export function HourDetailExpand({
  slot,
  fetchedAt,
  unit,
  onClose,
}: HourDetailExpandProps) {
  const time = formatHourLabel(fetchedAt, slot.offset_hours);
  const rainPct = Math.round(slot.rain_prob * 100);

  return (
    <div
      className="hour-detail-expand glass-card"
      role="region"
      aria-label={`Hour detail for ${time}`}
    >
      <div className="hour-detail-header">
        <h3 className="hour-detail-title">{time}</h3>
        <button
          type="button"
          className="hour-detail-close"
          onClick={onClose}
          aria-label="Close hour detail"
        >
          Close
        </button>
      </div>
      <ul className="hour-detail-stats">
        <li>
          <Thermometer size={18} aria-hidden="true" />
          <span>
            {formatTemp(slot.temp_c, unit)} · {formatCondition(slot.condition_family)}
          </span>
        </li>
        <li>
          <Droplets size={18} aria-hidden="true" />
          <span>{rainPct}% chance of rain</span>
        </li>
        <li>
          <Wind size={18} aria-hidden="true" />
          <span>
            {slot.wind_speed_mps !== undefined
              ? `${slot.wind_speed_mps.toFixed(1)} m/s wind`
              : "Wind data unavailable"}
          </span>
        </li>
      </ul>
    </div>
  );
}
