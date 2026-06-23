import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  locationsKey,
  saveLocation,
  removeLocation,
  SavedLocationLimitError,
  MAX_SAVED_LOCATIONS,
} from "./useSavedLocations";

describe("useSavedLocations helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("builds locations key with encoded session id", () => {
    expect(locationsKey("a b")).toBe("/api/v1/locations?session_id=a%20b");
  });

  it("allows up to 7 saved locations", () => {
    expect(MAX_SAVED_LOCATIONS).toBe(7);
  });

  it("saveLocation POSTs session_id + city and returns the row", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({ id: 1, session_id: "s", city: "Pune", sort_order: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const row = await saveLocation("s", "Pune");

    expect(row.city).toBe("Pune");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/locations",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({ session_id: "s", city: "Pune" });
  });

  it("saveLocation throws SavedLocationLimitError on 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400 }),
    );

    await expect(saveLocation("s", "X")).rejects.toBeInstanceOf(
      SavedLocationLimitError,
    );
  });

  it("saveLocation throws a generic error on other non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(saveLocation("s", "X")).rejects.toThrow(
      "Failed to save location: 500",
    );
  });

  it("removeLocation DELETEs by id with the session id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    await removeLocation("s", 5);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/locations/5?session_id=s",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
