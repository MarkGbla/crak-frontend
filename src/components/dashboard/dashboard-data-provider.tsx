"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { crakApi } from "@/lib/crak-api";
import type { Business, Me } from "@/lib/crak-api";

type DashboardData = {
  business: Business | null;
  me: Me | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectBusiness: (businessId: string) => void;
};

const DashboardDataContext = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setMe(null);
      setBusinessId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your sign-in session could not provide an API token.");
      const nextMe = await crakApi.me(token);
      setMe(nextMe);
      setBusinessId((current) => nextMe.businesses.some((business) => business.id === current) ? current : nextMe.businesses[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your CRAK workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => { const timer = window.setTimeout(() => { void refresh(); }, 0); return () => window.clearTimeout(timer); }, [refresh]);

  const value = useMemo(() => ({
    business: me?.businesses.find((item) => item.id === businessId) ?? null,
    me,
    isLoading,
    error,
    refresh,
    selectBusiness: setBusinessId,
  }), [businessId, error, isLoading, me, refresh]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error("useDashboardData must be used inside DashboardDataProvider.");
  return context;
}
