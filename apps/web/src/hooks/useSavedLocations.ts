import { useCallback } from "react";
import useSWR from "swr";
import { useSessionId } from "./useSessionId";

export const MAX_SAVED_LOCATIONS = 7;

export interface SavedLocation {
  id: number;
  session_id: string;
  city: string;
  sort_order: number;
}

/** Thrown when the backend rejects a save because the saved-cities limit is reached. */
export class SavedLocationLimitError extends Error {
  constructor(message = `Saved cities full (max ${MAX_SAVED_LOCATIONS})`) {
    super(message);
    this.name = "SavedLocationLimitError";
  }
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

export async function saveLocation(
  sessionId: string,
  city: string,
): Promise<SavedLocation> {
  const res = await fetch("/api/v1/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, city }),
  });
  if (res.status === 400) {
    throw new SavedLocationLimitError();
  }
  if (!res.ok) {
    throw new Error(`Failed to save location: ${res.status}`);
  }
  return res.json() as Promise<SavedLocation>;
}

export async function removeLocation(
  sessionId: string,
  id: number,
): Promise<void> {
  const res = await fetch(
    `/api/v1/locations/${id}?session_id=${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`Failed to remove location: ${res.status}`);
  }
}

export function useSavedLocations() {
  const sessionId = useSessionId();
  const key = locationsKey(sessionId);

  return useSWR<SavedLocation[]>(key, fetchLocations, {
    revalidateOnFocus: false,
  });
}

/**
 * Saved-locations data plus typed mutators. Shares the same SWR cache key as
 * {@link useSavedLocations}, so save/remove revalidate every consumer.
 */
export function useSavedLocationsActions() {
  const sessionId = useSessionId();
  const { data, isLoading, mutate } = useSWR<SavedLocation[]>(
    locationsKey(sessionId),
    fetchLocations,
    { revalidateOnFocus: false },
  );

  const save = useCallback(
    async (city: string) => {
      const row = await saveLocation(sessionId, city);
      await mutate();
      return row;
    },
    [sessionId, mutate],
  );

  const remove = useCallback(
    async (id: number) => {
      await removeLocation(sessionId, id);
      await mutate();
    },
    [sessionId, mutate],
  );

  return { data, isLoading, mutate, save, remove };
}
