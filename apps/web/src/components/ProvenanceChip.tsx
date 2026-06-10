import { Radio } from "lucide-react";
import type { WeatherPresentation } from "../types/weather";

interface ProvenanceChipProps {
  presentation: WeatherPresentation;
}

export function ProvenanceChip({ presentation }: ProvenanceChipProps) {
  const pulse =
    presentation.provenance_pulse || presentation.provenance_tone === "live";

  return (
    <span
      className={`provenance-chip provenance-tone-${presentation.provenance_tone}${pulse ? " provenance-pulse" : ""}`}
      role="status"
      aria-label={`Data source: ${presentation.provenance_label}`}
    >
      <Radio size={14} aria-hidden="true" className="provenance-icon" />
      <span>{presentation.provenance_label}</span>
      <span className="provenance-badge">{presentation.source_badge}</span>
    </span>
  );
}
