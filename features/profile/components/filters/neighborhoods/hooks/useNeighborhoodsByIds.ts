import {
  neighborhoodsService,
  getCachedNeighborhoods,
  neighborhoodsCacheService,
} from "../services";
import type { Neighborhood } from "../../../../../../types/user";
import { useState, useEffect, useRef } from "react";

interface UseNeighborhoodsByIdsReturn {
  neighborhoods: Neighborhood[];
  loading: boolean;
  error: string | null;
}

interface UseNeighborhoodsByIdsProps {
  neighborhoodIds: string[];
  cachedFilters?: any | null;
}

export const useNeighborhoodsByIds = ({
  neighborhoodIds,
  cachedFilters,
}: UseNeighborhoodsByIdsProps): UseNeighborhoodsByIdsReturn => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() => {
    const initial = getCachedNeighborhoods(neighborhoodIds);
    return initial.filter((n): n is Neighborhood => !!(n.id));
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (neighborhoodIds.length === 0) {
        if (mountedRef.current) setNeighborhoods([]);
        return;
      }

      // 1. Intentar resolver de caches (Sincrónico)
      const serviceCache = getCachedNeighborhoods(neighborhoodIds);
      let resolved = [...serviceCache];

      const missingFromService = neighborhoodIds.filter(id => !resolved.find(r => r.id === id));

      if (missingFromService.length > 0 && cachedFilters) {
        const filtersCache = neighborhoodsCacheService.getNeighborhoodsByIdsFromCache(
          missingFromService,
          cachedFilters,
        );
        resolved = [...resolved, ...filtersCache];
      }

      // 2. Actualización inmediata con lo que tengamos en cache
      const neighborhoodsMap = new Map(resolved.map(n => [n.id, n]));
      const currentResolved = neighborhoodIds
        .map(id => neighborhoodsMap.get(id))
        .filter((n): n is Neighborhood => !!n);

      if (mountedRef.current) {
        setNeighborhoods(currentResolved);
      }

      const stillMissing = neighborhoodIds.filter(id => !neighborhoodsMap.has(id));

      if (stillMissing.length === 0) {
        if (mountedRef.current) setLoading(false);
        return;
      }

      // 3. Solo si falta data real entramos en loading
      if (mountedRef.current) setLoading(true);
      try {
        const fetched = await neighborhoodsService.getNeighborhoodsByIds(stillMissing);
        resolved = [...resolved, ...fetched];

        const finalMap = new Map(resolved.map(n => [n.id, n]));
        if (mountedRef.current) {
          const finalValues = neighborhoodIds
            .map(id => finalMap.get(id))
            .filter((n): n is Neighborhood => !!n);

          setNeighborhoods(finalValues);
          setError(null);
        }
      } catch (err) {
        console.error("[useNeighborhoodsByIds] Error fetching missing:", err);
        if (mountedRef.current) setError("Error al cargar barrios adicionales");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadNeighborhoods();
  }, [neighborhoodIds.join(","), !!cachedFilters]);

  return { neighborhoods, loading, error };
};
