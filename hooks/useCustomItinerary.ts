import { useCallback, useState } from "react";
import { calculateBudget } from "../src/lib/activities";
import type { Activity, ChosenActivity, CustomItinerary } from "../types/shared";

const emptyItinerary = (): CustomItinerary => ({
  destinationId: "",
  destination: "",
  location: "",
  travelers: 1,
  chosenActivities: [],
  totalBudget: 0,
});

export function useCustomItinerary(initial?: Partial<CustomItinerary>) {
  const [itinerary, setItinerary] = useState<CustomItinerary>({
    ...emptyItinerary(),
    ...initial,
  });

  const init = useCallback((data: Partial<CustomItinerary>) => {
    setItinerary((prev) => ({ ...prev, ...data }));
  }, []);

  const addActivity = useCallback((activity: Activity, day: number) => {
    setItinerary((prev) => {
      if (prev.chosenActivities.some((a) => a.id === activity.id)) return prev;
      const chosen: ChosenActivity[] = [...prev.chosenActivities, { ...activity, day }];
      return {
        ...prev,
        chosenActivities: chosen,
        totalBudget: calculateBudget(chosen, prev.travelers),
      };
    });
  }, []);

  const removeActivity = useCallback((activityId: string) => {
    setItinerary((prev) => {
      const chosen = prev.chosenActivities.filter((a) => a.id !== activityId);
      return {
        ...prev,
        chosenActivities: chosen,
        totalBudget: calculateBudget(chosen, prev.travelers),
      };
    });
  }, []);

  const setTravelers = useCallback((count: number) => {
    const travelers = Math.max(1, count);
    setItinerary((prev) => ({
      ...prev,
      travelers,
      totalBudget: calculateBudget(prev.chosenActivities, travelers),
    }));
  }, []);

  const isSelected = useCallback(
    (activityId: string) => itinerary.chosenActivities.some((a) => a.id === activityId),
    [itinerary.chosenActivities]
  );

  return { itinerary, init, addActivity, removeActivity, setTravelers, isSelected };
}
