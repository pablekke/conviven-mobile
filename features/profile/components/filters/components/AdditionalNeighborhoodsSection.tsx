import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NeighborhoodChips } from "../neighborhoods/NeighborhoodChips";
import { useTheme } from "../../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";

interface AdditionalNeighborhoodsSectionProps {
  preferredLocations: string[];
  onAddPress: () => void;
  onNeighborhoodsChange: (neighborhoodIds: string[]) => void;
  cachedFilters: any | null;
}

export const AdditionalNeighborhoodsSection = memo(
  ({
    preferredLocations,
    onAddPress,
    onNeighborhoodsChange,
    cachedFilters,
  }: AdditionalNeighborhoodsSectionProps) => {
    const { colors } = useTheme();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Barrios adicionales</Text>
          <TouchableOpacity
            onPress={onAddPress}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Agregar</Text>
          </TouchableOpacity>
        </View>
        <NeighborhoodChips
          neighborhoodIds={preferredLocations}
          onNeighborhoodsChange={onNeighborhoodsChange}
          editable
          cachedFilters={cachedFilters}
        />
      </View>
    );
  },
);

AdditionalNeighborhoodsSection.displayName = "AdditionalNeighborhoodsSection";

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
