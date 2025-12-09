import { neighborhoodsCacheService, getCachedNeighborhoods } from "../services";
import type { Neighborhood } from "../../../../../../types/user";
import { useMemo } from "react";

interface UseNeighborhoodsByIdsReturn {
  neighborhoods: Neighborhood[];
  loading: boolean;
  error: string | null;
}

interface UseNeighborhoodsByIdsProps {
  neighborhoodIds: string[];
  cachedFilters?: any | null;
}

/**
 * Hook para obtener barrios desde el cache del usuario y cache del servicio (adjacents)
 * NO hace llamadas a la API - solo usa cache
 * Si un barrio no está en el cache, simplemente no se muestra (no se hace llamada)
 */
export const useNeighborhoodsByIds = ({
  neighborhoodIds,
  cachedFilters,
}: UseNeighborhoodsByIdsProps): UseNeighborhoodsByIdsReturn => {
  const { neighborhoods, loading, error } = useMemo(() => {
    if (neighborhoodIds.length === 0) {
      return { neighborhoods: [], loading: false, error: null };
    }

    const serviceCache = getCachedNeighborhoods(neighborhoodIds);
    const serviceIds = new Set(serviceCache.map(n => n.id));
    const missingFromService = neighborhoodIds.filter(id => !serviceIds.has(id));

    let result: Neighborhood[] = [...serviceCache];

    if (missingFromService.length > 0 && cachedFilters) {
      const filtersCache = neighborhoodsCacheService.getNeighborhoodsByIdsFromCache(
        missingFromService,
        cachedFilters,
      );
      result = [...result, ...filtersCache];
    }

    return {
      neighborhoods: result,
      loading: false,
      error: null,
    };
  }, [neighborhoodIds.join(","), cachedFilters]);

  return {
    neighborhoods,
    loading,
    error,
  };
};
