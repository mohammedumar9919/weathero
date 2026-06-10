import { SWRConfig } from "swr";
import type { ReactNode } from "react";

export const SWR_STORAGE_KEY = "weathero-swr-v1";

function sessionStorageProvider() {
  const map = new Map<string, unknown>(
    JSON.parse(sessionStorage.getItem(SWR_STORAGE_KEY) || "[]") as [
      string,
      unknown,
    ][],
  );

  window.addEventListener("beforeunload", () => {
    const entries = JSON.stringify(Array.from(map.entries()));
    sessionStorage.setItem(SWR_STORAGE_KEY, entries);
  });

  return map;
}

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        provider: sessionStorageProvider,
        revalidateOnFocus: true,
        dedupingInterval: 5000,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
