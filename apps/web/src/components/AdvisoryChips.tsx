import type { ComponentType } from "react";
import { CloudRain, Flame, Wind } from "lucide-react";
import type { Advisory, AdvisoryIcon } from "../types/weather";

const ICON_MAP: Record<
  AdvisoryIcon,
  ComponentType<{ size?: number; "aria-hidden"?: boolean }>
> = {
  rain: CloudRain,
  heat: Flame,
  wind: Wind,
};

interface AdvisoryChipsProps {
  advisories: Advisory[];
}

export function AdvisoryChips({ advisories }: AdvisoryChipsProps) {
  if (advisories.length === 0) return null;

  return (
    <ul className="advisory-chips" aria-label="Weather advisories">
      {advisories.map((advisory) => {
        const Icon = ICON_MAP[advisory.icon] ?? CloudRain;
        return (
          <li key={`${advisory.icon}-${advisory.text}`}>
            <span
              className={`advisory-chip advisory-severity-${advisory.severity}`}
            >
              <Icon size={16} aria-hidden={true} />
              <span>{advisory.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
