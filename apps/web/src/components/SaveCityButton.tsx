import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import {
  MAX_SAVED_LOCATIONS,
  SavedLocationLimitError,
  useSavedLocationsActions,
} from "../hooks/useSavedLocations";

interface SaveCityButtonProps {
  city: string;
}

export function SaveCityButton({ city }: SaveCityButtonProps) {
  const { data, save, remove } = useSavedLocationsActions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locations = data ?? [];
  const existing = locations.find(
    (loc) => loc.city.toLowerCase() === city.toLowerCase(),
  );
  const isSaved = Boolean(existing);
  const isFull = locations.length >= MAX_SAVED_LOCATIONS;
  const disabled = busy || !city || (!isSaved && isFull);

  const handleClick = useCallback(async () => {
    if (busy || !city) return;
    setError(null);
    setBusy(true);
    try {
      if (existing) {
        await remove(existing.id);
      } else {
        await save(city);
      }
    } catch (err) {
      if (err instanceof SavedLocationLimitError) {
        setError(`Saved cities full (max ${MAX_SAVED_LOCATIONS})`);
      } else {
        console.warn("SaveCityButton: action failed", err);
        setError("Couldn't update saved cities");
      }
    } finally {
      setBusy(false);
    }
  }, [busy, city, existing, remove, save]);

  const label = isSaved ? `Remove ${city} from saved` : `Save ${city}`;
  const title =
    !isSaved && isFull
      ? `Saved cities full (max ${MAX_SAVED_LOCATIONS})`
      : label;

  return (
    <button
      type="button"
      className={`save-city-button${isSaved ? " save-city-button-active" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isSaved}
      title={error ?? title}
    >
      <Star
        size={22}
        className="save-city-icon"
        aria-hidden="true"
        fill={isSaved ? "currentColor" : "none"}
      />
    </button>
  );
}
