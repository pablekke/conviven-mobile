import { useState, useEffect, useCallback } from "react";
import { useUserProfileData } from "./useUserProfileData";
import { useSearchPreferencesForm } from "./useSearchPreferencesForm";
import { useSearchFilters } from "./useSearchFilters";
import { useCachedProfile } from "./useCachedProfile";
import type { UserProfileData } from "../interfaces";
import { QUESTION_OPTIONS } from "../constants/questionOptions";

export const findOptionLabel = (
  value: string,
  options: { value: string; label: string }[],
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label ?? "";
};

export const useEditProfileLogic = () => {
  const [aboutText, setAboutText] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const { fullProfile } = useCachedProfile();
  const {
    profileData,
    saving,
    hasChanges: profileHasChanges,
    updateProfileData,
    saveProfileData,
    resetToUserData,
  } = useUserProfileData();

  const {
    formData: searchPrefsData,
    saving: searchPrefsSaving,
    updateFormData: updateSearchPrefs,
    resetFormData: resetSearchPrefs,
    saveFormData: saveSearchPrefs,
    hasChanges: searchPrefsHasChanges,
  } = useSearchPreferencesForm();

  const {
    formData: searchFiltersData,
    saving: searchFiltersSaving,
    updateFormData: updateSearchFilters,
    resetFormData: resetSearchFilters,
    saveFormData: saveSearchFilters,
    hasChanges: searchFiltersHasChanges,
  } = useSearchFilters();

  // Actualizar bio
  useEffect(() => {
    if (aboutText !== profileData.bio) {
      updateProfileData("bio", aboutText);
    }
  }, [aboutText, profileData.bio, updateProfileData]);

  // Cargar datos del perfil
  useEffect(() => {
    if (fullProfile?.profile) {
      const profile = fullProfile.profile;
      if (profile.bio) setAboutText(profile.bio);

      const mapped: Record<string, string> = {};

      if (profile.smokesCigarettes) {
        mapped.smoking = findOptionLabel(profile.smokesCigarettes, QUESTION_OPTIONS.smoking);
      }
      if (profile.smokesWeed) {
        mapped.marijuana = findOptionLabel(profile.smokesWeed, QUESTION_OPTIONS.marijuana);
      }
      if (profile.alcohol) {
        mapped.alcohol = findOptionLabel(profile.alcohol, QUESTION_OPTIONS.alcohol);
      }
      if (profile.petsOwned) {
        const petsValue = profile.petsOwned.length === 0 ? "none" : profile.petsOwned[0];
        mapped.pets = findOptionLabel(petsValue, QUESTION_OPTIONS.pets);
      }
      if (profile.petsOk) {
        mapped.acceptPets = findOptionLabel(profile.petsOk, QUESTION_OPTIONS.acceptPets);
      }
      if (profile.tidiness) {
        mapped.tidiness = findOptionLabel(profile.tidiness, QUESTION_OPTIONS.tidiness);
      }
      if (profile.guestsFreq) {
        mapped.visitors = findOptionLabel(profile.guestsFreq, QUESTION_OPTIONS.visitors);
      }
      if (profile.schedule) {
        mapped.sleepRoutine = findOptionLabel(profile.schedule, QUESTION_OPTIONS.sleepRoutine);
        mapped.workRoutine = findOptionLabel(profile.schedule, QUESTION_OPTIONS.workRoutine);
      }

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [fullProfile]);

  // Cargar search preferences
  useEffect(() => {
    if (searchPrefsData) {
      const mapped: Record<string, string> = {};
      mapped.noCigarettes =
        findOptionLabel(
          searchPrefsData.noCigarettes ? "true" : "false",
          QUESTION_OPTIONS.noCigarettes,
        ) || "Seleccionar";
      mapped.noWeed =
        findOptionLabel(searchPrefsData.noWeed ? "true" : "false", QUESTION_OPTIONS.noWeed) ||
        "Seleccionar";
      const petsValue = searchPrefsData.noPets
        ? "noPets"
        : searchPrefsData.petsRequired
          ? "petsRequired"
          : "none";
      mapped.petsPreference =
        findOptionLabel(petsValue, QUESTION_OPTIONS.petsPreference) || "Seleccionar";

      if (searchPrefsData.tidinessMin) {
        mapped.tidinessMin =
          findOptionLabel(searchPrefsData.tidinessMin, QUESTION_OPTIONS.tidinessMin) ||
          "Seleccionar";
      }
      if (searchPrefsData.schedulePref) {
        mapped.schedulePref =
          findOptionLabel(searchPrefsData.schedulePref, QUESTION_OPTIONS.schedulePref) ||
          "Seleccionar";
      }
      if (searchPrefsData.guestsMax) {
        mapped.guestsMax =
          findOptionLabel(searchPrefsData.guestsMax, QUESTION_OPTIONS.guestsMax) || "Seleccionar";
      }
      if (searchPrefsData.musicMax) {
        mapped.musicMax =
          findOptionLabel(searchPrefsData.musicMax, QUESTION_OPTIONS.musicMax) || "Seleccionar";
      }

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [searchPrefsData]);

  // Cargar search filters
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

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [searchFiltersData]);

  const handleUpdate = useCallback(
    (question: string, value: string) => {
      const profileMapping: Record<string, keyof UserProfileData> = {
        smoking: "smokingStatus",
        marijuana: "marijuanaStatus",
        alcohol: "alcoholStatus",
        pets: "hasPets",
        acceptPets: "acceptsPets",
        tidiness: "tidinessLevel",
        visitors: "socialLife",
        sleepRoutine: "sleepTime",
        workRoutine: "workSchedule",
      };

      if (profileMapping[question]) {
        updateProfileData(profileMapping[question], value);
      } else if (question === "noCigarettes") {
        updateSearchPrefs("noCigarettes", value === "true");
      } else if (question === "noWeed") {
        updateSearchPrefs("noWeed", value === "true");
      } else if (question === "petsPreference") {
        updateSearchPrefs("noPets", value === "noPets");
        updateSearchPrefs("petsRequired", value === "petsRequired");
      } else if (["tidinessMin", "schedulePref", "guestsMax", "musicMax"].includes(question)) {
        updateSearchPrefs(question as any, value);
      } else if (question === "genderPref") {
        updateSearchFilters("genderPref", [value]);
      } else if (question === "onlyWithPhoto") {
        updateSearchFilters("onlyWithPhoto", value === "true");
      }
    },
    [updateProfileData, updateSearchPrefs, updateSearchFilters],
  );

  return {
    aboutText,
    setAboutText,
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
    profileData,
    profileHasChanges,
    saveProfileData,
    resetToUserData,
    searchPrefsHasChanges,
    saveSearchPrefs,
    resetSearchPrefs,
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    updateSearchFilters,
    saving,
    searchPrefsSaving,
    searchFiltersSaving,
    handleUpdate,
  };
};
