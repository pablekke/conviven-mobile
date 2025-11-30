import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../../../context/ThemeContext";
import { useNeighborhood } from "./hooks/useNeighborhood";

interface MainNeighborhoodCardProps {
  neighborhoodId: string | null;
  onPress: () => void;
  cachedFilters?: any | null;
}

export const MainNeighborhoodCard: React.FC<MainNeighborhoodCardProps> = ({
  neighborhoodId,
  onPress,
  cachedFilters,
}) => {
  const { colors } = useTheme();
  const { neighborhood, loading } = useNeighborhood({ neighborhoodId, cachedFilters });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: neighborhoodId ? colors.primary : colors.border,
          borderWidth: neighborhoodId ? 2 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: neighborhoodId ? colors.primary + "20" : colors.muted,
              },
            ]}
          >
            <Feather
              name="map-pin"
              size={18}
              color={neighborhoodId ? colors.primary : colors.mutedForeground}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Barrio principal</Text>
            {loading && !neighborhood ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : neighborhood ? (
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {neighborhood.name}
              </Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>
                Seleccionar barrio principal
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
