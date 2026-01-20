import { findOptionLabel } from "../../roommate/hooks/useRoommatePreferencesLogic";
import { useUserProfileData } from "../../../hooks/useUserProfileData";
import { QUESTION_OPTIONS } from "../../../constants/questionOptions";
import { useEffect, useCallback, useState, useRef } from "react";
import { UserProfileData } from "../../../interfaces";

export interface UseAboutPreferencesLogicReturn {
  aboutText: string;
  setAboutText: (text: string) => void;
  profileData: UserProfileData;
  aboutHasChanges: boolean;
  aboutSaving: boolean;
  aboutLoading: boolean;

  updateAboutPreference: (question: string, value: string | string[]) => void;

  saveAboutPrefs: () => Promise<void>;
  resetAboutPrefs: () => void;

  mapAboutPrefsToSelectedAnswers: () => Record<string, string>;
  resetAboutPrefsInSelectedAnswers: () => Record<string, string>;
  initializeSelectedAnswers: () => void;
  getChanges: () => Partial<UserProfileData>;
}

// Configuración centralizada de mapeo
const FIELD_MAPPING: {
  questionKey: string;
  profileField: keyof UserProfileData;
  optionsKey: keyof typeof QUESTION_OPTIONS;
}[] = [
  { questionKey: "smoking", profileField: "smokingStatus", optionsKey: "smoking" },
  { questionKey: "marijuana", profileField: "marijuanaStatus", optionsKey: "marijuana" },
  { questionKey: "alcohol", profileField: "alcoholStatus", optionsKey: "alcohol" },
  { questionKey: "pets", profileField: "hasPets", optionsKey: "pets" },
  { questionKey: "petsOwned", profileField: "petsOwned", optionsKey: "petsOwned" },
  { questionKey: "acceptPets", profileField: "acceptsPets", optionsKey: "acceptPets" },
  { questionKey: "tidiness", profileField: "tidinessLevel", optionsKey: "tidiness" },
  { questionKey: "visitors", profileField: "socialLife", optionsKey: "visitors" },
  { questionKey: "sleepRoutine", profileField: "sleepTime", optionsKey: "sleepRoutine" },
  { questionKey: "cooking", profileField: "cooking", optionsKey: "cooking" },
  { questionKey: "diet", profileField: "diet", optionsKey: "diet" },
  { questionKey: "sharePolicy", profileField: "sharePolicy", optionsKey: "sharePolicy" },
  { questionKey: "interests", profileField: "interests", optionsKey: "interests" },
  { questionKey: "zodiacSign", profileField: "zodiacSign", optionsKey: "zodiacSign" },
];

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
    getChanges,
  } = useUserProfileData();

  const [aboutText, setAboutText] = useState("");
  const isInitializedRef = useRef(false);
  const isBioInitializedRef = useRef(false);

  // Inicializar aboutText con el valor de profileData.bio cuando esté disponible
  useEffect(() => {
    if (profileData?.bio !== undefined && !isBioInitializedRef.current) {
      setAboutText(profileData.bio || "");
      isBioInitializedRef.current = true;
    }
  }, [profileData?.bio]);

  // Solo actualizar profileData.bio cuando aboutText cambie DESPUÉS de la inicialización
  useEffect(() => {
    if (!isBioInitializedRef.current) return; // No hacer nada hasta que esté inicializado

    if (aboutText !== (profileData.bio || "")) {
      updateProfileData("bio", aboutText);
    }
  }, [aboutText, profileData.bio, updateProfileData]);

  const mapAboutPrefsToSelectedAnswers = useCallback((): Record<string, string> => {
    const mapped: Record<string, string> = {};

    if (!profileData) return mapped;

    FIELD_MAPPING.forEach(({ questionKey, profileField, optionsKey }) => {
      const value = profileData[profileField];
      if (!value) return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          const labels = value
            .map(val => findOptionLabel(val as string, QUESTION_OPTIONS[optionsKey]) || val)
            .filter(Boolean);
          mapped[questionKey] = labels.join(", ");
        }
      } else {
        mapped[questionKey] =
          findOptionLabel(value as string, QUESTION_OPTIONS[optionsKey]) || "Seleccionar";
      }
    });

    return mapped;
  }, [profileData]);

  useEffect(() => {
    if (fullProfile?.profile && !isInitializedRef.current) {
      const profile = fullProfile.profile;
      if (profile.bio !== undefined) {
        setAboutText(profile.bio || "");
        isBioInitializedRef.current = true;
      }
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

  const updateAboutPreference = useCallback(
    (question: string, value: string | string[]) => {
      const fieldConfig = FIELD_MAPPING.find(config => config.questionKey === question);

      if (fieldConfig) {
        updateProfileData(fieldConfig.profileField, value);
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

      // Confiamos en profileData ya que se inicializa correctamente desde useCachedProfile
      const aboutMapped = mapAboutPrefsToSelectedAnswers();
      Object.assign(mapped, aboutMapped);

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [fullProfile, user, setSelectedAnswers, mapAboutPrefsToSelectedAnswers]);

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
    getChanges,
  };
};
