import { QUESTION_OPTIONS } from "../constants/questionOptions";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSearchFilters } from "./useSearchFilters";
import { useCachedProfile } from "./useCachedProfile";

export const findOptionLabel = (
  value: string,
  options: { value: string; label: string }[],
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label ?? "";
};

export const useEditFiltersLogic = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [genders, setGenders] = useState<string[]>([]);

  const { user } = useAuth();
  const { fullProfile } = useCachedProfile();

  const {
    formData: searchFiltersData,
    loading: searchFiltersLoading,
    saving: searchFiltersSaving,
    updateFormData: updateSearchFilters,
    resetFormData: resetSearchFilters,
    saveFormData: saveSearchFilters,
    hasChanges: searchFiltersHasChanges,
    reloadFromContext: reloadSearchFiltersFromContext,
  } = useSearchFilters();

  useEffect(() => {
    if (searchFiltersData) {
      const mapped: Record<string, string> = {};

      if (searchFiltersData.genderPref?.length > 0) {
        const firstGender = searchFiltersData.genderPref[0];
        mapped.genderPref =
          findOptionLabel(firstGender, QUESTION_OPTIONS.genderPref) || "Seleccionar";
      }

      mapped.onlyWithPhoto =
        findOptionLabel(
          searchFiltersData.onlyWithPhoto ? "true" : "false",
          QUESTION_OPTIONS.onlyWithPhoto,
        ) || "Seleccionar";

      setMinAge(searchFiltersData.minAge.toString());
      setMaxAge(searchFiltersData.maxAge.toString());
      setBudgetMin(searchFiltersData.budgetMin.toString());
      setBudgetMax(searchFiltersData.budgetMax.toString());
      setGenders(searchFiltersData.genders || []);

      setSelectedAnswers(mapped);
    }
  }, [searchFiltersData]);

  const handleUpdate = useCallback(
    (question: string, value: string) => {
      if (question === "genderPref") {
        updateSearchFilters("genderPref", [value]);
      } else if (question === "onlyWithPhoto") {
        updateSearchFilters("onlyWithPhoto", value === "true");
      } else if (question === "genders") {
        updateSearchFilters("genders", value.split(","));
      }
    },
    [updateSearchFilters],
  );

  const getSelectedLabel = useCallback(
    (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar",
    [selectedAnswers],
  );

  const resetFiltersAndAnswers = useCallback(() => {
    if (searchFiltersData) {
      const mapped: Record<string, string> = {};

      if (searchFiltersData.genderPref?.length > 0) {
        const firstGender = searchFiltersData.genderPref[0];
        mapped.genderPref =
          findOptionLabel(firstGender, QUESTION_OPTIONS.genderPref) || "Seleccionar";
      }

      mapped.onlyWithPhoto =
        findOptionLabel(
          searchFiltersData.onlyWithPhoto ? "true" : "false",
          QUESTION_OPTIONS.onlyWithPhoto,
        ) || "Seleccionar";

      setSelectedAnswers(mapped);
    }
  }, [searchFiltersData]);

  return {
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
    genders,
    setGenders,
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    reloadSearchFiltersFromContext,
    updateSearchFilters,
    searchFiltersLoading,
    searchFiltersSaving,
    handleUpdate,
    getSelectedLabel,
    preferredLocations: searchFiltersData.preferredLocations || [],
    mainPreferredNeighborhoodId: (() => {
      const userFromFullProfile = (fullProfile as any)?.user;
      const cachedFilters =
        userFromFullProfile?.filters ||
        (user as any)?.filters ||
        fullProfile?.filters ||
        fullProfile?.searchFilters ||
        null;
      if (searchFiltersData.mainPreferredNeighborhoodId) {
        return searchFiltersData.mainPreferredNeighborhoodId;
      }

      if (cachedFilters) {
        const fromCached =
          cachedFilters.mainPreferredLocation?.neighborhood?.id ||
          (cachedFilters as any)?.mainPreferredNeighborhoodId;

        if (fromCached && fromCached !== "") {
          return fromCached;
        }
      }

      return "";
    })(),
    includeAdjacentNeighborhoods: searchFiltersData.includeAdjacentNeighborhoods,
    cachedFilters: (() => {
      const userFromFullProfile = (fullProfile as any)?.user;
      const userFilters = userFromFullProfile?.filters || (user as any)?.filters;
      return userFilters || fullProfile?.filters || fullProfile?.searchFilters || null;
    })(),
    searchFiltersData,
    resetFiltersAndAnswers,
  };
};
