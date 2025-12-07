import { useNeighborhoodsByIds } from "./hooks/useNeighborhoodsByIds";
import { useTheme } from "../../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

interface NeighborhoodChipsProps {
  neighborhoodIds: string[];
  onNeighborhoodsChange?: (ids: string[]) => void;
  editable?: boolean;
  cachedFilters?: any | null;
}

export const NeighborhoodChips: React.FC<NeighborhoodChipsProps> = ({
  neighborhoodIds,
  onNeighborhoodsChange,
  editable = true,
  cachedFilters,
}) => {
  const { colors } = useTheme();
  const { neighborhoods, loading, error } = useNeighborhoodsByIds({
    neighborhoodIds,
    cachedFilters,
  });
  
  const handleRemove = (id: string) => {
    if (!editable || !onNeighborhoodsChange) return;
    const newIds = neighborhoodIds.filter(neighborhoodId => neighborhoodId !== id);
    onNeighborhoodsChange(newIds);
  };

  if (loading && neighborhoodIds.length > 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
      </View>
    );
  }

  if (neighborhoods.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No hay barrios seleccionados
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {neighborhoods.map(neighborhood => (
        <View
          key={neighborhood.id}
          style={[
            styles.chip,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.chipText, { color: colors.foreground }]} numberOfLines={1}>
            {neighborhood.name}
          </Text>
          {editable && onNeighborhoodsChange && (
            <TouchableOpacity
              onPress={() => handleRemove(neighborhood.id)}
              style={styles.removeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    maxWidth: 200,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    flexShrink: 1,
  },
  removeButton: {
    marginLeft: 2,
    padding: 2,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
});
