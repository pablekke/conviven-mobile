import { neighborhoodsCacheService, getCachedNeighborhood } from "../services";
import type { Neighborhood } from "../../../../../../types/user";
import { useMemo } from "react";

interface UseNeighborhoodReturn {
  neighborhood: Neighborhood | null;
  loading: boolean;
  error: string | null;
}

interface UseNeighborhoodProps {
  neighborhoodId: string | null;
  cachedFilters?: any | null;
}

/**
 * Hook para obtener un barrio desde el cache del usuario o cache del servicio
 * No hace llamadas a la API - solo usa cache
 */
export const useNeighborhood = ({
  neighborhoodId,
  cachedFilters,
}: UseNeighborhoodProps): UseNeighborhoodReturn => {
  const { neighborhood, loading, error } = useMemo(() => {
    if (!neighborhoodId) {
      return { neighborhood: null, loading: false, error: null };
    }

    const serviceCache = getCachedNeighborhood(neighborhoodId);
    if (serviceCache) {
      return { neighborhood: serviceCache, loading: false, error: null };
    }

    if (cachedFilters) {
      const filtersCache = neighborhoodsCacheService.getNeighborhoodByIdFromCache(
        neighborhoodId,
        cachedFilters,
      );
      if (filtersCache) {
        return { neighborhood: filtersCache, loading: false, error: null };
      }
    }

    return { neighborhood: null, loading: false, error: null };
  }, [neighborhoodId, cachedFilters]);

  return {
    neighborhood,
    loading,
    error,
  };
};
