import { useState, useEffect, useMemo } from "react";
import { neighborhoodsService, neighborhoodsCacheService } from "../services";
import type { Neighborhood } from "../../../../../../types/user";

interface UseNeighborhoodReturn {
  neighborhood: Neighborhood | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseNeighborhoodProps {
  neighborhoodId: string | null;
  cachedFilters?: any | null;
}

/**
 * Hook para cargar un barrio por su ID
 * Usa el cache si está disponible, sino hace llamada a la API
 */
export const useNeighborhood = ({
  neighborhoodId,
  cachedFilters,
}: UseNeighborhoodProps): UseNeighborhoodReturn => {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cachedNeighborhood = useMemo(() => {
    if (!neighborhoodId || !cachedFilters) return null;
    return neighborhoodsCacheService.getNeighborhoodByIdFromCache(neighborhoodId, cachedFilters);
  }, [neighborhoodId, cachedFilters]);

  const loadNeighborhood = async (showLoading = false) => {
    if (!neighborhoodId) {
      setNeighborhood(null);
      return;
    }

    const currentCached = neighborhoodsCacheService.getNeighborhoodByIdFromCache(
      neighborhoodId,
      cachedFilters,
    );
    if (currentCached?.city?.department) {
      setNeighborhood(currentCached);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await neighborhoodsService.getNeighborhoodById(neighborhoodId);
      if (data) {
        setNeighborhood(data);
      } else {
        setError("No se pudo cargar el barrio");
      }
    } catch (err: any) {
      console.error("Error loading neighborhood:", err);
      setError(err?.message || "Error al cargar el barrio");
      setNeighborhood(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cachedNeighborhood) {
      if (!cachedNeighborhood.city?.department) {
        loadNeighborhood(false);
      } else {
      setNeighborhood(cachedNeighborhood);
      setLoading(false);
      setError(null);
    }
    } else if (neighborhoodId) {
      loadNeighborhood(false);
    } else {
      setNeighborhood(null);
      setLoading(false);
    }
  }, [neighborhoodId, cachedNeighborhood]);

  return {
    neighborhood,
    loading,
    error,
    refetch: () => loadNeighborhood(true),
  };
};
