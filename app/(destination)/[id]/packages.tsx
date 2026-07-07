import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FilterPills from "../../../components/FilterPills";
import PackageCard from "../../../components/PackageCard";
import { useDestinationPackages } from "../../../hooks/useDestinationPackages";
import { getAvailablePlaces } from "../../../src/lib/activities";

export default function PackagesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { packages, loading, error, refreshing, refresh, retry } = useDestinationPackages(id || "");
  const [placeFilter, setPlaceFilter] = useState("All Packages");

  const places = useMemo(() => ["All Packages", ...getAvailablePlaces(packages)], [packages]);

  const filtered = useMemo(() => {
    if (placeFilter === "All Packages") return packages;
    const lower = placeFilter.toLowerCase();
    return packages.filter(
      (p) =>
        p.packageLocation?.toLowerCase() === lower ||
        p.destinationLocation?.toLowerCase() === lower
    );
  }, [packages, placeFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load packages</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: packages[0]?.imageUrl || "https://via.placeholder.com/800x300" }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Trip Packages</Text>
      </ImageBackground>

      <FilterPills options={places} selected={placeFilter} onSelect={setPlaceFilter} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>No packages available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PackageCard
            pkg={item}
            onPress={() =>
              router.push(
                `/${id}/book?tripType=package&packageId=${item.id}&price=${item.price}&title=${encodeURIComponent(item.title)}`
              )
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  hero: { height: 180, justifyContent: "flex-end", padding: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#fff", zIndex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  errorText: { color: "#ef4444", marginBottom: 12 },
  retryBtn: { backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "600" },
  empty: { color: "#6b7280", fontSize: 15 },
});
