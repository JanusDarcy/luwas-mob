import type { Activity, TripPackage } from "../../types/shared";

export const calculateBudget = (activities: { price: number }[], travelers: number): number =>
  activities.reduce((sum, act) => sum + act.price, 0) * travelers;

export const filterBySearch = (activities: Activity[], searchTerm: string): Activity[] => {
  if (!searchTerm.trim()) return activities;
  const lower = searchTerm.toLowerCase();
  return activities.filter(
    (act) =>
      act.title.toLowerCase().includes(lower) ||
      act.description?.toLowerCase().includes(lower)
  );
};

export const filterByCategory = (activities: Activity[], category: string): Activity[] => {
  if (!category || category === "All") return activities;
  return activities.filter((act) => act.category === category);
};

export const sortActivities = (
  activities: Activity[],
  sortBy: "price" | "duration" | "recommended"
): Activity[] => {
  const sorted = [...activities];
  switch (sortBy) {
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "duration":
      return sorted.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
    case "recommended":
      return sorted.sort((a, b) => (a.dayRecommendation || 0) - (b.dayRecommendation || 0));
    default:
      return sorted;
  }
};

export const getAvailablePlaces = (packages: TripPackage[]): string[] => {
  const places = packages
    .map((pkg) => pkg.packageLocation || pkg.destinationLocation || "")
    .filter(Boolean)
    .map((p) => p.trim());
  return Array.from(new Set(places));
};

export const CATEGORY_COLORS: Record<string, string> = {
  Adventure: "#EF4444",
  Food: "#F59E0B",
  Culture: "#8B5CF6",
  Nature: "#10B981",
};

export const ACTIVITY_CATEGORIES = ["All", "Adventure", "Food", "Culture", "Nature"];
