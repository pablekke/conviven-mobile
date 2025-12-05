import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BoolPillProps {
  yes: boolean;
  yesLabel: string;
  noLabel: string;
}

export const BoolPill: React.FC<BoolPillProps> = ({ yes, yesLabel, noLabel }) => (
  <View style={[styles.pill, yes ? styles.pillYes : styles.pillNo]}>
    <Text style={[styles.pillText, yes ? styles.pillTextYes : styles.pillTextNo]}>
      {yes ? "✔️ " : "✖️ "}
      {yes ? yesLabel : noLabel}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillYes: {
    backgroundColor: "rgba(220, 252, 231, 0.6)",
    borderColor: "rgba(22, 163, 74, 0.2)",
  },
  pillNo: {
    backgroundColor: "rgba(241, 245, 249, 0.6)",
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextYes: {
    color: "#15803D",
  },
  pillTextNo: {
    color: "#64748B",
  },
});
