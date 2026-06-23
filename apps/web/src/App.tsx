import { lazy, Suspense, useMemo, useState } from "react";
import { SWRProvider } from "./providers/SWRProvider";
import { useUrlCity } from "./hooks/useUrlCity";
import { useViewMode } from "./hooks/useViewMode";
import { useWeatherBundle } from "./hooks/useWeatherBundle";
import { useSavedLocations } from "./hooks/useSavedLocations";
import { useUnits } from "./hooks/useUnits";
import { AmbientCanvas } from "./components/AmbientCanvas";
import { HeroWeather } from "./components/HeroWeather";
import { CitySearch } from "./components/CitySearch";
import { RefreshButton } from "./components/RefreshButton";
import { SaveCityButton } from "./components/SaveCityButton";
import { UnitToggle } from "./components/UnitToggle";
import { AttributionFooter } from "./components/AttributionFooter";
import { ComparePreflight } from "./components/ComparePreflight";
import { PitchLanding } from "./components/PitchLanding";

const SavedCityCarousel = lazy(
  () => import("./components/SavedCityCarousel").then((m) => ({ default: m.SavedCityCarousel })),
);
const CompareBars = lazy(
  () => import("./components/CompareBars").then((m) => ({ default: m.CompareBars })),
);

function ShipFeaturesFallback() {
  return (
    <div className="ship-lazy-fallback" aria-busy="true">
      <div className="skeleton skeleton-ship-row" />
    </div>
  );
}

function WeatherDashboard() {
  const { city, setCity } = useUrlCity();
  const { unit } = useUnits();
  const { data, error, isLoading, isValidating, mutate } = useWeatherBundle(
    city,
    unit,
  );
  const { data: savedLocations } = useSavedLocations();
  const [compareCity, setCompareCity] = useState<string | null>(null);
  const ambientTheme = data?.presentation.ambient_theme ?? "clear";

  const compareOptions = useMemo(
    () => savedLocations?.map((loc) => loc.city) ?? [],
    [savedLocations],
  );

  return (
    <>
      <AmbientCanvas theme={ambientTheme} />
      <div className="dashboard">
        <header className="dashboard-header">
          <CitySearch city={city} onCityChange={setCity} />
          <UnitToggle />
          <RefreshButton mutate={mutate} isValidating={isValidating} />
          <SaveCityButton city={city} />
        </header>

        <Suspense fallback={<ShipFeaturesFallback />}>
          <SavedCityCarousel activeCity={city} onSelectCity={setCity} />
        </Suspense>

        {error ? (
          <p className="dashboard-error" role="alert">
            Failed to load weather. Check the API is running.
          </p>
        ) : null}

        <HeroWeather
          envelope={data}
          isLoading={isLoading}
          isValidating={isValidating}
          unit={unit}
        />

        <Suspense fallback={<ShipFeaturesFallback />}>
          <ComparePreflight
            currentCity={city}
            compareCity={compareCity}
            onCompareCityChange={setCompareCity}
            compareOptions={compareOptions}
          >
            {compareCity ? (
              <CompareBars currentCity={city} compareCity={compareCity} />
            ) : null}
          </ComparePreflight>
        </Suspense>

        <AttributionFooter provider={data?.meta.provider} />
      </div>
    </>
  );
}

export default function App() {
  const { view } = useViewMode();

  return (
    <SWRProvider>
      <main
        className={
          view === "pitch"
            ? "weathero-shell pitch-shell"
            : "weathero-shell app-shell"
        }
      >
        {view === "pitch" ? <PitchLanding /> : <WeatherDashboard />}
      </main>
    </SWRProvider>
  );
}
