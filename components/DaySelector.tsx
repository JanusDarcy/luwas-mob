import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  maxDays?: number;
  onSelect: (day: number) => void;
  onClose: () => void;
  title?: string;
}

export default function DaySelector({
  visible,
  maxDays = 7,
  onSelect,
  onClose,
  title = "Assign to Day",
}: Props) {
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.grid}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.dayBtn}
                onPress={() => {
                  onSelect(day);
                  onClose();
                }}
              >
                <Text style={styles.dayText}>Day {day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  dayBtn: {
    width: "28%",
    paddingVertical: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignItems: "center",
  },
  dayText: { fontWeight: "600", color: "#2563EB" },
  cancel: { marginTop: 16, alignItems: "center", padding: 12 },
  cancelText: { color: "#6b7280", fontWeight: "600" },
});
