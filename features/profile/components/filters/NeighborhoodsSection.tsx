import { useNeighborhoodsSection } from "./neighborhoods/hooks/useNeighborhoodsSection";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { SearchFiltersFormData } from "../../services/searchFiltersService";
import { NeighborhoodChips, MainNeighborhoodCard } from "./neighborhoods";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface NeighborhoodsSectionProps {
  openSelectionModal: (key: string) => void;
  formData: SearchFiltersFormData;
  updateFormData: (field: keyof SearchFiltersFormData, value: any) => void;
}

export const NeighborhoodsSection: React.FC<NeighborhoodsSectionProps> = ({
  openSelectionModal,
  formData,
  updateFormData,
}) => {
  const { colors } = useTheme();
  const {
    mainPreferredNeighborhoodId,
    preferredLocations,
    includeAdjacentNeighborhoods,
    loadingAdjacents,
    isMontevideo,
    cachedFilters,
    updatepreferredLocations,
    updateIncludeAdjacentNeighborhoods,
  } = useNeighborhoodsSection({ formData, updateFormData });

  return (
    <View>
      <View style={styles.neighborhoodsSectionHeader}>
        <Feather name="map-pin" size={16} color={colors.primary} />
        <Text style={[styles.neighborhoodsSectionTitle, { color: colors.foreground }]}>
          Ubicación preferida
        </Text>
      </View>

      {/* Barrio Principal */}
      <MainNeighborhoodCard
        neighborhoodId={mainPreferredNeighborhoodId}
        onPress={() => openSelectionModal("mainPreferredNeighborhood")}
        cachedFilters={cachedFilters}
        isFilterMode
      />

      {/* Barrios Preferidos Adicionales */}
      <View style={styles.additionalNeighborhoods}>
        <View style={styles.neighborhoodsHeader}>
          <Text style={[styles.neighborhoodsTitle, { color: colors.foreground }]}>
            Barrios adicionales
          </Text>
          <TouchableOpacity
            onPress={() => openSelectionModal("preferredLocations")}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Agregar</Text>
          </TouchableOpacity>
        </View>
        <NeighborhoodChips
          neighborhoodIds={preferredLocations}
          onNeighborhoodsChange={updatepreferredLocations}
          editable
          cachedFilters={cachedFilters}
        />
      </View>

      {/* Toggle para incluir barrios adyacentes - Solo mostrar si es Montevideo */}
      {isMontevideo && (
        <View
          style={[
            styles.toggleContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.toggleContent}>
            <View style={styles.toggleTextContainer}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
                Incluir barrios adyacentes
              </Text>
              <Text style={[styles.toggleDescription, { color: colors.mutedForeground }]}>
                Buscar también en barrios cercanos
              </Text>
            </View>
            <Switch
              value={includeAdjacentNeighborhoods}
              onValueChange={updateIncludeAdjacentNeighborhoods}
              trackColor={{
                false: colors.muted,
                true: colors.primary + "80",
              }}
              thumbColor={includeAdjacentNeighborhoods ? colors.primary : colors.mutedForeground}
              disabled={loadingAdjacents || !mainPreferredNeighborhoodId}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  neighborhoodsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  neighborhoodsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  additionalNeighborhoods: {
    marginTop: 12,
    gap: 8,
  },
  neighborhoodsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  neighborhoodsTitle: {
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
  toggleContainer: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  toggleDescription: {
    fontSize: 13,
    fontWeight: "500",
  },
});
