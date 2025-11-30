import { useState, useEffect, useMemo } from "react";
import { neighborhoodsService, neighborhoodsCacheService } from "../services";
import type { Neighborhood } from "../../../../../../types/user";

interface UseNeighborhoodsByIdsReturn {
  neighborhoods: Neighborhood[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseNeighborhoodsByIdsProps {
  neighborhoodIds: string[];
  cachedFilters?: any | null;
}

/**
 * Hook para cargar múltiples barrios por sus IDs
 * Usa el cache si está disponible, sino hace llamadas a la API
 */
export const useNeighborhoodsByIds = ({
  neighborhoodIds,
  cachedFilters,
}: UseNeighborhoodsByIdsProps): UseNeighborhoodsByIdsReturn => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cachedNeighborhoods = useMemo(() => {
    if (!cachedFilters || neighborhoodIds.length === 0) {
      return [];
    }

    return neighborhoodsCacheService.getNeighborhoodsByIdsFromCache(neighborhoodIds, cachedFilters);
  }, [neighborhoodIds.join(","), cachedFilters]);

  const loadNeighborhoods = async (showLoading = false) => {
    if (neighborhoodIds.length === 0) {
      setNeighborhoods([]);
      setLoading(false);
      return;
    }

    const currentCached = neighborhoodsCacheService.getNeighborhoodsByIdsFromCache(
      neighborhoodIds,
      cachedFilters,
    );
    if (currentCached.length === neighborhoodIds.length) {
      setNeighborhoods(currentCached);
      setLoading(false);
      return;
    }

    const cachedIds = new Set(currentCached.map(n => n.id));
    const missingIds = neighborhoodIds.filter(id => !cachedIds.has(id));

    if (missingIds.length === 0) {
      setNeighborhoods(currentCached);
      setLoading(false);
      return;
    }

    if (showLoading && currentCached.length === 0) {
      setLoading(true);
    }
    setError(null);

    try {
      let loadedNeighborhoods = [...currentCached];

      if (missingIds.length > 0) {
        const apiNeighborhoods = await neighborhoodsService.getNeighborhoodsByIds(missingIds);
        loadedNeighborhoods = [...loadedNeighborhoods, ...apiNeighborhoods];
      }

      setNeighborhoods(loadedNeighborhoods);
    } catch (err) {
      console.error("Error loading neighborhoods:", err);
      setError("No se pudieron cargar los barrios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allInCache =
      cachedNeighborhoods.length === neighborhoodIds.length && neighborhoodIds.length > 0;

    if (allInCache) {
      setNeighborhoods(cachedNeighborhoods);
      setLoading(false);
      setError(null);
      return;
    }

    if (neighborhoodIds.length === 0) {
      setNeighborhoods([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (cachedNeighborhoods.length > 0) {
      setNeighborhoods(cachedNeighborhoods);
      setLoading(false);
      const cachedIds = new Set(cachedNeighborhoods.map(n => n.id));
      const missingIds = neighborhoodIds.filter(id => !cachedIds.has(id));

      if (missingIds.length > 0) {
        loadNeighborhoods(false);
      }
    } else {
      loadNeighborhoods(true);
    }
  }, [neighborhoodIds.join(","), cachedNeighborhoods.length]);

  return {
    neighborhoods,
    loading,
    error,
    refetch: () => loadNeighborhoods(true),
  };
};
