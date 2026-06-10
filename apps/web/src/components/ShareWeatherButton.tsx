import { useCallback, useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { buildShareWeatherUrl, copyTextToClipboard } from "../utils/shareUrl";

interface ShareWeatherButtonProps {
  city: string;
}

export function ShareWeatherButton({ city }: ShareWeatherButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const statusTimerRef = useRef<number | null>(null);

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current !== null) {
      window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearStatusTimer, [clearStatusTimer]);

  const handleShare = useCallback(async () => {
    clearStatusTimer();
    const url = buildShareWeatherUrl(
      city,
      window.location.search,
      window.location.origin,
      window.location.pathname,
    );
    const ok = await copyTextToClipboard(url);
    setStatus(ok ? "copied" : "error");
    statusTimerRef.current = window.setTimeout(() => setStatus("idle"), 3000);
  }, [city, clearStatusTimer]);

  return (
    <div className="share-weather-wrap">
      <button
        type="button"
        className="share-weather-btn"
        onClick={handleShare}
        aria-label={`Share weather link for ${city}`}
      >
        <Share2 size={16} aria-hidden />
        Share
      </button>
      {status !== "idle" ? (
        <p className="share-weather-status" role="status" aria-live="polite">
          {status === "copied"
            ? "Link copied — paste to share this city view."
            : "Copy failed — select the URL from the address bar."}
        </p>
      ) : null}
    </div>
  );
}
