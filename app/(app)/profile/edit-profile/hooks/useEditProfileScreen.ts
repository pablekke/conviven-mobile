import { useRoommateTabModal } from "../../../../../features/profile/components/roommate/hooks/useRoommateTabModal";
import { useOtherTabsSelectionModal } from "../../../../../features/profile/hooks/useOtherTabsSelectionModal";
import { useEditProfileLogic } from "../../../../../features/profile/hooks/useEditProfileLogic";
import type { TabType } from "../../../../../features/profile/components";
import { useCallback, useMemo, useRef, useState } from "react";
import { useEditProfileScroll } from "./useEditProfileScroll";
import { useAuth } from "../../../../../context/AuthContext";
import { useEditProfileSave } from "./useEditProfileSave";
import { useFocusEffect } from "expo-router";

export const useEditProfileScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const hasBeenInitializedRef = useRef(false);

  const {
    selectedAnswers,
    setSelectedAnswers,
    profileData,
    aboutHasChanges,
    profileHasChanges,
    userFieldsChanged,
    saveProfileData,
    resetToUserData,
    saveUserFields,
    resetUserFields,
    searchPrefsHasChanges,
    saveSearchPrefs,
    resetSearchPrefs,
    reinitializeSearchPrefs,
    saving,
    searchPrefsSaving,
    handleUpdate,
    resetAboutAndAnswers,
    reinitializeState,
    roommatePrefsData,
    data,
  } = useEditProfileLogic();

  const isSaving = saving || searchPrefsSaving;

  const roommateQuestionKeys = useMemo(
    () =>
      new Set([
        "languagesPref",
        "interestsPref",
        "zodiacPref",
        "noCigarettes",
        "noWeed",
        "petsPreference",
        "tidinessMin",
        "schedulePref",
        "guestsMax",
        "musicMax",
      ]),
    [],
  );

  const roommateTabModal = useRoommateTabModal({
    roommatePrefsData,
    handleUpdate,
    selectedAnswers,
    setSelectedAnswers,
    isSaving,
  });

  const otherTabsModal = useOtherTabsSelectionModal({
    isSaving,
    selectedAnswers,
    setSelectedAnswers,
    profileData,
    handleUpdate,
  });

  const openSelectionModal = useCallback(
    (questionKey: string) => {
      if (isSaving) return;
      if (roommateQuestionKeys.has(questionKey)) {
        roommateTabModal.openSelectionModal(questionKey);
        return;
      }
      otherTabsModal.open(questionKey);
    },
    [isSaving, otherTabsModal, roommateQuestionKeys, roommateTabModal],
  );

  const getSelectedLabel = useCallback(
    (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar",
    [selectedAnswers],
  );

  useFocusEffect(
    useCallback(() => {
      if (!hasBeenInitializedRef.current) {
        hasBeenInitializedRef.current = true;
        return;
      }

      const hasChanges = profileHasChanges || searchPrefsHasChanges;
      if (!hasChanges) {
        reinitializeState();
      }
    }, [reinitializeState, profileHasChanges, searchPrefsHasChanges]),
  );

  const scroll = useEditProfileScroll();

  const save = useEditProfileSave({
    aboutHasChanges,
    userFieldsChanged,
    searchPrefsHasChanges,
    profileHasChanges,
    saveProfileData,
    saveUserFields,
    saveSearchPrefs,
    resetToUserData,
    resetUserFields,
    resetSearchPrefs,
    reinitializeSearchPrefs,
    resetAboutAndAnswers,
    isSaving,
  });

  return {
    user,
    activeTab,
    setActiveTab,
    selectedAnswers,
    setSelectedAnswers,
    data,
    roommateTabModal,
    otherTabsModal,
    openSelectionModal,
    getSelectedLabel,
    ...scroll,
    ...save,
  };
};
