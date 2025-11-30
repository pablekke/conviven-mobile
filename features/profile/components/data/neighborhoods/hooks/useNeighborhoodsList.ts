import { useState, useEffect } from "react";
import { neighborhoodsService } from "../services";

interface UseNeighborhoodsListReturn {
  neighborhoods: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
/**
 * Hook para cargar la lista de barrios
 * @param enabled - Si está habilitado para cargar
 * @param cityId - ID de la ciudad para filtrar (opcional)
 */
export const useNeighborhoodsList = (
  enabled: boolean = true,
  cityId?: string | null,
): UseNeighborhoodsListReturn => {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNeighborhoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const allNeighborhoods = await neighborhoodsService.getAllNeighborhoods(cityId || undefined);

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
      loadNeighborhoods();
    }
  }, [enabled, cityId]);

  return {
    neighborhoods,
    loading,
    error,
    refetch: loadNeighborhoods,
  };
};
