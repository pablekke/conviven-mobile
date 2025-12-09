import { useAboutPreferencesLogic } from "../components/about/hooks/useAboutPreferencesLogic";
import { useState, useEffect, useCallback, useRef } from "react";
import { QUESTION_OPTIONS } from "../constants/questionOptions";
import ProfileService from "../services/profileService";
import { useAuth } from "../../../context/AuthContext";
import { useCachedProfile } from "./useCachedProfile";
import {
  useRoommatePreferencesLogic,
  findOptionLabel,
} from "../components/roommate/hooks/useRoommatePreferencesLogic";

export const useEditProfileLogic = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [userFieldsChanged, setUserFieldsChanged] = useState(false);
  const originalUserFieldsRef = useRef<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    profession?: string;
    hobby?: string;
    bio?: string;
  }>({});

  const { user, updateUser } = useAuth();
  const { fullProfile } = useCachedProfile();

  useEffect(() => {
    if (user) {
      originalUserFieldsRef.current = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
        profession: user.profession || "",
        hobby: user.hobby || "",
        bio: user.bio || "",
      };
      setUserFieldsChanged(false);
    }
  }, [user?.id]);
  useEffect(() => {
    if (!user) {
      setUserFieldsChanged(false);
      return;
    }

    const original = originalUserFieldsRef.current;
    const hasChanges =
      (user.firstName || "") !== (original.firstName || "") ||
      (user.lastName || "") !== (original.lastName || "") ||
      (user.phone || "") !== (original.phone || "") ||
      (user.birthDate || "") !== (original.birthDate || "") ||
      (user.gender || "") !== (original.gender || "") ||
      (user.profession || "") !== (original.profession || "") ||
      (user.hobby || "") !== (original.hobby || "") ||
      (user.bio || "") !== (original.bio || "");

    setUserFieldsChanged(hasChanges);
  }, [
    user?.firstName,
    user?.lastName,
    user?.phone,
    user?.birthDate,
    user?.gender,
    user?.profession,
    user?.hobby,
    user?.bio,
  ]);

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

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (fullProfile?.profile && profileData && !isInitializedRef.current) {
      initializeSelectedAnswers();
      isInitializedRef.current = true;
    }
  }, [fullProfile, user, profileData, initializeSelectedAnswers]);

  const handleUpdate = useCallback(
    (question: string, value: string) => {
      if (
        [
          "smoking",
          "marijuana",
          "alcohol",
          "pets",
          "acceptPets",
          "tidiness",
          "visitors",
          "sleepRoutine",
          "workRoutine",
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
        updateRoommatePreference(question, value);
      } else if (question === "gender") {
        if (user) {
          ProfileService.update(user.id, { gender: value as any })
            .then(updatedUser => {
              updateUser(updatedUser);
              setSelectedAnswers(prev => ({
                ...prev,
                gender: findOptionLabel(value, QUESTION_OPTIONS.gender) || "Seleccionar",
              }));
            })
            .catch(error => {
              console.error("Error actualizando género:", error);
            });
        }
      }
    },
    [updateAboutPreference, updateRoommatePreference, user, updateUser],
  );

  const saveUserFields = useCallback(async (): Promise<void> => {
    if (!user || !userFieldsChanged) return Promise.resolve();

    const payload: any = {};
    const original = originalUserFieldsRef.current;

    if ((user.firstName || "") !== (original.firstName || "")) {
      payload.firstName = user.firstName;
    }
    if ((user.lastName || "") !== (original.lastName || "")) {
      payload.lastName = user.lastName;
    }
    if ((user.phone || "") !== (original.phone || "")) {
      payload.phone = user.phone;
    }
    if ((user.birthDate || "") !== (original.birthDate || "")) {
      payload.birthDate = user.birthDate;
    }
    if ((user.gender || "") !== (original.gender || "")) {
      payload.gender = user.gender;
    }
    if ((user.profession || "") !== (original.profession || "")) {
      payload.profession = user.profession;
    }
    if ((user.hobby || "") !== (original.hobby || "")) {
      payload.hobby = user.hobby;
    }
    if ((user.bio || "") !== (original.bio || "")) {
      payload.bio = user.bio;
    }

    if (Object.keys(payload).length > 0) {
      const updatedUser = await ProfileService.update(user.id, payload);
      updateUser(updatedUser);
      originalUserFieldsRef.current = {
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        phone: updatedUser.phone || "",
        birthDate: updatedUser.birthDate || "",
        gender: updatedUser.gender || "",
        profession: updatedUser.profession || "",
        hobby: updatedUser.hobby || "",
        bio: updatedUser.bio || "",
      };
      setUserFieldsChanged(false);
    }
  }, [user, userFieldsChanged, updateUser]);

  const resetUserFields = useCallback(() => {
    if (!user) return;
    const original = originalUserFieldsRef.current;
    updateUser({
      firstName: original.firstName,
      lastName: original.lastName,
      phone: original.phone,
      birthDate: original.birthDate,
      gender: original.gender as any,
      profession: original.profession,
      hobby: original.hobby,
      bio: original.bio,
    });
    setUserFieldsChanged(false);
  }, [user, updateUser]);

  const resetAboutAndAnswers = useCallback(() => {
    if (fullProfile?.profile) {
      const mapped: Record<string, string> = {};

      if (user?.gender) {
        mapped.gender = findOptionLabel(user.gender, QUESTION_OPTIONS.gender) || "Seleccionar";
      }

      const aboutMapped = resetAboutPrefsInSelectedAnswers();
      Object.assign(mapped, aboutMapped);

      // Agregar roommate preferences mapeadas
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
    profileHasChanges: aboutHasChanges || userFieldsChanged || roommatePrefsHasChanges,
    userFieldsChanged,
    saveProfileData: saveAboutPrefs,
    resetToUserData: resetAboutPrefs,
    saveUserFields,
    resetUserFields,
    searchPrefsHasChanges: roommatePrefsHasChanges,
    saveSearchPrefs: saveRoommatePrefs,
    resetSearchPrefs: resetRoommatePrefs,
    reinitializeSearchPrefs: reinitializeRoommatePrefs,
    saving: aboutSaving,
    searchPrefsSaving: roommatePrefsSaving,
    handleUpdate,
    resetAboutAndAnswers,
    reinitializeState,
    roommatePrefsData,
  };
};
