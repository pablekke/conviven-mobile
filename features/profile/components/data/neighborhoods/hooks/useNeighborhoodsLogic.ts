import { useCallback } from "react";

interface UseNeighborhoodsLogicProps {
  selectedQuestion: string | null;
  updateSearchFilters: (field: any, value: any) => void;
  preferredNeighborhoods: string[];
  mainPreferredNeighborhoodId: string;
  includeAdjacentNeighborhoods: boolean;
  cachedFilters: any;
}

export const useNeighborhoodsLogic = ({
  selectedQuestion,
  updateSearchFilters,
  preferredNeighborhoods,
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
        updateSearchFilters("preferredNeighborhoods", selectedIds);
      }
    },
    [selectedQuestion, updateSearchFilters],
  );

  return {
    handleNeighborhoodConfirm,
    preferredNeighborhoods,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
  };
};
