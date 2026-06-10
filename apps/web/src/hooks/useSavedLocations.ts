import useSWR from "swr";
import { useSessionId } from "./useSessionId";

export interface SavedLocation {
  id: number;
  session_id: string;
  city: string;
  sort_order: number;
}

async function fetchLocations(url: string): Promise<SavedLocation[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch locations: ${res.status}`);
  }
  return res.json() as Promise<SavedLocation[]>;
}

export function locationsKey(sessionId: string): string {
  return `/api/v1/locations?session_id=${encodeURIComponent(sessionId)}`;
}

export function useSavedLocations() {
  const sessionId = useSessionId();
  const key = locationsKey(sessionId);

  return useSWR<SavedLocation[]>(key, fetchLocations, {
    revalidateOnFocus: false,
  });
}
