import { useRef, useState } from "react";
import type { WeatherEnvelope } from "../types/weather";
import type { TempUnit } from "../utils/temperature";
import { formatCondition } from "../utils/weatherFormat";
import { AdvisoryChips } from "./AdvisoryChips";
import { FeelsLikeGauge } from "./FeelsLikeGauge";
import { ForecastCardGrid } from "./ForecastCardGrid";
import { HoursStrip } from "./HoursStrip";
import { MetricsBento } from "./MetricsBento";
import { ProvenanceChip } from "./ProvenanceChip";
import { ShareWeatherButton } from "./ShareWeatherButton";
import { TodayBrief } from "./TodayBrief";
import { TrustDrawer, TrustDrawerTrigger } from "./TrustDrawer";
import { WindCompass } from "./WindCompass";

interface HeroWeatherProps {
  envelope: WeatherEnvelope | undefined;
  isLoading: boolean;
  isValidating: boolean;
  unit: TempUnit;
}

export function HeroWeather({
  envelope,
  isLoading,
  isValidating,
  unit,
}: HeroWeatherProps) {
  const busy = isLoading || isValidating;
  const [trustOpen, setTrustOpen] = useState(false);
  const trustTriggerRef = useRef<HTMLButtonElement>(null);

  if (!envelope && isLoading) {
    return (
      <section
        className="showpiece-layout"
        aria-busy="true"
        aria-label="Loading weather"
      >
        <div className="showpiece-glass hero-weather">
          <div className="hero-skeleton">
            <div className="skeleton skeleton-temp" />
            <div className="skeleton skeleton-city" />
            <div className="skeleton skeleton-condition" />
            <div className="skeleton skeleton-strip" />
          </div>
        </div>
      </section>
    );
  }

  if (!envelope) {
    return (
      <section className="showpiece-layout" aria-live="polite">
        <div className="showpiece-glass hero-weather">
          <p className="hero-error">Unable to load weather.</p>
          <p className="hero-error-hint">
            Try another city or check that the API is running.
          </p>
        </div>
      </section>
    );
  }

  const { snapshot, presentation } = envelope;

  return (
    <section
      className="showpiece-layout"
      aria-busy={busy ? "true" : "false"}
      aria-live="polite"
      data-temp-band={presentation.temp_band}
    >
      <div className="showpiece-content">
        <div className="showpiece-meta-row">
          <ProvenanceChip presentation={presentation} />
          <TrustDrawerTrigger
            triggerRef={trustTriggerRef}
            onOpen={() => setTrustOpen(true)}
          />
          <ShareWeatherButton city={snapshot.city} />
          <AdvisoryChips advisories={presentation.advisories} />
        </div>

        <TrustDrawer
          envelope={envelope}
          open={trustOpen}
          onClose={() => setTrustOpen(false)}
          triggerRef={trustTriggerRef}
        />

        <TodayBrief
          brief={presentation.today_brief}
          airQuality={snapshot.air_quality}
        />

        <div className="showpiece-glass hero-weather showpiece-enter-2">
          <FeelsLikeGauge current={snapshot.current} unit={unit} />
          <h1 className="hero-city">
            {snapshot.city}, {snapshot.country}
          </h1>
          <p className="hero-condition">
            {formatCondition(snapshot.current.condition_family)}
          </p>
        </div>

        <MetricsBento
          current={snapshot.current}
          airQuality={snapshot.air_quality}
          unit={unit}
        />

        <div className="showpiece-grid">
          <HoursStrip
            slots={snapshot.hours_strip}
            fetchedAt={snapshot.fetched_at}
            unit={unit}
          />
          <WindCompass current={snapshot.current} />
        </div>

        <ForecastCardGrid hoursStrip={snapshot.hours_strip} unit={unit} />
      </div>
    </section>
  );
}
