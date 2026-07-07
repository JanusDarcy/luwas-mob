import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterPills({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={options}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = item === selected;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.text, active && styles.textActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  list: { paddingHorizontal: 16, gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  pillActive: { backgroundColor: "#2563EB" },
  text: { fontSize: 13, fontWeight: "600", color: "#374151" },
  textActive: { color: "#fff" },
});
