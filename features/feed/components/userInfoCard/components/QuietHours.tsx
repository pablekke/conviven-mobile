import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface QuietHoursProps {
  start: number;
  end: number;
}

export const QuietHours: React.FC<QuietHoursProps> = ({ start, end }) => {
  const ss = String(start).padStart(2, "0");
  const ee = String(end).padStart(2, "0");
  return (
    <View style={styles.quiet}>
      <Text style={styles.quietText}>
        🌙 Tranquila {ss}–{ee}h
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  quiet: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(224, 242, 254, 0.6)",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.2)",
  },
  quietText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0284C7",
  },
});

