import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ChipProps {
  label: string;
  subtle?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, subtle }) => (
  <View style={[styles.chip, subtle && styles.chipSubtle]}>
    <Text style={[styles.chipText, subtle && styles.chipTextSubtle]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSubtle: {
    backgroundColor: "rgba(239, 246, 255, 0.7)",
    borderColor: "rgba(219, 234, 254, 0.8)",
  },
  chipText: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextSubtle: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
