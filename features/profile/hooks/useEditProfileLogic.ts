import { useAboutPreferencesLogic } from "../components/about/hooks/useAboutPreferencesLogic";
import { useDataPreferencesLogic } from "../components/data/hooks/useDataPreferencesLogic";
import { useState, useEffect, useCallback, useRef } from "react";
import { QUESTION_OPTIONS } from "../constants/questionOptions";
import { useAuth } from "../../../context/AuthContext";
import { useCachedProfile } from "./useCachedProfile";
import {
  useRoommatePreferencesLogic,
  findOptionLabel,
} from "../components/roommate/hooks/useRoommatePreferencesLogic";

export const useEditProfileLogic = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const { fullProfile } = useCachedProfile();

  const {
    roommatePrefsData,
    roommatePrefsHasChanges,
    roommatePrefsSaving,
    updateRoommatePreference,
    saveRoommatePrefs,
    resetRoommatePrefs,
    reinitializeRoommatePrefs,
    resetRoommatePrefsInSelectedAnswers,
  } = useRoommatePreferencesLogic(setSelectedAnswers);

  const {
    aboutText,
    setAboutText,
    profileData,
    aboutHasChanges,
    aboutSaving,
    updateAboutPreference,
    saveAboutPrefs,
    resetAboutPrefs,
    resetAboutPrefsInSelectedAnswers,
    initializeSelectedAnswers,
  } = useAboutPreferencesLogic(setSelectedAnswers, fullProfile, user);

  const {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    birthDate,
    locationModalVisible,
    setLocationModalVisible,
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    handleLocationConfirm,
    draftLocation,
    dataHasChanges,
    dataSaving,
    setGender: setDataGender,
    saveDataPrefs,
    resetDataPrefs,
  } = useDataPreferencesLogic();

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (fullProfile?.profile && profileData && !isInitializedRef.current) {
      initializeSelectedAnswers();
      isInitializedRef.current = true;
    }
  }, [fullProfile, user, profileData, initializeSelectedAnswers]);

  const handleUpdate = useCallback(
    (question: string, value: string | string[]) => {
      if (
        [
          "smoking",
          "marijuana",
          "alcohol",
          "pets",
          "petsOwned",
          "acceptPets",
          "tidiness",
          "visitors",
          "sleepRoutine",
          "cooking",
          "diet",
          "sharePolicy",
          "interests",
        ].includes(question)
      ) {
        updateAboutPreference(question, value);
      } else if (
        [
          "noCigarettes",
          "noWeed",
          "petsPreference",
          "tidinessMin",
          "schedulePref",
          "guestsMax",
          "musicMax",
          "languagesPref",
          "interestsPref",
          "zodiacPref",
        ].includes(question)
      ) {
        updateRoommatePreference(question, value as string);
      } else if (question === "gender") {
        const genderValue = value as string;
        setDataGender(genderValue);
        setSelectedAnswers(prev => ({
          ...prev,
          gender: findOptionLabel(genderValue, QUESTION_OPTIONS.gender) || "Seleccionar",
        }));
      }
    },
    [updateAboutPreference, updateRoommatePreference, setDataGender],
  );

  const saveUserFields = useCallback(async (): Promise<void> => {
    await saveDataPrefs();
  }, [saveDataPrefs]);

  const resetUserFields = useCallback(() => {
    resetDataPrefs();
  }, [resetDataPrefs]);

  const resetAboutAndAnswers = useCallback(() => {
    if (fullProfile?.profile) {
      const mapped: Record<string, string> = {};

      if (user?.gender) {
        mapped.gender = findOptionLabel(user.gender, QUESTION_OPTIONS.gender) || "Seleccionar";
      }

      const aboutMapped = resetAboutPrefsInSelectedAnswers();
      Object.assign(mapped, aboutMapped);

      const roommateMapped = resetRoommatePrefsInSelectedAnswers();
      Object.assign(mapped, roommateMapped);

      setSelectedAnswers(mapped);
    }
  }, [fullProfile, user, resetAboutPrefsInSelectedAnswers, resetRoommatePrefsInSelectedAnswers]);

  const reinitializeState = useCallback(() => {
    isInitializedRef.current = false;
    resetAboutAndAnswers();
  }, [resetAboutAndAnswers]);

  return {
    aboutText,
    setAboutText,
    selectedAnswers,
    setSelectedAnswers,
    profileData,
    aboutHasChanges,
    profileHasChanges: aboutHasChanges || dataHasChanges || roommatePrefsHasChanges,
    userFieldsChanged: dataHasChanges,
    // data tab state/actions (single source of truth)
    data: {
      firstName,
      lastName,
      bio,
      occupation,
      education,
      birthDate,
      locationModalVisible,
      setLocationModalVisible,
      setFirstName,
      setLastName,
      setBio,
      setOccupation,
      setEducation,
      setBirthDate,
      handleLocationConfirm,
      draftLocation,
    },
    saveProfileData: saveAboutPrefs,
    resetToUserData: resetAboutPrefs,
    saveUserFields,
    resetUserFields,
    searchPrefsHasChanges: roommatePrefsHasChanges,
    saveSearchPrefs: saveRoommatePrefs,
    resetSearchPrefs: resetRoommatePrefs,
    reinitializeSearchPrefs: reinitializeRoommatePrefs,
    saving: aboutSaving || dataSaving,
    searchPrefsSaving: roommatePrefsSaving,
    handleUpdate,
    resetAboutAndAnswers,
    reinitializeState,
    roommatePrefsData,
  };
};
