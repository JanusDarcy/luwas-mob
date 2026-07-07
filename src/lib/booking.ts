import type { Booking, CustomItinerary, Destination } from "../../types/shared";

export const createBookingData = (
  userId: string,
  destination: Destination,
  itinerary: CustomItinerary,
  tripType: Booking["tripType"],
  pricePerPerson: number
): Partial<Booking> => ({
  userId,
  destinationId: destination.id,
  destination: destination.name,
  tripType,
  travelers: itinerary.travelers,
  price: pricePerPerson,
  totalPrice: itinerary.totalBudget,
  departureDate: itinerary.startDate || new Date().toISOString().split("T")[0],
  returnDate: itinerary.endDate,
  specialRequests: itinerary.specialRequests,
  status: "pending_payment",
  chosenActivities: itinerary.chosenActivities,
});

export const validateBooking = (
  booking: Partial<Booking>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!booking.userId) errors.push("User ID required");
  if (!booking.destinationId) errors.push("Destination required");
  if (!booking.travelers || booking.travelers < 1) errors.push("At least 1 traveler required");
  if (!booking.departureDate) errors.push("Departure date required");
  if (!booking.totalPrice || booking.totalPrice <= 0) errors.push("Invalid price");
  return { valid: errors.length === 0, errors };
};
