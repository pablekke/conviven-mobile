import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MiniChipProps {
  children: React.ReactNode;
}

export const MiniChip: React.FC<MiniChipProps> = ({ children }) => (
  <View style={styles.miniChip}>
    <Text style={styles.miniChipText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  miniChip: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  miniChipText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "600",
  },
});
