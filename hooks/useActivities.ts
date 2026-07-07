import { useCallback, useEffect, useState } from "react";
import { fetchDestinationActivities } from "../src/lib/firestore";
import { db } from "../src/lib/firebase";
import type { Activity } from "../types/shared";

export function useActivities(destinationId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!destinationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDestinationActivities(db, destinationId);
      setActivities(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [destinationId]);

  useEffect(() => {
    load();
  }, [load]);

  return { activities, loading, error, retry: load };
}
