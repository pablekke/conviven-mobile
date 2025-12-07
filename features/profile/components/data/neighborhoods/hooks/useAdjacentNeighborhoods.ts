import { useState, useEffect, useRef } from "react";
import { neighborhoodsService } from "../services";

interface UseAdjacentNeighborhoodsProps {
  includeAdjacentNeighborhoods: boolean;
  mainPreferredNeighborhoodId: string;
  preferredLocations: string[];
  onNeighborhoodsUpdate: (newNeighborhoods: string[]) => void;
}

export const useAdjacentNeighborhoods = ({
  includeAdjacentNeighborhoods,
  mainPreferredNeighborhoodId,
  preferredLocations,
  onNeighborhoodsUpdate,
}: UseAdjacentNeighborhoodsProps) => {
  const [loadingAdjacents, setLoadingAdjacents] = useState(false);
  const preferredRef = useRef(preferredLocations);
  preferredRef.current = preferredLocations;

  const prevInclude = useRef(includeAdjacentNeighborhoods);
  const lastProcessedKey = useRef<string | null>(null);

  useEffect(() => {
    const handleAdjacentNeighborhoods = async () => {
      if (!mainPreferredNeighborhoodId) return;

      const key = `${mainPreferredNeighborhoodId}-${includeAdjacentNeighborhoods}`;
      if (lastProcessedKey.current === key) {
        return;
      }
      lastProcessedKey.current = key;

      const includeChanged = prevInclude.current !== includeAdjacentNeighborhoods;
      prevInclude.current = includeAdjacentNeighborhoods;

      if (!includeAdjacentNeighborhoods && !includeChanged) {
        return;
      }

      setLoadingAdjacents(true);
      try {
        const adjacents = await neighborhoodsService.getAdjacentNeighborhoods(
          mainPreferredNeighborhoodId,
        );
        const adjacentIds = new Set(adjacents.map(n => n.id));
        const currentPreferred = preferredRef.current;

        if (includeAdjacentNeighborhoods) {
          const currentIds = new Set(currentPreferred);
          const newIds = adjacents.map(n => n.id).filter(id => !currentIds.has(id));

          if (newIds.length > 0) {
            onNeighborhoodsUpdate([...currentPreferred, ...newIds]);
          }
        } else {
          if (includeChanged && !includeAdjacentNeighborhoods) {
            const filteredNeighborhoods = currentPreferred.filter(id => !adjacentIds.has(id));

            if (filteredNeighborhoods.length !== currentPreferred.length) {
              onNeighborhoodsUpdate(filteredNeighborhoods);
            }
          }
        }
      } catch (error) {
        console.error("Error handling adjacent neighborhoods:", error);
      } finally {
        setLoadingAdjacents(false);
      }
    };

    handleAdjacentNeighborhoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeAdjacentNeighborhoods, mainPreferredNeighborhoodId]);

  return {
    loadingAdjacents,
  };
};
