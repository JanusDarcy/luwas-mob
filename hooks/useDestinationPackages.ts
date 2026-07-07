import { useCallback, useEffect, useState } from "react";
import { fetchDestinationPackages } from "../src/lib/firestore";
import { db } from "../src/lib/firebase";
import type { TripPackage } from "../types/shared";

export function useDestinationPackages(destinationId: string) {
  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!destinationId) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchDestinationPackages(db, destinationId);
      setPackages(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [destinationId]);

  useEffect(() => {
    load();
  }, [load]);

  return { packages, loading, error, refreshing, refresh: () => load(true), retry: () => load() };
}
