import { useNeighborhoodAdjacency } from "./useNeighborhoodAdjacency";
import { useRef } from "react";

interface UseAdjacentNeighborhoodsProps {
  mainPreferredNeighborhoodId: string;
  preferredLocations: string[];
  onBatchUpdate: (newNeighborhoods: string[], newToggleValue: boolean) => void;
  onToggleChange: (value: boolean) => void;
}

/**
 * Hook que orquesta el toggle de barrios adyacentes usando el manager específico.
 */
export const useAdjacentNeighborhoods = ({
  mainPreferredNeighborhoodId,
  preferredLocations,
  onBatchUpdate,
  onToggleChange,
}: UseAdjacentNeighborhoodsProps) => {
  const { loading, expandWithAdjacents, contractByRemovingAdjacents } = useNeighborhoodAdjacency();
  const preferredRef = useRef(preferredLocations);
  preferredRef.current = preferredLocations;

  const handleToggleChange = async (newValue: boolean) => {
    // 1. Cambio visual optimista
    onToggleChange(newValue);

    const currentPreferred = preferredRef.current;

    try {
      if (newValue) {
        // AGREGAR: Expandir basado en todos los barrios base (Main + Adicionales)
        const expandedList = await expandWithAdjacents(
          mainPreferredNeighborhoodId,
          currentPreferred,
        );

        if (expandedList.length !== currentPreferred.length) {
          onBatchUpdate(expandedList, newValue);
        } else {
          onToggleChange(newValue);
        }
      } else {
        // REMOVER: Quitar cualquier barrio que sea adyacente
        const contractedList = await contractByRemovingAdjacents(
          mainPreferredNeighborhoodId,
          currentPreferred,
        );

        if (contractedList.length !== currentPreferred.length) {
          onBatchUpdate(contractedList, newValue);
        } else {
          onToggleChange(newValue);
        }
      }
    } catch (error) {
      console.error("[useAdjacentNeighborhoods] Toggle handler error:", error);
      if (newValue) onToggleChange(false);
    }
  };

  return {
    loadingAdjacents: loading,
    handleToggleChange,
  };
};
