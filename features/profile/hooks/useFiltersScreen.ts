import { useNeighborhoodsLogic } from "../components/data/neighborhoods/hooks";
import { useEditProfileLogic } from "./useEditProfileLogic";
import { useFocusEffect } from "@react-navigation/native";
import { useFiltersModals } from "./useFiltersModals";
import { useFiltersScroll } from "./useFiltersScroll";
import { useFiltersSave } from "./useFiltersSave";
import { useCallback } from "react";

export const useFiltersScreen = () => {
  const editProfileLogic = useEditProfileLogic();
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
  } = editProfileLogic;

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
    preferredNeighborhoods: editProfileLogic.preferredNeighborhoods,
    mainPreferredNeighborhoodId: editProfileLogic.mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods: editProfileLogic.includeAdjacentNeighborhoods,
    cachedFilters: editProfileLogic.cachedFilters,
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
