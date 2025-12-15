import { neighborhoodsService } from "../services";
import { useState, useEffect } from "react";

interface UseNeighborhoodsListReturn {
  neighborhoods: any[];
  loading: boolean;
  error: string | null;
  refetch: (forceRefresh?: boolean) => Promise<void>;
}

export const useNeighborhoodsList = (
  enabled: boolean = true,
  cityId?: string | null,
): UseNeighborhoodsListReturn => {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNeighborhoods = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        const cached = await neighborhoodsService.loadFromCache(cityId || undefined);
        if (cached && cached.length > 0) {
          setNeighborhoods(cached);
          setLoading(false);
          neighborhoodsService
            .getAllNeighborhoods(cityId || undefined, false)
            .then(updated => {
              if (updated && updated.length > 0) {
                setNeighborhoods(updated);
              }
            })
            .catch(() => {});
          return;
        }
      }

      const allNeighborhoods = await neighborhoodsService.getAllNeighborhoods(
        cityId || undefined,
        forceRefresh,
      );

      if (allNeighborhoods && Array.isArray(allNeighborhoods) && allNeighborhoods.length > 0) {
        setNeighborhoods(allNeighborhoods);
      } else {
        setNeighborhoods([]);
        setError("No se pudieron cargar los barrios. Intenta nuevamente.");
      }
    } catch (err: any) {
      console.error("Error loading neighborhoods:", err);
      setNeighborhoods([]);
      setError(err?.message || "Error al cargar los barrios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      loadNeighborhoods(false);
    }
  }, [enabled, cityId]);

  return {
    neighborhoods,
    loading,
    error,
    refetch: loadNeighborhoods,
  };
};
