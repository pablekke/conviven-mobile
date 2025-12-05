import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface RowProps {
  label: string;
  value: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export const Row: React.FC<RowProps> = ({ label, value, style, labelStyle, valueStyle }) => {
  if (!value) return null;

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.rowLabel, labelStyle]}>{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
      ) : (
        <View>{value}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: "#60A5FA",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  rowValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    lineHeight: 22,
  },
});
