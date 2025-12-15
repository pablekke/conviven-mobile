import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";
import { useNeighborhood } from "./hooks/useNeighborhood";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface MainNeighborhoodCardProps {
  neighborhoodId: string | null | undefined;
  onPress: () => void;
  cachedFilters?: any | null;
  label?: string;
  isFilterMode?: boolean;
  userLocation?: { neighborhood?: { id: string; name: string } | null } | null;
}

export const MainNeighborhoodCard: React.FC<MainNeighborhoodCardProps> = ({
  neighborhoodId,
  onPress,
  cachedFilters,
  label,
  isFilterMode = false,
  userLocation,
}) => {
  const { colors } = useTheme();
  const { neighborhood: cachedNeighborhood, loading } = useNeighborhood({
    neighborhoodId: neighborhoodId || null,
    cachedFilters,
  });

  // Use userLocation data if available, otherwise use cached data
  const neighborhood = userLocation?.neighborhood || cachedNeighborhood;
  const isLoading = !userLocation && loading;

  const defaultLabel = isFilterMode ? "Barrio principal" : "Ubicación";
  const displayLabel = label || defaultLabel;
  const placeholderText = isFilterMode
    ? "Seleccionar barrio principal (obligatorio)"
    : "Seleccionar ubicación";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.primary,
        },
        isFilterMode && styles.cardBorder,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.primary + "20",
              },
            ]}
          >
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{displayLabel}</Text>
            {isLoading && !neighborhood ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : neighborhood ? (
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {neighborhood.name}
              </Text>
            ) : !neighborhoodId ? (
              <Text
                style={[
                  styles.placeholder,
                  { color: isFilterMode ? colors.destructive : colors.mutedForeground },
                ]}
              >
                {placeholderText}
              </Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>
                Cargando...
              </Text>
            )}
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardBorder: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  placeholder: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
  },
  loader: {
    marginTop: 4,
  },
});
