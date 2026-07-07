import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  count: number;
  totalBudget: number;
  activityCount: number;
  onContinue: () => void;
  disabled?: boolean;
  onTravelerChange: (delta: number) => void;
}

export default function SummaryCard({
  count,
  totalBudget,
  activityCount,
  onContinue,
  disabled,
  onTravelerChange,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>{activityCount} activities selected</Text>
          <Text style={styles.total}>₱{totalBudget.toLocaleString()}</Text>
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onTravelerChange(-1)}>
            <Text style={styles.stepText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.travelers}>{count} travelers</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onTravelerChange(1)}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={onContinue}
        disabled={disabled}
      >
        <Text style={styles.btnText}>Continue to Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  label: { fontSize: 13, color: "#6b7280" },
  total: { fontSize: 20, fontWeight: "700", color: "#2563EB" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
  travelers: { fontSize: 13, fontWeight: "600" },
  btn: { backgroundColor: "#2563EB", borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  btnDisabled: { backgroundColor: "#93c5fd" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
