import React, { memo } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS } from "../src/lib/activities";
import type { Activity } from "../types/shared";

interface Props {
  activity: Activity;
  selected: boolean;
  onPress: () => void;
}

function ActivityCard({ activity, selected, onPress }: Props) {
  const catColor = CATEGORY_COLORS[activity.category || ""] || "#6b7280";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <ImageBackground
        source={{ uri: activity.imageUrl || "https://via.placeholder.com/120" }}
        style={styles.thumb}
        imageStyle={{ borderRadius: 12 }}
      />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
          {activity.category ? (
            <View style={[styles.badge, { backgroundColor: catColor }]}>
              <Text style={styles.badgeText}>{activity.category}</Text>
            </View>
          ) : null}
        </View>
        {activity.description ? (
          <Text style={styles.desc} numberOfLines={2}>{activity.description}</Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.price}>₱{activity.price.toLocaleString()}</Text>
          {activity.durationHours ? (
            <Text style={styles.duration}>{activity.durationHours}h</Text>
          ) : null}
          {activity.dayRecommendation ? (
            <Text style={styles.day}>Day {activity.dayRecommendation}</Text>
          ) : null}
        </View>
      </View>
      {selected && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
    </TouchableOpacity>
  );
}

export default memo(ActivityCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardSelected: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  thumb: { width: 72, height: 72 },
  info: { flex: 1, marginLeft: 10, justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  desc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  meta: { flexDirection: "row", gap: 10, marginTop: 4, alignItems: "center" },
  price: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  duration: { fontSize: 12, color: "#9ca3af" },
  day: { fontSize: 12, color: "#9ca3af" },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  checkText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
