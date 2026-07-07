// app/(promos)/[id]/book.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from "../../../src/lib/firebase";

interface Promo {
  title: string;
  finalPrice: number;
  discountPercentage?: number;
  imageUrl?: string;
  endDate?: string;
}

export default function PromoBookingForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);

  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    localAddress: "",
    departureDate: "",
    returnDate: "",
    travelers: 1,
    specialRequests: "",
  });

  const [showDatePicker, setShowDatePicker] = useState<{
    type: "departure" | "return" | null;
  }>({ type: null });

  const [showSpecialRequests, setShowSpecialRequests] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || currentUser.displayName || "",
          email: prev.email || currentUser.email || "",
        }));
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Fetch promo details
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "promos", id));
        if (snap.exists()) {
          setPromo(snap.data() as Promo);
        } else {
          Alert.alert("Error", "Promo not found.");
        }
      } catch (err) {
        Alert.alert("Error", "Failed to fetch promo.");
        console.error(err);
      }
    };

    fetchPromo();
  }, [id]);

  const handleDateConfirm = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    if (showDatePicker.type === "departure") {
      setFormData((prev) => ({ ...prev, departureDate: formatted }));
    } else if (showDatePicker.type === "return") {
      setFormData((prev) => ({ ...prev, returnDate: formatted }));
    }
    setShowDatePicker({ type: null });
  };

  const handleTravelerChange = (increment: number) => {
    setFormData((prev) => ({
      ...prev,
      travelers: Math.max(1, prev.travelers + increment),
    }));
  };

  const handleSubmit = async () => {
    if (!promo) return;

    if (!formData.departureDate) {
      Alert.alert("Error", "Please select a departure date.");
      return;
    }

    setLoading(true);

    try {
      // 💰 Compute prices
      const price = promo.finalPrice || 0;
      const totalPrice = formData.travelers * price;

      // ✅ Unified data (same as web)
      const bookingData = {
        ...formData,
        userId: user?.uid,
        promoId: id,
        promoTitle: promo.title,
        price, // 🔥 include price per traveler
        totalPrice, // 🔥 include total amount
        status: "pending_payment",
        createdAt: serverTimestamp(),
      };

      // ✅ Save to Firestore
      const docRef = await addDoc(collection(db, "promoBookings"), bookingData);

      Alert.alert(
        "Success",
        `Booking created! Total: ₱${totalPrice.toLocaleString()}\nRedirecting to payment...`,
      );

      // ✅ Redirect to payment page
      router.push(
        `/(promos)/${id}/pay?bookingId=${docRef.id}&title=${encodeURIComponent(
          promo.title,
        )}&type=promo&amount=${totalPrice}`,
      );
    } catch (err) {
      console.error("Booking error:", err);
      Alert.alert("Error", "Something went wrong while booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!promo) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const totalPrice = formData.travelers * (promo.finalPrice || 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image */}
        <ImageBackground
          source={{ uri: promo.imageUrl }}
          style={styles.heroImage}
          imageStyle={{
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>{promo.title}</Text>
            <Text style={styles.heroPrice}>
              ₱{promo.finalPrice.toLocaleString()}
            </Text>
          </View>
        </ImageBackground>

        {/* Step Indicator */}
        <Text style={styles.stepIndicator}>
          Step 1 of 2: Traveler Information
        </Text>

        {/* Traveler Info Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Traveler Information</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in your details to confirm your reservation
          </Text>

          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(v) => setFormData({ ...formData, fullName: v })}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(v) => setFormData({ ...formData, email: v })}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(v) => setFormData({ ...formData, phone: v })}
            />
          </View>

          {/* Local Address */}
          <View style={styles.inputWrapper}>
            <Ionicons name="home-outline" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Local Address"
              value={formData.localAddress}
              onChangeText={(v) =>
                setFormData({ ...formData, localAddress: v })
              }
            />
          </View>

          {/* Dates */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={[styles.inputWrapper, { flex: 1 }]}
              onPress={() => setShowDatePicker({ type: "departure" })}
            >
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={[styles.input, { paddingTop: 12 }]}>
                {formData.departureDate || "Departure Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inputWrapper, { flex: 1 }]}
              onPress={() => setShowDatePicker({ type: "return" })}
            >
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={[styles.input, { paddingTop: 12 }]}>
                {formData.returnDate || "Return Date"}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={!!showDatePicker.type}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker({ type: null })}
          />

          {/* Travelers Stepper */}
          <Text style={styles.label}>Travelers</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleTravelerChange(-1)}
            >
              <Text style={styles.stepText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.travelerCount}>{formData.travelers}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleTravelerChange(1)}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Price Summary */}
          <View style={styles.priceBox}>
            <Ionicons name="cash-outline" size={20} color="#2563EB" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.priceText}>
                Price per traveler: ₱{promo.finalPrice.toLocaleString()}
              </Text>
              <Text style={styles.totalPrice}>
                Total: ₱{totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Special Requests */}
          <TouchableOpacity
            onPress={() => setShowSpecialRequests(!showSpecialRequests)}
          >
            <Text style={styles.toggleSpecial}>
              {showSpecialRequests
                ? "Hide Special Requests"
                : "+ Add Special Requests"}
            </Text>
          </TouchableOpacity>

          {showSpecialRequests && (
            <TextInput
              style={[
                styles.input,
                { height: 80, textAlignVertical: "top", marginTop: 8 },
              ]}
              placeholder="Special Requests (optional)"
              multiline
              value={formData.specialRequests}
              onChangeText={(v) =>
                setFormData({ ...formData, specialRequests: v })
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Sticky Confirm Button */}
      <View style={styles.stickyButtonWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.note}>Secure payment via GCash on next step</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroImage: { width: "100%", height: 240, justifyContent: "flex-end" },
  heroTextBox: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  heroPrice: { fontSize: 16, color: "#fcd34d", marginTop: 2 },
  stepIndicator: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    marginBottom: 4,
  },
  form: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  sectionSubtitle: { fontSize: 13, color: "#666", marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  input: { flex: 1, padding: 10, fontSize: 14, color: "#111" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 8, marginBottom: 6 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 20, fontWeight: "700", color: "#2563EB" },
  travelerCount: { marginHorizontal: 16, fontSize: 16, fontWeight: "700" },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  priceText: { fontSize: 14, color: "#2563EB" },
  totalPrice: { fontSize: 16, fontWeight: "700", color: "#1E40AF" },
  toggleSpecial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 8,
  },
  stickyButtonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { fontSize: 12, color: "#888", textAlign: "center" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
});
