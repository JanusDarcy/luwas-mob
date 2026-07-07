import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ActivityCard from "../../../components/ActivityCard";
import DaySelector from "../../../components/DaySelector";
import FilterPills from "../../../components/FilterPills";
import SummaryCard from "../../../components/SummaryCard";
import { useActivities } from "../../../hooks/useActivities";
import { useCustomItinerary } from "../../../hooks/useCustomItinerary";
import {
  ACTIVITY_CATEGORIES,
  filterByCategory,
  filterBySearch,
} from "../../../src/lib/activities";
import { fetchDestination } from "../../../src/lib/firestore";
import { db } from "../../../src/lib/firebase";
import type { Activity } from "../../../types/shared";

export default function CustomizeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activities, loading, error, retry } = useActivities(id || "");
  const { itinerary, init, addActivity, removeActivity, setTravelers, isSelected } =
    useCustomItinerary();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [destLoading, setDestLoading] = useState(true);
  const [dayPicker, setDayPicker] = useState<{ visible: boolean; activity: Activity | null }>({
    visible: false,
    activity: null,
  });

  useEffect(() => {
    if (!id) return;
    fetchDestination(db, id).then((dest) => {
      if (dest) init({ destinationId: dest.id, destination: dest.name, location: dest.location });
      setDestLoading(false);
    });
  }, [id, init]);

  const filtered = useMemo(
    () => filterByCategory(filterBySearch(activities, search), category),
    [activities, search, category]
  );

  const handleActivityPress = useCallback(
    (activity: Activity) => {
      if (isSelected(activity.id)) {
        removeActivity(activity.id);
      } else {
        setDayPicker({ visible: true, activity });
      }
    },
    [isSelected, removeActivity]
  );

  const handleContinue = async () => {
    if (itinerary.chosenActivities.length === 0) {
      Alert.alert("No activities", "Select at least one activity to continue.");
      return;
    }
    await AsyncStorage.setItem(`customItinerary_${id}`, JSON.stringify(itinerary));
    const perPerson = itinerary.totalBudget / itinerary.travelers;
    router.push(
      `/${id}/book?tripType=custom&price=${perPerson}&totalPrice=${itinerary.totalBudget}&title=${encodeURIComponent(`${itinerary.destination} Custom Trip`)}`
    );
  };

  if (loading || destLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load activities</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: activities[0]?.imageUrl || "https://via.placeholder.com/800x300" }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Plan Your Trip</Text>
        <Text style={styles.heroSub}>{itinerary.destination}</Text>
      </ImageBackground>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FilterPills
        options={ACTIVITY_CATEGORIES}
        selected={category}
        onSelect={setCategory}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            selected={isSelected(item.id)}
            onPress={() => handleActivityPress(item)}
          />
        )}
      />

      <SummaryCard
        count={itinerary.travelers}
        totalBudget={itinerary.totalBudget}
        activityCount={itinerary.chosenActivities.length}
        onTravelerChange={(d) => setTravelers(itinerary.travelers + d)}
        onContinue={handleContinue}
        disabled={itinerary.chosenActivities.length === 0}
      />

      <DaySelector
        visible={dayPicker.visible}
        onClose={() => setDayPicker({ visible: false, activity: null })}
        onSelect={(day) => dayPicker.activity && addActivity(dayPicker.activity, day)}
        title={dayPicker.activity ? `Add "${dayPicker.activity.title}"` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { height: 160, justifyContent: "flex-end", padding: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff", zIndex: 1 },
  heroSub: { fontSize: 14, color: "#fcd34d", zIndex: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: { flex: 1, padding: 12, fontSize: 14 },
  list: { padding: 16, paddingBottom: 140 },
  error: { color: "#ef4444", marginBottom: 12 },
  retryBtn: { backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "600" },
});
