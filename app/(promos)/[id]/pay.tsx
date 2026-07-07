// app/(itineraries)/[id]/pay.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db, storage } from "../../../src/lib/firebase";

export default function PromoPayPage() {
  const { bookingId, title } = useLocalSearchParams<{
    bookingId: string;
    title: string;
  }>();
  const router = useRouter();
  const auth = getAuth();

  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setUser(currentUser);
      }
    });
    return unsubscribe;
  }, []);

  // 📸 Pick proof of payment
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 📤 Upload proof to Firebase
  const handleUpload = async () => {
    if (!image || !bookingId || !user) return;
    setLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const proofRef = ref(
        storage,
        `promoProofs/${bookingId}/${Date.now()}.jpg`,
      );
      await uploadBytes(proofRef, blob);
      const proofUrl = await getDownloadURL(proofRef);

      const bookingRef = doc(db, "promoBookings", bookingId);
      await updateDoc(bookingRef, {
        proofUrl,
        status: "awaiting_approval",
        paidAt: serverTimestamp(),
        paidBy: {
          uid: user.uid,
          name: user.displayName || "Guest",
          email: user.email || "",
        },
      });

      Alert.alert("✅ Success", "Payment proof submitted!");
      router.push(
        `/booking-success?type=promo&title=${encodeURIComponent(
          title || "Promo",
        )}`,
      );
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("❌ Error", "Failed to submit payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <View style={styles.center}>
        <Text>⚠️ Invalid booking reference.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Ionicons name="card-outline" size={60} color="#2563EB" />
        <Text style={styles.title}>Complete Your Payment</Text>
        <Text style={styles.subtitle}>
          Pay via GCash and upload your proof of payment.
        </Text>

        {/* QR Section */}
        <View style={styles.qrBox}>
          <Image
            source={require("../../../assets/images/gcash-qr.jpeg")}
            style={styles.qrImage}
          />
          <Text style={styles.qrText}>
            Send payment to:{" "}
            <Text style={{ fontWeight: "700", color: "#2563EB" }}>
              0977-698-0768
            </Text>
          </Text>
        </View>

        {/* Upload Section */}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={20} color="#2563EB" />
          <Text style={styles.uploadText}>
            {image ? "Change File" : "Upload Proof of Payment"}
          </Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.preview} />}

        <Text style={styles.note}>
          Once submitted, your itinerary booking will be reviewed. You’ll get a
          receipt via email after approval.
        </Text>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.button, (!image || loading) && { opacity: 0.5 }]}
          onPress={handleUpload}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 140,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 12 },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  qrBox: {
    marginTop: 10,
    alignItems: "center",
    padding: 18,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    elevation: 2,
  },
  qrImage: { width: 220, height: 220, resizeMode: "contain" },
  qrText: { fontSize: 14, marginTop: 10, color: "#333" },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  uploadText: { marginLeft: 8, color: "#2563EB", fontWeight: "600" },
  preview: { marginTop: 16, width: 220, height: 220, borderRadius: 12 },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
});
