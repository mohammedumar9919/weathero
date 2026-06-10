import { useState } from "react";
import type { HoursStripSlot } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import { formatTemp } from "../utils/temperature";
import {
  buildSlotAriaLabel,
  formatHourLabel,
  rainBarHeight,
} from "../utils/weatherFormat";
import { HourDetailExpand } from "./HourDetailExpand";

interface HoursStripProps {
  slots: HoursStripSlot[];
  fetchedAt: string;
  unit: TempUnit;
}

export function HoursStrip({ slots, fetchedAt, unit }: HoursStripProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleSlot = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="hours-strip-section" aria-label="Hourly forecast strip">
      <h2 className="hours-strip-heading">Next 24 hours</h2>
      <ul className="hours-strip-scroll">
        {slots.map((slot, index) => {
          const isExpanded = expandedIndex === index;
          const ariaLabel = buildSlotAriaLabel(slot, fetchedAt);
          return (
            <li key={slot.offset_hours}>
              <button
                type="button"
                className={`hours-strip-slot${isExpanded ? " hours-strip-slot-active" : ""}`}
                aria-label={ariaLabel}
                aria-expanded={isExpanded}
                onClick={() => toggleSlot(index)}
              >
              <span className="hours-strip-time">
                {formatHourLabel(fetchedAt, slot.offset_hours)}
              </span>
              <span
                className="hours-strip-bar"
                aria-hidden="true"
                style={{ height: `${rainBarHeight(slot.rain_prob)}px` }}
              />
              <span className="hours-strip-temp">
                {formatTemp(slot.temp_c, unit)}
              </span>
              <span className="hours-strip-rain">
                {Math.round(slot.rain_prob * 100)}%
              </span>
              </button>
            </li>
          );
        })}
      </ul>
      {expandedIndex !== null && slots[expandedIndex] ? (
        <HourDetailExpand
          slot={slots[expandedIndex]}
          fetchedAt={fetchedAt}
          unit={unit}
          onClose={() => setExpandedIndex(null)}
        />
      ) : null}
    </section>
  );
}
