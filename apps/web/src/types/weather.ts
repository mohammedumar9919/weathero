export interface WeatherCurrent {
  temp_c: number;
  feels_like_c: number;
  humidity_pct: number;
  wind_speed_mps: number;
  condition_code: number;
  condition_family: string;
  rain_prob: number;
  wind_deg?: number;
}

export interface HoursStripSlot {
  offset_hours: number;
  temp_c: number;
  rain_prob: number;
  condition_code: number;
  condition_family: string;
  wind_speed_mps?: number;
}

export interface AirQuality {
  aqi: number;
  category: string;
  pm2_5: number;
}

export interface WeatherSnapshot {
  city: string;
  country: string;
  lat: number;
  lon: number;
  fetched_at: string;
  current: WeatherCurrent;
  hours_strip: HoursStripSlot[];
  /** v1.3.0 — optional; omitted on OM fallback or AQI fetch failure */
  air_quality?: AirQuality;
}

export type AmbientTheme =
  | "clear"
  | "cloud"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "atmosphere";

export type TempBand = "mild" | "warm" | "hot";
export type ProvenanceTone = "live" | "cache" | "stale";
export type AdvisorySeverity = "info" | "warn" | "danger";
export type AdvisoryIcon = "rain" | "heat" | "wind";
export type DataSource = "live" | "cache" | "stale_fallback";

export interface Advisory {
  text: string;
  severity: AdvisorySeverity;
  icon: AdvisoryIcon;
}

export interface WeatherPresentation {
  ambient_theme: AmbientTheme;
  temp_band: TempBand;
  source_badge: string;
  advisories: Advisory[];
  provenance_label: string;
  provenance_pulse: boolean;
  provenance_tone: ProvenanceTone;
  /** v1.3.0 — required rule-generated summary (no LLM); UI in V2 */
  today_brief: string;
}

export interface WeatherMeta {
  data_source: DataSource;
  provider: string;
  cached_at: string;
  stale_fallback: boolean;
}

export interface WeatherEnvelope {
  snapshot: WeatherSnapshot;
  presentation: WeatherPresentation;
  meta: WeatherMeta;
}

/** @deprecated Use WeatherSnapshot — kept for gradual migration references */
export type WeatherBundle = WeatherSnapshot;
