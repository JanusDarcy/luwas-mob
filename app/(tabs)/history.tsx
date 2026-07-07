import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../src/lib/firebase";

type TravelRecord = {
  id: string;
  type: "trip" | "itinerary" | "promo";
  fullName: string;
  email?: string;
  destination: string;
  status: string;
  createdAt?: any; // Firestore Timestamp or string
  departureDate?: any; // Firestore Timestamp or string
  people?: number;
  totalPrice?: number;
  specialRequests?: string;
  location?: string;
  proofUrl?: string;
};

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  upcoming: { color: "#2563EB", bg: "#DBEAFE", icon: "airplane" },
  completed: { color: "green", bg: "#DCFCE7", icon: "checkmark-circle" },
  cancelled: { color: "red", bg: "#FEE2E2", icon: "close-circle" },
  awaiting_approval: { color: "#7C3AED", bg: "#EDE9FE", icon: "time" },
  paid: { color: "#10B981", bg: "#D1FAE5", icon: "card" },
  pending_payment: { color: "#F59E0B", bg: "#FEF3C7", icon: "hourglass" },
};

// 🔹 Utility to safely format Firestore Timestamps or strings
const CANCELLATION_REASONS = [
  {
    id: "plans_changed",
    label: "My plans have changed",
    icon: "calendar-outline",
  },
  { id: "financial", label: "Financial reasons", icon: "cash-outline" },
  {
    id: "emergency",
    label: "Health / family emergency",
    icon: "heart-outline",
  },
  {
    id: "better_option",
    label: "Found a better alternative",
    icon: "bulb-outline",
  },
  { id: "quality", label: "Service quality concerns", icon: "star-outline" },
  { id: "other", label: "Other reason", icon: "chatbubbles-outline" },
];

const formatDate = (date: any) => {
  if (!date) return "";
  if (date.toDate) {
    return date.toDate().toLocaleString(); // Firestore Timestamp
  }
  return new Date(date).toLocaleString(); // already a date string
};

export default function TravelHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "completed" | "cancelled">(
    "upcoming",
  );
  const [trips, setTrips] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TravelRecord | null>(null);
  const [cancelMode, setCancelMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherDetails, setOtherDetails] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  function resetCancelState() {
    setCancelMode(false);
    setSelectedReason(null);
    setOtherDetails("");
    setCancelError(null);
    setCancelLoading(false);
    setCancelSuccess(false);
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userId = user.uid;
    const unsubscribers: (() => void)[] = [];

    const collections = [
      { name: "bookings", type: "trip" as const },
      { name: "itineraryBookings", type: "itinerary" as const },
      { name: "promoBookings", type: "promo" as const },
    ];

    collections.forEach((col) => {
      const collectedDocs = new Map<string, TravelRecord>();
      const applySnapshot = (snap: {
        docs: { data: () => unknown; id: string }[];
      }) => {
        const newTrips: TravelRecord[] = snap.docs.map((doc) => ({
          ...(doc.data() as Omit<TravelRecord, "id" | "type">),
          id: `${col.type}:${doc.id}`,
          type: col.type,
        }));

        newTrips.forEach((trip) => collectedDocs.set(trip.id, trip));

        setTrips((prev) => {
          const filteredPrev = prev.filter((t) => t.type !== col.type);
          return [...filteredPrev, ...Array.from(collectedDocs.values())];
        });
        setLoading(false);
      };

      const q = query(collection(db, col.name), where("userId", "==", userId));
      const unsubscribe = onSnapshot(q, applySnapshot);
      unsubscribers.push(unsubscribe);

      if (user.email) {
        const emailQuery = query(
          collection(db, col.name),
          where("email", "==", user.email),
        );
        const emailUnsubscribe = onSnapshot(emailQuery, applySnapshot);
        unsubscribers.push(emailUnsubscribe);
      }
    });

    return () => unsubscribers.forEach((u) => u());
  }, [user]);

  const isUpcomingish = (status?: string) => {
    const s = (status || "").toLowerCase();
    return [
      "upcoming",
      "pending_payment",
      "paid",
      "awaiting_approval",
    ].includes(s);
  };

  const filteredTrips = trips.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (filter === "upcoming") return isUpcomingish(s);
    return s === filter;
  });

  const handleCancelTrip = async (trip: TravelRecord) => {
    setCancelMode(true);
    setCancelError(null);
    setCancelSuccess(false);
  };

  const submitCancellation = async (trip: TravelRecord) => {
    if (!selectedReason) {
      setCancelError("Please select a reason for cancellation.");
      return;
    }

    if (selectedReason === "other" && !otherDetails.trim()) {
      setCancelError("Please provide details for your cancellation.");
      return;
    }

    setCancelLoading(true);
    try {
      const collectionName =
        trip.type === "itinerary"
          ? "itineraryBookings"
          : trip.type === "promo"
            ? "promoBookings"
            : "bookings";

      const bookingRef = doc(
        db,
        collectionName,
        trip.id.split(":").pop() || trip.id,
      );

      const reasonLabel =
        CANCELLATION_REASONS.find((r) => r.id === selectedReason)?.label ||
        "Other";

      await updateDoc(bookingRef, {
        status: "cancelled",
        cancellationReason: reasonLabel,
        cancellationDetails: otherDetails.trim() || null,
        cancelledAt: new Date(),
      });

      setCancelSuccess(true);
      setCancelError(null);
      setCancelLoading(false);
    } catch (error) {
      setCancelError("Failed to cancel booking. Please try again.");
      setCancelLoading(false);
      console.error("Failed to cancel booking:", error);
    }
  };

  const renderCard = (trip: TravelRecord) => {
    const s = (trip.status || "").toLowerCase();
    const badge = statusConfig[s] || {
      color: "#6B7280",
      bg: "#E5E7EB",
      icon: "help-circle",
    };

    return (
      <View key={trip.id} style={styles.cardWrapper}>
        <TouchableOpacity
          onPress={() => setSelectedTrip(trip)}
          activeOpacity={0.7}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.destination}>
                  {trip.destination || "Booking"}
                </Text>
                <Text style={styles.cardMeta}>{trip.fullName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Ionicons name={badge.icon} size={12} color={badge.color} />
                <Text style={[styles.statusText, { color: badge.color }]}>
                  {trip.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>
                  {trip.departureDate
                    ? formatDate(trip.departureDate)
                    : "Date TBA"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>
                  {trip.location || "Philippines"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>
                  {trip.people ?? 1} traveler
                  {(trip.people ?? 1) !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={[styles.detailItem, { marginTop: 8 }]}>
                <Text style={styles.priceLabel}>Total</Text>
                <Text style={styles.priceText}>
                  ₱{trip.totalPrice?.toLocaleString() ?? 0}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Cancel action moved inside modal - external button removed */}
      </View>
    );
  };

  return (
    <View style={styles.bg}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Travel History</Text>
          <Text style={styles.subtitle}>Track all your bookings and trips</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["upcoming", "completed", "cancelled"] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterBtn,
                filter === status && styles.filterBtnActive,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === status && styles.filterTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {loading && <Text style={styles.loading}>Loading your trips...</Text>}
        {filteredTrips.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              Your {filter} trips will appear here
            </Text>
          </View>
        ) : (
          filteredTrips.map(renderCard)
        )}
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal visible={!!selectedTrip} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={30}
        >
          <View style={styles.modalBox}>
            {selectedTrip && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedTrip.destination || "Booking"}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedTrip.type === "itinerary"
                        ? "Itinerary Booking"
                        : selectedTrip.type === "promo"
                          ? "Promo Booking"
                          : "Trip Booking"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTrip(null);
                      resetCancelState();
                    }}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#111" />
                  </TouchableOpacity>
                </View>

                {cancelSuccess ? (
                  <View style={styles.cancelSuccessBox}>
                    <Text style={styles.cancelSuccessTitle}>
                      Booking cancelled successfully
                    </Text>
                    <Text style={styles.cancelSuccessText}>
                      Your booking has been cancelled and moved to the cancelled
                      history tab.
                    </Text>
                  </View>
                ) : cancelMode ? (
                  <View style={styles.cancelSection}>
                    <Text style={styles.cancelTitle}>
                      Why are you cancelling?
                    </Text>
                    <Text style={styles.cancelSubtitle}>
                      Please select a reason so we can improve our service.
                    </Text>

                    {CANCELLATION_REASONS.map((reason) => (
                      <TouchableOpacity
                        key={reason.id}
                        onPress={() => {
                          setSelectedReason(reason.id);
                          setCancelError(null);
                        }}
                        style={[
                          styles.reasonButton,
                          selectedReason === reason.id &&
                            styles.reasonButtonActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.reasonIcon,
                            selectedReason === reason.id &&
                              styles.reasonIconActive,
                          ]}
                        >
                          <Ionicons
                            name={reason.icon as any}
                            size={18}
                            color={
                              selectedReason === reason.id
                                ? "#B91C1C"
                                : "#6B7280"
                            }
                          />
                        </View>
                        <Text
                          style={
                            selectedReason === reason.id
                              ? styles.reasonTextActive
                              : styles.reasonText
                          }
                        >
                          {reason.label}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    {selectedReason === "other" && (
                      <View style={styles.otherDetailsBox}>
                        <Text style={styles.otherDetailsLabel}>
                          Additional details
                        </Text>
                        <TextInput
                          style={styles.otherDetailsInput}
                          placeholder="Tell us more..."
                          value={otherDetails}
                          onChangeText={setOtherDetails}
                          multiline
                          numberOfLines={4}
                        />
                      </View>
                    )}

                    {cancelError ? (
                      <Text style={styles.cancelError}>{cancelError}</Text>
                    ) : null}

                    <View style={styles.cancelButtonsRow}>
                      <TouchableOpacity
                        onPress={() => {
                          setCancelMode(false);
                          setSelectedReason(null);
                          setOtherDetails("");
                          setCancelError(null);
                        }}
                        style={[
                          styles.modalFooterBtn,
                          styles.closeBtn,
                          { marginRight: 12 },
                        ]}
                      >
                        <Text style={styles.closeBtnText}>Keep Booking</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => submitCancellation(selectedTrip)}
                        disabled={cancelLoading || !selectedReason}
                        style={[
                          styles.modalFooterBtn,
                          styles.cancelModalBtn,
                          (!selectedReason || cancelLoading) &&
                            styles.cancelModalBtnDisabled,
                        ]}
                      >
                        <Text
                          style={[styles.cancelModalText, { marginLeft: 0 }]}
                        >
                          Confirm Cancellation
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    {/* Traveler Info Section */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        Traveler Information
                      </Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>
                          {selectedTrip.fullName}
                        </Text>
                      </View>
                      {selectedTrip.email && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Email</Text>
                          <Text style={styles.infoValue}>
                            {selectedTrip.email}
                          </Text>
                        </View>
                      )}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>
                          {selectedTrip.location || "Philippines"}
                        </Text>
                      </View>
                    </View>

                    {/* Booking Info Section */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        Booking Information
                      </Text>
                      {selectedTrip.departureDate && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Departure Date</Text>
                          <Text style={styles.infoValue}>
                            {formatDate(selectedTrip.departureDate)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Travelers</Text>
                        <Text style={styles.infoValue}>
                          {selectedTrip.people ?? 1}
                        </Text>
                      </View>
                      {selectedTrip.specialRequests && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Special Requests</Text>
                          <Text style={styles.infoValue}>
                            {selectedTrip.specialRequests}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Payment Info Section */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        Payment Information
                      </Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Price</Text>
                        <Text style={styles.priceValue}>
                          ₱{selectedTrip.totalPrice?.toLocaleString() ?? 0}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View
                          style={[
                            styles.statusBadgeSmall,
                            {
                              backgroundColor:
                                statusConfig[
                                  (selectedTrip.status || "").toLowerCase()
                                ]?.bg || "#E5E7EB",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  statusConfig[
                                    (selectedTrip.status || "").toLowerCase()
                                  ]?.color || "#6B7280",
                              },
                            ]}
                          >
                            {selectedTrip.status.replace("_", " ")}
                          </Text>
                        </View>
                      </View>
                      {selectedTrip.createdAt && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Booked Date</Text>
                          <Text style={styles.infoValue}>
                            {formatDate(selectedTrip.createdAt)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Receipt */}
                    {selectedTrip.proofUrl && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>Payment Receipt</Text>
                        <Image
                          source={{ uri: selectedTrip.proofUrl }}
                          style={styles.receiptImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    {/* Footer Buttons */}
                    <View style={styles.modalFooterRow}>
                      <TouchableOpacity
                        onPress={() => setSelectedTrip(null)}
                        style={[
                          styles.modalFooterBtn,
                          styles.closeBtn,
                          { marginRight: 12 },
                        ]}
                      >
                        <Text style={styles.closeBtnText}>Close</Text>
                      </TouchableOpacity>

                      {isUpcomingish(
                        (selectedTrip.status || "").toLowerCase(),
                      ) && (
                        <TouchableOpacity
                          onPress={() => handleCancelTrip(selectedTrip)}
                          style={[styles.modalFooterBtn, styles.cancelModalBtn]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#B91C1C"
                          />
                          <Text style={styles.cancelModalText}>
                            Cancel Trip
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 16 },

  // Header Styles
  headerContainer: { marginTop: 50, marginBottom: 32, alignItems: "center" },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },

  // Filter Styles
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 28,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  filterBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#1D4ED8",
  },
  filterText: { fontWeight: "600", color: "#6B7280", fontSize: 14 },
  filterTextActive: { color: "white" },

  // Card Styles
  cardWrapper: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  destination: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },

  // Card Divider
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },

  /* external cancel styles removed; modal cancel button remains */

  // Card Details
  cardDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 4,
  },

  // Loading and Empty States
  loading: {
    textAlign: "center",
    marginVertical: 32,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: "center",
    color: "#111827",
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Modal Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  modalCloseBtn: {
    padding: 8,
    marginRight: -8,
  },

  // Modal Section
  modalSection: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  priceValue: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },

  // Status Badge Small
  statusBadgeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Receipt Image
  receiptImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },

  // Close Button
  closeBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  closeBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  modalFooterRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  modalFooterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelModalBtn: {
    backgroundColor: "#FEF2F2",
  },
  cancelModalBtnDisabled: {
    opacity: 0.5,
  },
  cancelModalText: {
    color: "#B91C1C",
    fontWeight: "700",
    marginLeft: 6,
  },
  cancelSuccessBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cancelSuccessTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#047857",
    marginBottom: 8,
  },
  cancelSuccessText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
  },
  cancelSection: {
    marginBottom: 24,
  },
  cancelTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  cancelSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 18,
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  reasonButtonActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  reasonIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  reasonIconActive: {
    backgroundColor: "#FECACA",
  },
  reasonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  reasonTextActive: {
    color: "#991B1B",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  otherDetailsBox: {
    marginTop: 16,
    marginBottom: 12,
  },
  otherDetailsLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  otherDetailsInput: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    textAlignVertical: "top",
    color: "#111827",
  },
  cancelButtonsRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  keepBtn: {
    backgroundColor: "#2563EB",
  },
  keepBtnText: {
    color: "white",
    fontWeight: "700",
  },
  cancelError: {
    color: "#B91C1C",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});
