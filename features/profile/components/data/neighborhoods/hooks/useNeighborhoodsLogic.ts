import { useCallback } from "react";

interface UseNeighborhoodsLogicProps {
  selectedQuestion: string | null;
  updateSearchFilters: (field: any, value: any) => void;
  preferredLocations: string[];
  mainPreferredNeighborhoodId: string;
  includeAdjacentNeighborhoods: boolean;
  cachedFilters: any;
}

export const useNeighborhoodsLogic = ({
  selectedQuestion,
  updateSearchFilters,
  preferredLocations,
  mainPreferredNeighborhoodId,
  includeAdjacentNeighborhoods,
  cachedFilters,
}: UseNeighborhoodsLogicProps) => {
  const handleNeighborhoodConfirm = useCallback(
    (selectedIds: string[], mainId?: string | null) => {
      if (selectedQuestion === "mainPreferredNeighborhood") {
        if (mainId) {
          updateSearchFilters("mainPreferredNeighborhoodId", mainId);
        }
      } else {
        updateSearchFilters("preferredLocations", selectedIds);
      }
    },
    [selectedQuestion, updateSearchFilters],
  );

  return {
    handleNeighborhoodConfirm,
    preferredLocations,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
  };
};
