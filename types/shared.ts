export interface Activity {
  id: string;
  title: string;
  category?: string;
  price: number;
  durationHours?: number | null;
  dayRecommendation?: number | null;
  description?: string;
  imageUrl?: string;
  destinationId: string;
}

export interface TripPackage {
  id: string;
  destinationId: string;
  title: string;
  duration: string;
  price: number;
  inclusions: string[];
  dailySchedule: { day: number; activities: string[] }[];
  imageUrl?: string;
  packageLocation?: string;
  destinationLocation?: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  latitude?: number;
  longitude?: number;
}

export type ChosenActivity = Activity & { day: number };

export interface CustomItinerary {
  destinationId: string;
  destination: string;
  location: string;
  startDate?: string;
  endDate?: string;
  travelers: number;
  chosenActivities: ChosenActivity[];
  totalBudget: number;
  specialRequests?: string;
}

export interface Booking {
  id?: string;
  userId: string;
  destinationId: string;
  destination: string;
  tripType: "package" | "custom" | "itinerary" | "promo" | "destination";
  travelers: number;
  price: number;
  totalPrice: number;
  departureDate: string;
  returnDate?: string;
  specialRequests?: string;
  status: "pending_payment" | "awaiting_approval" | "approved" | "rejected" | "completed";
  packageId?: string;
  chosenActivities?: ChosenActivity[];
}
