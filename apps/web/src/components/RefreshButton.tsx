import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { KeyedMutator } from "swr";
import type { WeatherEnvelope } from "../types/weather";

const DEBOUNCE_MS = 30_000;

interface RefreshButtonProps {
  mutate: KeyedMutator<WeatherEnvelope>;
  isValidating: boolean;
}

export function RefreshButton({ mutate, isValidating }: RefreshButtonProps) {
  const [lastRefresh, setLastRefresh] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const handleRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefresh < DEBOUNCE_MS) return;

    setLastRefresh(now);
    setCooldown(true);
    void mutate();
    setTimeout(() => setCooldown(false), DEBOUNCE_MS);
  }, [lastRefresh, mutate]);

  const disabled = cooldown || isValidating;

  return (
    <button
      type="button"
      className="refresh-button"
      onClick={handleRefresh}
      disabled={disabled}
      aria-label="Refresh weather"
      title={cooldown ? "Wait 30 seconds between refreshes" : "Refresh weather"}
    >
      <RefreshCw
        size={22}
        className={isValidating ? "refresh-icon spin" : "refresh-icon"}
        aria-hidden="true"
      />
    </button>
  );
}
