import { useState, useEffect, useRef } from "react";
import { neighborhoodsService } from "../services";

interface UseAdjacentNeighborhoodsProps {
  includeAdjacentNeighborhoods: boolean;
  mainPreferredNeighborhoodId: string;
  preferredNeighborhoods: string[];
  onNeighborhoodsUpdate: (newNeighborhoods: string[]) => void;
}

export const useAdjacentNeighborhoods = ({
  includeAdjacentNeighborhoods,
  mainPreferredNeighborhoodId,
  preferredNeighborhoods,
  onNeighborhoodsUpdate,
}: UseAdjacentNeighborhoodsProps) => {
  const [loadingAdjacents, setLoadingAdjacents] = useState(false);
  const adjacentIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleAdjacentNeighborhoods = async () => {
      if (!includeAdjacentNeighborhoods) {
        if (adjacentIdsRef.current.size > 0) {
          const filteredNeighborhoods = preferredNeighborhoods.filter(
            id => !adjacentIdsRef.current.has(id),
          );
          onNeighborhoodsUpdate(filteredNeighborhoods);
          adjacentIdsRef.current.clear();
        }
        return;
      }

      if (!mainPreferredNeighborhoodId) {
        return;
      }

      setLoadingAdjacents(true);
      try {
        const adjacents = await neighborhoodsService.getAdjacentNeighborhoods(
          mainPreferredNeighborhoodId,
        );
        const adjacentIds = adjacents.map(n => n.id);

        adjacentIds.forEach(id => adjacentIdsRef.current.add(id));

        const currentIds = new Set(preferredNeighborhoods);
        const newIds = adjacentIds.filter(id => !currentIds.has(id));

        if (newIds.length > 0) {
          onNeighborhoodsUpdate([...preferredNeighborhoods, ...newIds]);
        }
      } catch (error) {
        console.error("Error loading adjacent neighborhoods:", error);
      } finally {
        setLoadingAdjacents(false);
      }
    };

    handleAdjacentNeighborhoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeAdjacentNeighborhoods, mainPreferredNeighborhoodId]);

  useEffect(() => {
    if (mainPreferredNeighborhoodId) {
      adjacentIdsRef.current.clear();
    }
  }, [mainPreferredNeighborhoodId]);

  return {
    loadingAdjacents,
  };
};
