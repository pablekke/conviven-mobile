import { useTheme } from "../../../../../context/ThemeContext";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";

export const NeighborhoodsSectionHeader = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Feather name="map-pin" size={16} color={colors.primary} />
      <Text style={[styles.title, { color: colors.foreground }]}>Ubicación preferida</Text>
    </View>
  );
});

NeighborhoodsSectionHeader.displayName = "NeighborhoodsSectionHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});
