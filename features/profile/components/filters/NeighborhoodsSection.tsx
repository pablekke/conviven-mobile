import { AdditionalNeighborhoodsSection } from "./components/AdditionalNeighborhoodsSection";
import { useNeighborhoodsSection } from "./neighborhoods/hooks/useNeighborhoodsSection";
import { AdjacentNeighborhoodsToggle } from "./components/AdjacentNeighborhoodsToggle";
import { NeighborhoodsSectionHeader } from "./components/NeighborhoodsSectionHeader";
import { SearchFiltersFormData } from "../../services/searchFiltersService";
import { MainNeighborhoodCard } from "./neighborhoods";
import { View } from "react-native";
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
    <View className="mb-2">
      <NeighborhoodsSectionHeader />

      <MainNeighborhoodCard
        neighborhoodId={mainPreferredNeighborhoodId}
        onPress={() => openSelectionModal("mainPreferredNeighborhood")}
        cachedFilters={cachedFilters}
        isFilterMode
      />

      <AdditionalNeighborhoodsSection
        preferredLocations={preferredLocations}
        onAddPress={() => openSelectionModal("preferredLocations")}
        onNeighborhoodsChange={updatepreferredLocations}
        cachedFilters={cachedFilters}
      />

      {isMontevideo && (
        <AdjacentNeighborhoodsToggle
          value={includeAdjacentNeighborhoods}
          onValueChange={updateIncludeAdjacentNeighborhoods}
          disabled={loadingAdjacents || !mainPreferredNeighborhoodId}
        />
      )}
    </View>
  );
};