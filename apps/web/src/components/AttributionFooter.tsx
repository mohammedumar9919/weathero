interface AttributionFooterProps {
  provider?: string;
}

export function AttributionFooter({ provider }: AttributionFooterProps) {
  if (provider !== "open_meteo") return null;

  return (
    <footer className="attribution-footer" role="contentinfo">
      <p>
        Weather data via{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-link"
        >
          Open-Meteo
        </a>
        . Attribution required when Open-Meteo is the active provider.
      </p>
    </footer>
  );
}
