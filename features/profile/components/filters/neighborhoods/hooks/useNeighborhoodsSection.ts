import { SearchFiltersFormData } from "../../../../services/searchFiltersService";
import { useIsMontevideoNeighborhood } from "./useIsMontevideoNeighborhood";
import { useAdjacentNeighborhoods } from "./useAdjacentNeighborhoods";
import { useDataPreload } from "@/context/DataPreloadContext";
import { useMemo } from "react";

export interface UseNeighborhoodsSectionReturn {
  mainPreferredNeighborhoodId: string;
  preferredLocations: string[];
  includeAdjacentNeighborhoods: boolean;
  loadingAdjacents: boolean;
  isMontevideo: boolean;
  cachedFilters: any | null;
  updateMainNeighborhood: (neighborhoodId: string) => void;
  updatepreferredLocations: (neighborhoodIds: string[]) => void;
  updateIncludeAdjacentNeighborhoods: (value: boolean) => void;
  handleAdjacentToggleChange: (value: boolean) => void;
}

interface UseNeighborhoodsSectionProps {
  formData: SearchFiltersFormData;
  updateFormData: (fieldOrObject: any, value?: any) => void;
}

/**
 * Hook autónomo que maneja toda la lógica de la sección de barrios
 * Obtiene los datos del cache y actualiza el draft desde aquí
 */
export const useNeighborhoodsSection = ({
  formData,
  updateFormData,
}: UseNeighborhoodsSectionProps): UseNeighborhoodsSectionReturn => {
  const { searchFilters } = useDataPreload();

  const cachedFilters = useMemo(() => {
    if (!searchFilters) return null;
    return {
      mainPreferredLocation: searchFilters.mainPreferredLocation,
      preferredLocations: searchFilters.preferredLocations || [],
    };
  }, [searchFilters]);

  const mainPreferredNeighborhoodId = formData.mainPreferredNeighborhoodId || "";
  const preferredLocations = formData.preferredLocations || [];
  const includeAdjacentNeighborhoods = formData.includeAdjacentNeighborhoods || false;

  const { loadingAdjacents, handleToggleChange } = useAdjacentNeighborhoods({
    mainPreferredNeighborhoodId,
    preferredLocations,
    onBatchUpdate: (newNeighborhoods, newToggleValue) => {
      updateFormData({
        preferredLocations: newNeighborhoods,
        includeAdjacentNeighborhoods: newToggleValue,
      });
    },
    onToggleChange: value => {
      updateFormData("includeAdjacentNeighborhoods", value);
    },
  });

  const isMontevideo = useIsMontevideoNeighborhood({
    neighborhoodId: mainPreferredNeighborhoodId || null,
    cachedFilters,
  });

  const updateMainNeighborhood = (neighborhoodId: string) => {
    updateFormData("mainPreferredNeighborhoodId", neighborhoodId);
    updateFormData("includeAdjacentNeighborhoods", false);
    updateFormData("preferredLocations", []);
  };

  const updatepreferredLocations = (neighborhoodIds: string[]) => {
    updateFormData("preferredLocations", neighborhoodIds);
  };

  const updateIncludeAdjacentNeighborhoods = (value: boolean) => {
    handleToggleChange(value);
  };

  return {
    mainPreferredNeighborhoodId,
    preferredLocations,
    includeAdjacentNeighborhoods,
    loadingAdjacents,
    isMontevideo,
    cachedFilters,
    updateMainNeighborhood,
    updatepreferredLocations,
    updateIncludeAdjacentNeighborhoods,
    handleAdjacentToggleChange: handleToggleChange,
  };
};
