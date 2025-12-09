import { findOptionLabel } from "../../roommate/hooks/useRoommatePreferencesLogic";
import { useUserProfileData } from "../../../hooks/useUserProfileData";
import { QUESTION_OPTIONS } from "../../../constants/questionOptions";
import { useEffect, useCallback, useState, useRef } from "react";
import { UserProfileData } from "../../../interfaces";
import {
  SmokesCigarettes,
  SmokesWeed,
  Alcohol,
  PetType,
  PetsOk,
  Tidiness,
  Schedule,
  GuestsFreq,
} from "../../../enums/searchPreferences.enums";

export interface UseAboutPreferencesLogicReturn {
  aboutText: string;
  setAboutText: (text: string) => void;
  profileData: UserProfileData;
  aboutHasChanges: boolean;
  aboutSaving: boolean;
  aboutLoading: boolean;

  updateAboutPreference: (question: string, value: string) => void;

  saveAboutPrefs: () => Promise<void>;
  resetAboutPrefs: () => void;

  mapAboutPrefsToSelectedAnswers: () => Record<string, string>;
  resetAboutPrefsInSelectedAnswers: () => Record<string, string>;
  initializeSelectedAnswers: () => void;
}

export const useAboutPreferencesLogic = (
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fullProfile: any,
  user: any,
): UseAboutPreferencesLogicReturn => {
  const {
    profileData,
    saving: aboutSaving,
    loading: aboutLoading,
    updateProfileData,
    saveProfileData,
    resetToUserData,
    hasChanges: aboutHasChanges,
  } = useUserProfileData();

  const [aboutText, setAboutText] = useState("");
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (aboutText !== profileData.bio) {
      updateProfileData("bio", aboutText);
    }
  }, [aboutText, profileData.bio, updateProfileData]);

  const normalizeValue = (value: string, field: string): string => {
    if (!value) return value;

    const lowerValue = value.trim().toLowerCase();
    const upperValue = value.trim().toUpperCase();
    if (field === "smokingStatus") {
      if (lowerValue === "no") return SmokesCigarettes.NO;
      if (lowerValue === "yes" || upperValue === SmokesCigarettes.REGULAR)
        return SmokesCigarettes.REGULAR;
      if (lowerValue === "social" || upperValue === SmokesCigarettes.SOCIALLY)
        return SmokesCigarettes.SOCIALLY;
      if (Object.values(SmokesCigarettes).includes(upperValue as SmokesCigarettes)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "marijuanaStatus") {
      if (lowerValue === "no") return SmokesWeed.NO;
      if (lowerValue === "yes" || upperValue === SmokesWeed.REGULAR) return SmokesWeed.REGULAR;
      if (lowerValue === "social" || upperValue === SmokesWeed.SOCIALLY) return SmokesWeed.SOCIALLY;
      // Si ya está en formato enum, devolverlo tal cual
      if (Object.values(SmokesWeed).includes(upperValue as SmokesWeed)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "alcoholStatus") {
      if (lowerValue === "no") return Alcohol.NO;
      if (lowerValue === "regularly" || upperValue === Alcohol.REGULAR) return Alcohol.REGULAR;
      if (lowerValue === "socially" || upperValue === Alcohol.SOCIALLY) return Alcohol.SOCIALLY;
      if (Object.values(Alcohol).includes(upperValue as Alcohol)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "hasPets") {
      if (lowerValue === "none") return "none";
      if (lowerValue === "dog" || upperValue === PetType.DOG) return PetType.DOG;
      if (lowerValue === "cat" || upperValue === PetType.CAT) return PetType.CAT;
      if (lowerValue === "other" || upperValue === PetType.OTHER) return PetType.OTHER;
      if (Object.values(PetType).includes(upperValue as PetType)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "acceptsPets") {
      if (upperValue === "NO_PETS" || lowerValue === "no_pets") return PetsOk.NO;
      if (upperValue === PetsOk.CATS_DOGS_OK || lowerValue === "cats_dogs_ok")
        return PetsOk.CATS_DOGS_OK;
      if (upperValue === PetsOk.CATS_OK || lowerValue === "cats_ok") return PetsOk.CATS_OK;
      if (upperValue === PetsOk.DOGS_OK || lowerValue === "dogs_ok") return PetsOk.DOGS_OK;
      if (Object.values(PetsOk).includes(upperValue as PetsOk)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "tidinessLevel") {
      if (lowerValue === "very_tidy" || upperValue === Tidiness.NEAT) return Tidiness.NEAT;
      if (lowerValue === "average" || upperValue === Tidiness.AVERAGE) return Tidiness.AVERAGE;
      if (lowerValue === "messy" || upperValue === Tidiness.CHILL) return Tidiness.CHILL;
      if (Object.values(Tidiness).includes(upperValue as Tidiness)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "socialLife") {
      if (lowerValue === "often" || upperValue === GuestsFreq.WEEKLY_PLUS)
        return GuestsFreq.WEEKLY_PLUS;
      if (lowerValue === "sometimes" || upperValue === GuestsFreq.SOMETIMES)
        return GuestsFreq.SOMETIMES;
      if (lowerValue === "rarely" || upperValue === GuestsFreq.RARELY) return GuestsFreq.RARELY;
      if (Object.values(GuestsFreq).includes(upperValue as GuestsFreq)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "sleepTime") {
      if (lowerValue === "early_bird" || upperValue === Schedule.EARLY_BIRD)
        return Schedule.EARLY_BIRD;
      if (lowerValue === "night_owl" || upperValue === Schedule.NIGHT_OWL)
        return Schedule.NIGHT_OWL;
      if (lowerValue === "flexible" || upperValue === Schedule.MIXED) return Schedule.MIXED;
      if (Object.values(Schedule).includes(upperValue as Schedule)) {
        return upperValue;
      }
      return upperValue;
    }

    if (field === "workSchedule") {
      return lowerValue;
    }

    return upperValue;
  };

  const mapAboutPrefsToSelectedAnswers = useCallback((): Record<string, string> => {
    const mapped: Record<string, string> = {};

    if (!profileData) return mapped;

    if (profileData.smokingStatus && profileData.smokingStatus.trim() !== "") {
      const normalized = normalizeValue(profileData.smokingStatus, "smokingStatus");
      mapped.smoking = findOptionLabel(normalized, QUESTION_OPTIONS.smoking) || "Seleccionar";
    }
    if (profileData.marijuanaStatus && profileData.marijuanaStatus.trim() !== "") {
      const normalized = normalizeValue(profileData.marijuanaStatus, "marijuanaStatus");
      mapped.marijuana = findOptionLabel(normalized, QUESTION_OPTIONS.marijuana) || "Seleccionar";
    }
    if (profileData.alcoholStatus && profileData.alcoholStatus.trim() !== "") {
      const normalized = normalizeValue(profileData.alcoholStatus, "alcoholStatus");
      mapped.alcohol = findOptionLabel(normalized, QUESTION_OPTIONS.alcohol) || "Seleccionar";
    }
    if (profileData.hasPets && profileData.hasPets.trim() !== "") {
      const normalized = normalizeValue(profileData.hasPets, "hasPets");
      mapped.pets = findOptionLabel(normalized, QUESTION_OPTIONS.pets) || "Seleccionar";
    }
    if (profileData.acceptsPets && profileData.acceptsPets.trim() !== "") {
      const normalized = normalizeValue(profileData.acceptsPets, "acceptsPets");
      mapped.acceptPets = findOptionLabel(normalized, QUESTION_OPTIONS.acceptPets) || "Seleccionar";
    }
    if (profileData.tidinessLevel && profileData.tidinessLevel.trim() !== "") {
      const normalized = normalizeValue(profileData.tidinessLevel, "tidinessLevel");
      mapped.tidiness = findOptionLabel(normalized, QUESTION_OPTIONS.tidiness) || "Seleccionar";
    }
    if (profileData.socialLife && profileData.socialLife.trim() !== "") {
      const normalized = normalizeValue(profileData.socialLife, "socialLife");
      mapped.visitors = findOptionLabel(normalized, QUESTION_OPTIONS.visitors) || "Seleccionar";
    }
    if (profileData.sleepTime && profileData.sleepTime.trim() !== "") {
      const normalized = normalizeValue(profileData.sleepTime, "sleepTime");
      mapped.sleepRoutine =
        findOptionLabel(normalized, QUESTION_OPTIONS.sleepRoutine) || "Seleccionar";
    }
    if (profileData.workSchedule && profileData.workSchedule.trim() !== "") {
      const normalized = normalizeValue(profileData.workSchedule, "workSchedule");
      mapped.workRoutine =
        findOptionLabel(normalized, QUESTION_OPTIONS.workRoutine) || "Seleccionar";
    }

    return mapped;
  }, [profileData]);

  useEffect(() => {
    if (fullProfile?.profile && !isInitializedRef.current) {
      const profile = fullProfile.profile;
      if (profile.bio) setAboutText(profile.bio);
      isInitializedRef.current = true;
    }
  }, [fullProfile]);

  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      const mapped = mapAboutPrefsToSelectedAnswers();
      if (Object.keys(mapped).length > 0) {
        setSelectedAnswers(prev => ({ ...prev, ...mapped }));
      }
    }
  }, [profileData, setSelectedAnswers, mapAboutPrefsToSelectedAnswers]);

  const resetAboutPrefsInSelectedAnswers = useCallback((): Record<string, string> => {
    return mapAboutPrefsToSelectedAnswers();
  }, [mapAboutPrefsToSelectedAnswers]);

  const denormalizeValue = (value: string, field: string): string => {
    if (!value) return value;

    const upperValue = value.trim().toUpperCase();
    if (field === "smokingStatus" || field === "marijuanaStatus") {
      if (upperValue === SmokesCigarettes.NO) return "no";
      if (upperValue === SmokesCigarettes.REGULAR) return "yes";
      if (upperValue === SmokesCigarettes.SOCIALLY) return "social";
      // Si ya está en formato minúsculas, devolverlo tal cual
      return value.toLowerCase();
    }

    if (field === "alcoholStatus") {
      if (upperValue === Alcohol.NO) return "no";
      if (upperValue === Alcohol.REGULAR) return "regularly";
      if (upperValue === Alcohol.SOCIALLY) return "socially";
      return value.toLowerCase();
    }

    if (field === "hasPets") {
      if (value === "none") return "none";
      if (upperValue === PetType.DOG) return "dog";
      if (upperValue === PetType.CAT) return "cat";
      if (upperValue === PetType.OTHER) return "other";
      return value.toLowerCase();
    }

    if (field === "acceptsPets") {
      if (upperValue === PetsOk.NO || upperValue === "NO_PETS") return "no_pets";
      if (upperValue === PetsOk.CATS_DOGS_OK) return "cats_dogs_ok";
      if (upperValue === PetsOk.CATS_OK) return "cats_ok";
      if (upperValue === PetsOk.DOGS_OK) return "dogs_ok";
      return value.toLowerCase();
    }

    if (field === "tidinessLevel") {
      if (upperValue === Tidiness.NEAT) return "very_tidy";
      if (upperValue === Tidiness.AVERAGE) return "average";
      if (upperValue === Tidiness.CHILL) return "messy";
      return value.toLowerCase();
    }

    if (field === "socialLife") {
      if (upperValue === GuestsFreq.WEEKLY_PLUS) return "often";
      if (upperValue === GuestsFreq.SOMETIMES) return "sometimes";
      if (upperValue === GuestsFreq.RARELY) return "rarely";
      return value.toLowerCase();
    }

    if (field === "sleepTime") {
      if (upperValue === Schedule.EARLY_BIRD) return "early_bird";
      if (upperValue === Schedule.NIGHT_OWL) return "night_owl";
      if (upperValue === Schedule.MIXED) return "flexible";
      return value.toLowerCase();
    }

    if (field === "workSchedule") {
      return value.toLowerCase();
    }

    return value.toLowerCase();
  };

  const updateAboutPreference = useCallback(
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
        const field = profileMapping[question];
        const denormalizedValue = denormalizeValue(value, field);
        updateProfileData(field, denormalizedValue);
      }
    },
    [updateProfileData],
  );

  const initializeSelectedAnswers = useCallback(() => {
    if (fullProfile?.profile && user) {
      const mapped: Record<string, string> = {};

      if (user?.gender) {
        mapped.gender = findOptionLabel(user.gender, QUESTION_OPTIONS.gender) || "Seleccionar";
      }

      if (profileData && Object.keys(profileData).length > 0) {
        const aboutMapped = mapAboutPrefsToSelectedAnswers();
        Object.assign(mapped, aboutMapped);
      } else {
        const profile = fullProfile.profile;
        if (profile.smokesCigarettes) {
          mapped.smoking =
            findOptionLabel(profile.smokesCigarettes, QUESTION_OPTIONS.smoking) || "Seleccionar";
        }
        if (profile.smokesWeed) {
          mapped.marijuana =
            findOptionLabel(profile.smokesWeed, QUESTION_OPTIONS.marijuana) || "Seleccionar";
        }
        if (profile.alcohol) {
          mapped.alcohol =
            findOptionLabel(profile.alcohol, QUESTION_OPTIONS.alcohol) || "Seleccionar";
        }
        if (profile.petsOwned) {
          const petsValue = profile.petsOwned.length === 0 ? "none" : profile.petsOwned[0];
          mapped.pets = findOptionLabel(petsValue, QUESTION_OPTIONS.pets) || "Seleccionar";
        }
        if (profile.petsOk) {
          mapped.acceptPets =
            findOptionLabel(profile.petsOk, QUESTION_OPTIONS.acceptPets) || "Seleccionar";
        }
        if (profile.tidiness) {
          mapped.tidiness =
            findOptionLabel(profile.tidiness, QUESTION_OPTIONS.tidiness) || "Seleccionar";
        }
        if (profile.guestsFreq) {
          mapped.visitors =
            findOptionLabel(profile.guestsFreq, QUESTION_OPTIONS.visitors) || "Seleccionar";
        }
        if (profile.schedule) {
          mapped.sleepRoutine =
            findOptionLabel(profile.schedule, QUESTION_OPTIONS.sleepRoutine) || "Seleccionar";
          mapped.workRoutine =
            findOptionLabel(profile.schedule, QUESTION_OPTIONS.workRoutine) || "Seleccionar";
        }
      }

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [fullProfile, user, setSelectedAnswers, profileData, mapAboutPrefsToSelectedAnswers]);

  return {
    aboutText,
    setAboutText,
    profileData,
    aboutHasChanges,
    aboutSaving,
    aboutLoading,
    updateAboutPreference,
    saveAboutPrefs: saveProfileData,
    resetAboutPrefs: resetToUserData,
    mapAboutPrefsToSelectedAnswers,
    resetAboutPrefsInSelectedAnswers,
    initializeSelectedAnswers,
  };
};
