import { useState, useRef } from "react";
import { neighborhoodsService } from "../services";

interface UseAdjacentNeighborhoodsProps {
  mainPreferredNeighborhoodId: string;
  preferredLocations: string[];
  onNeighborhoodsUpdate: (newNeighborhoods: string[]) => void;
  onToggleChange: (value: boolean) => void;
}

export const useAdjacentNeighborhoods = ({
  mainPreferredNeighborhoodId,
  preferredLocations,
  onNeighborhoodsUpdate,
  onToggleChange,
}: UseAdjacentNeighborhoodsProps) => {
  const [loadingAdjacents, setLoadingAdjacents] = useState(false);
  const preferredRef = useRef(preferredLocations);
  preferredRef.current = preferredLocations;

  const handleToggleChange = async (newValue: boolean) => {
    onToggleChange(newValue);

    if (!mainPreferredNeighborhoodId) {
      return;
    }

    setLoadingAdjacents(true);
    try {
      const adjacents = await neighborhoodsService.getAdjacentNeighborhoods(
        mainPreferredNeighborhoodId,
      );
      const adjacentIds = new Set(adjacents.map(n => n.id));
      const currentPreferred = preferredRef.current;

      if (newValue) {
        const currentIds = new Set(currentPreferred);
        const newIds = adjacents.map(n => n.id).filter(id => !currentIds.has(id));

        if (newIds.length > 0) {
          onNeighborhoodsUpdate([...currentPreferred, ...newIds]);
        }
      } else {
        const filteredNeighborhoods = currentPreferred.filter(id => !adjacentIds.has(id));

        if (filteredNeighborhoods.length !== currentPreferred.length) {
          onNeighborhoodsUpdate(filteredNeighborhoods);
        }
      }
    } catch (error) {
      console.error("Error handling adjacent neighborhoods:", error);
      // Revertir el estado si hay error
      onToggleChange(!newValue);
    } finally {
      setLoadingAdjacents(false);
    }
  };

  return {
    loadingAdjacents,
    handleToggleChange,
  };
};
