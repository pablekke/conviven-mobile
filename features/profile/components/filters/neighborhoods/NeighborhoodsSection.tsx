import { AdditionalNeighborhoodsSection } from "../components/AdditionalNeighborhoodsSection";
import { AdjacentNeighborhoodsToggle } from "../components/AdjacentNeighborhoodsToggle";
import { NeighborhoodsSectionHeader } from "../components/NeighborhoodsSectionHeader";
import { SearchFiltersFormData } from "../../../services/searchFiltersService";
import { useNeighborhoodsSection } from "./hooks/useNeighborhoodsSection";
import { MainNeighborhoodCard } from "./MainNeighborhoodCard";
import { View } from "react-native";
import React from "react";

interface NeighborhoodsSectionProps {
  openSelectionModal: (key: string) => void;
  formData: SearchFiltersFormData;
  updateFormData: (fieldOrObject: any, value?: any) => void;
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
