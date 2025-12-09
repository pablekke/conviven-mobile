import { useNeighborhoodsLogic } from "../components/filters/neighborhoods/hooks";
import { useEditFiltersLogic } from "./useEditFiltersLogic";
import { useFocusEffect } from "@react-navigation/native";
import { useFiltersModals } from "./useFiltersModals";
import { useFiltersScroll } from "./useFiltersScroll";
import { useFiltersSave } from "./useFiltersSave";
import { useCallback } from "react";

export const useFiltersScreen = () => {
  const editFiltersLogic = useEditFiltersLogic();
  const {
    selectedAnswers,
    setSelectedAnswers,
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    updateSearchFilters,
    reloadSearchFiltersFromContext,
    searchFiltersLoading,
    searchFiltersSaving,
    handleUpdate,
    preferredLocations,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
  } = editFiltersLogic;

  useFocusEffect(
    useCallback(() => {
      if (!searchFiltersHasChanges) {
        reloadSearchFiltersFromContext();
      }
    }, [searchFiltersHasChanges, reloadSearchFiltersFromContext]),
  );

  const isSaving = searchFiltersSaving;

  const modals = useFiltersModals({
    selectedAnswers,
    setSelectedAnswers,
    handleUpdate,
    isSaving,
  });

  const save = useFiltersSave({
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    minAge,
    maxAge,
    budgetMin,
    budgetMax,
    isSaving,
    searchFiltersLoading,
  });

  const scroll = useFiltersScroll();

  const { handleNeighborhoodConfirm, ...neighborhoodsData } = useNeighborhoodsLogic({
    selectedQuestion: modals.selectedQuestion,
    updateSearchFilters,
    preferredLocations,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
  });

  return {
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    updateSearchFilters,

    searchFiltersLoading,
    isSaving,

    ...modals,

    ...save,

    ...scroll,

    handleNeighborhoodConfirm,
    ...neighborhoodsData,
    getSelectedLabel: modals.getSelectedLabel,
  };
};
