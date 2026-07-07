import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface WeatherData {
  bestTime?: { label: string; reason: string; emoji: string }[];
  weatherInfo?: { label: string; months: string; temperature: string }[];
}

const API_BASE = "https://luwas-travel-app.vercel.app";

export default function WeatherInsights({
  name,
  location,
}: {
  name: string;
  location: string;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/ai/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name, location }),
    })
      .then((res) => res.json())
      .then((json) => setWeather(json))
      .catch((err) => console.error("❌ Weather API error:", err))
      .finally(() => setLoading(false));
  }, [name, location]);

  if (loading) return <ActivityIndicator size="large" color="#2563EB" />;
  if (!weather)
    return <Text style={styles.placeholder}>No weather info available.</Text>;

  const bestTime = weather.bestTime ?? [];
  const weatherInfo = weather.weatherInfo ?? [];

  if (bestTime.length === 0 && weatherInfo.length === 0) {
    return <Text style={styles.placeholder}>No weather info available.</Text>;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Weather Insights</Text>

      {/* Best Time to Visit */}
      {bestTime.map((t, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{t.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.label}</Text>
            <Text style={styles.reason}>{t.reason}</Text>
          </View>
        </View>
      ))}

      {/* General Weather Info */}
      {weatherInfo.map((w, i) => (
        <View key={i} style={styles.card}>
          <Ionicons name="cloud-outline" size={20} color="#2563EB" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.label}>{w.label}</Text>
            <Text style={styles.reason}>
              {w.months} — {w.temperature}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  emoji: { fontSize: 22, marginRight: 10 },
  label: { fontSize: 15, fontWeight: "600", color: "#111" },
  reason: { fontSize: 14, color: "#555" },
  placeholder: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    marginVertical: 10,
  },
});
