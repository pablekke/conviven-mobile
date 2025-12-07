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
}

interface UseNeighborhoodsSectionProps {
  formData: SearchFiltersFormData;
  updateFormData: (field: keyof SearchFiltersFormData, value: any) => void;
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

  // Obtener datos del cache en el formato esperado por los componentes
  const cachedFilters = useMemo(() => {
    if (!searchFilters) return null;
    return {
      mainPreferredLocation: searchFilters.mainPreferredLocation,
      preferredLocations: searchFilters.preferredLocations || [],
    };
  }, [searchFilters]);

  // Obtener IDs desde formData (que viene del cache/parent)
  const mainPreferredNeighborhoodId = formData.mainPreferredNeighborhoodId || "";
  const preferredLocations = formData.preferredLocations || [];
  const includeAdjacentNeighborhoods = formData.includeAdjacentNeighborhoods || false;

  // Hook para manejar barrios adyacentes
  const { loadingAdjacents } = useAdjacentNeighborhoods({
    includeAdjacentNeighborhoods,
    mainPreferredNeighborhoodId,
    preferredLocations,
    onNeighborhoodsUpdate: newNeighborhoods => {
      updateFormData("preferredLocations", newNeighborhoods);
    },
  });

  // Verificar si es Montevideo
  const isMontevideo = useIsMontevideoNeighborhood({
    neighborhoodId: mainPreferredNeighborhoodId || null,
    cachedFilters,
  });

  // Funciones para actualizar el draft
  const updateMainNeighborhood = (neighborhoodId: string) => {
    // Cuando cambia el barrio principal, resetear adyacentes y limpiar barrios adicionales
    updateFormData("mainPreferredNeighborhoodId", neighborhoodId);
    updateFormData("includeAdjacentNeighborhoods", false);
    updateFormData("preferredLocations", []);
  };

  const updatepreferredLocations = (neighborhoodIds: string[]) => {
    updateFormData("preferredLocations", neighborhoodIds);
  };

  const updateIncludeAdjacentNeighborhoods = (value: boolean) => {
    updateFormData("includeAdjacentNeighborhoods", value);
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
  };
};
