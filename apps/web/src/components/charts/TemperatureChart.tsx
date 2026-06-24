import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HoursStripSlot } from "../../types/weather";
import { celsiusToDisplay, formatTemp, type TempUnit } from "../../utils/temperature";
import { formatHourLabel } from "../../utils/weatherFormat";
import "../../styles/wow.css";

export interface TemperatureChartProps {
  slots: HoursStripSlot[];
  fetchedAt: string;
  unit?: TempUnit;
}

interface ChartPoint {
  offsetHours: number;
  label: string;
  /** Display-unit value used for the plotted line. */
  temp: number;
  /** Pre-formatted "24°" string for tooltip + a11y. */
  display: string;
}

/**
 * Lazy-loadable temperature trend over the 8-slot `hours_strip`. Read-only over
 * the envelope — no type mutation. Imports only the Recharts pieces it uses so
 * tree-shaking keeps the lazy chunk light.
 */
export default function TemperatureChart({
  slots,
  fetchedAt,
  unit = "celsius",
}: TemperatureChartProps) {
  const series = useMemo<ChartPoint[]>(
    () =>
      slots.map((slot) => ({
        offsetHours: slot.offset_hours,
        label: formatHourLabel(fetchedAt, slot.offset_hours),
        temp: Math.round(celsiusToDisplay(slot.temp_c, unit)),
        display: formatTemp(slot.temp_c, unit),
      })),
    [slots, fetchedAt, unit],
  );

  if (series.length === 0) {
    return (
      <p className="temp-chart-empty" role="status">
        No hourly data to chart yet.
      </p>
    );
  }

  return (
    <figure className="temp-chart" aria-label="Temperature trend over the next 24 hours">
      <div className="temp-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="temp-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              width={36}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}°`}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              cursor={{ stroke: "rgba(56,189,248,0.35)", strokeWidth: 1 }}
              contentStyle={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "0.5rem",
                color: "#f5f5f5",
                fontSize: "0.8125rem",
              }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(value: number) => [`${value}°`, "Temp"]}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#temp-chart-fill)"
              isAnimationActive={false}
              dot={{ r: 2, fill: "#38bdf8" }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible, render-independent fallback (also testable in jsdom). */}
      <ul className="sr-only temp-chart-data">
        {series.map((point) => (
          <li key={point.offsetHours} data-offset={point.offsetHours}>
            {point.label}: {point.display}
          </li>
        ))}
      </ul>
    </figure>
  );
}
