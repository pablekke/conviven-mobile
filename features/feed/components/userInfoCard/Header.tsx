import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  budgetFull: string;
}

export const Header: React.FC<HeaderProps> = ({ budgetFull }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Sobre mí</Text>
    <View style={styles.budgetContainer}>
      <Text style={styles.budgetValue}>{budgetFull}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.8,
  },
  budgetContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  budgetLabel: {
    fontSize: 9,
    color: "#3B82F6",
    textTransform: "uppercase",
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
  },
});
