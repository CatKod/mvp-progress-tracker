"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTracker, type TrackerApi } from "@/lib/use-tracker";

const TrackerContext = createContext<TrackerApi | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const tracker = useTracker();
  return <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>;
}

/** Hook truy cập state/action của tracker. Phải nằm trong <TrackerProvider>. */
export function useTrackerApi(): TrackerApi {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTrackerApi phải được dùng bên trong <TrackerProvider>");
  return ctx;
}
