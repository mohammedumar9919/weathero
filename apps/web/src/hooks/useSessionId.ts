import { useMemo } from "react";

const SESSION_KEY = "weathero-session-id";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = createSessionId();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function useSessionId(): string {
  return useMemo(() => getSessionId(), []);
}
