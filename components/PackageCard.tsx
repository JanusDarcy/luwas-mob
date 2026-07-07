import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { TripPackage } from "../types/shared";

interface Props {
  pkg: TripPackage;
  onPress: () => void;
}

export default function PackageCard({ pkg, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <ImageBackground
        source={{ uri: pkg.imageUrl || "https://via.placeholder.com/400x200" }}
        style={styles.image}
        imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <View style={styles.overlay} />
        <Text style={styles.price}>₱{pkg.price.toLocaleString()}/person</Text>
      </ImageBackground>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{pkg.title}</Text>
        <Text style={styles.duration}>{pkg.duration}</Text>
        {pkg.packageLocation ? (
          <Text style={styles.location}>{pkg.packageLocation}</Text>
        ) : null}
        {pkg.inclusions?.length > 0 && (
          <Text style={styles.inclusion} numberOfLines={2}>
            {pkg.inclusions.slice(0, 3).join(" · ")}
          </Text>
        )}
        <View style={styles.btn}>
          <Text style={styles.btnText}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { height: 160, justifyContent: "flex-end", padding: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  price: { color: "#fcd34d", fontWeight: "700", fontSize: 14, zIndex: 1 },
  body: { padding: 14 },
  title: { fontSize: 17, fontWeight: "700", color: "#111" },
  duration: { fontSize: 13, color: "#2563EB", marginTop: 4 },
  location: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  inclusion: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  btn: {
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#2563EB", fontWeight: "600", fontSize: 14 },
});
