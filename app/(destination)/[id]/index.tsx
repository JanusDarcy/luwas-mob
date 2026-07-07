import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../../../src/lib/firebase";

// 🔹 Import modular components
import NearbySpots from "../../../components/(destination-calls)/NearbySpots";
import TravelerReviews from "../../../components/(destination-calls)/TravelerReviews";
import WeatherInsights from "../../../components/(destination-calls)/WeatherInsights";

const { height } = Dimensions.get("window");

interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
}

export default function DestinationDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "destinations", id));
        if (snap.exists()) {
          setDestination({ id: snap.id, ...snap.data() } as Destination);
        }
      } catch (err) {
        console.error("❌ Error fetching destination:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!destination) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Destination not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* Hero */}
        <View>
          <ImageBackground
            source={{ uri: destination.imageUrl }}
            style={styles.heroImage}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: scrollY.interpolate({
                    inputRange: [0, 200],
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <BlurView
                intensity={60}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Info Card */}
        <View style={styles.infoCardWrapper}>
          <BlurView intensity={70} tint="light" style={styles.infoCard}>
            {/* Title + Price */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>{destination.name}</Text>
                <Text style={styles.location}>{destination.location}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.price}>
                  ₱{Number(destination.price).toLocaleString()}
                </Text>
                <Text style={styles.perPerson}>Per person</Text>
              </View>
            </View>

            <Text style={styles.description}>{destination.description}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/${id}/packages`)}
              >
                <Ionicons name="briefcase-outline" size={18} color="#2563EB" />
                <Text style={styles.actionText}>Packages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/${id}/customize`)}
              >
                <Ionicons name="create-outline" size={18} color="#2563EB" />
                <Text style={styles.actionText}>Plan Trip</Text>
              </TouchableOpacity>
            </View>

            {/* Modular components */}
            <TravelerReviews
              name={destination.name}
              location={destination.location}
            />

            <Text style={styles.sectionTitle}>Nearby Spots</Text>
            <NearbySpots
              lat={destination.latitude}
              lon={destination.longitude}
            />

            <WeatherInsights
              name={destination.name}
              location={destination.location}
            />

            {/* Map */}
            <View style={styles.mapBox}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                  }}
                  title={destination.name}
                />
              </MapView>
            </View>
          </BlurView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heroImage: { width: "100%", height: height * 0.45 },
  topBar: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  infoCardWrapper: {
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  infoCard: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  location: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  description: { fontSize: 15, color: "#374151", marginVertical: 12 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  price: { fontSize: 20, fontWeight: "700", color: "#2563EB" },
  perPerson: { fontSize: 13, color: "#6b7280" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginVertical: 10,
  },
  mapBox: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    height: 160,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 16, color: "red" },
});
