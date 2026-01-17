import { neighborhoodsService } from "../services";
import { useState } from "react";

/**
 * Hook específico para gestionar la lógica de expansión y contracción de barrios
 * basado en sus adyacentes.
 */
export const useNeighborhoodAdjacency = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Obtiene todos los IDs adyacentes para una lista de barrios "base"
   * y los agrega a la lista de preferidos si no existen.
   */
  const expandWithAdjacents = async (mainId: string, preferredIds: string[]) => {
    if (!mainId) return preferredIds;

    setLoading(true);
    try {
      const adjacents = await neighborhoodsService.getAdjacentNeighborhoods(mainId);
      const adjIds = adjacents.map(n => n.id).filter(id => !!id);

      const currentSet = new Set(preferredIds);
      const newIds = adjIds.filter(id => id !== mainId && !currentSet.has(id));

      if (newIds.length === 0) return preferredIds;

      return [...preferredIds, ...newIds];
    } catch (error) {
      console.error("[useNeighborhoodAdjacency] Expand error:", error);
      return preferredIds;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Identifica y remueve barrios que son adyacentes de los barrios "base"
   * (Usado al desactivar el toggle)
   */
  const contractByRemovingAdjacents = async (mainId: string, preferredIds: string[]) => {
    if (!mainId) return preferredIds;

    setLoading(true);
    try {
      const adjacents = await neighborhoodsService.getAdjacentNeighborhoods(mainId);
      const adjIds = new Set(adjacents.map(n => n.id));

      // Filtramos: mantenemos en la lista solo los que NO son adyacentes del principal
      const filtered = preferredIds.filter(id => !adjIds.has(id));

      return filtered;
    } catch (error) {
      console.error("[useNeighborhoodAdjacency] Contract error:", error);
      return preferredIds;
    } finally {
      setLoading(false);
    }
  };

  return { loading, expandWithAdjacents, contractByRemovingAdjacents };
};
