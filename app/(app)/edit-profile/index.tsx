import React, { useState, useRef } from "react";
import { Animated, StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import TabTransition from "../../../components/TabTransition";
import {
  SelectionModal,
  PersonalDataTab,
  AboutTab,
  RoommateTab,
  ExpandableTab,
  EditProfileHeaderSection,
  UnsavedChangesModal,
} from "../../../features/profile/components";
import type { TabType } from "../../../features/profile/components";
import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { useEditProfileLogic, useRoommateTabModal } from "../../../features/profile/hooks";
import { useTheme } from "../../../context/ThemeContext";
import LoadingScreen from "@/components/LoadingScreen";
import { LoadingModal } from "@/components";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] = useState(false);
  // Estado del modal para tabs que no son roomie
  const [otherTabsModalVisible, setOtherTabsModalVisible] = useState(false);
  const [otherTabsSelectedQuestion, setOtherTabsSelectedQuestion] = useState("");
  const [otherTabsSelectedValue, setOtherTabsSelectedValue] = useState("");
  const scrollViewRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentScrollYRef = useRef(0);

  const {
    aboutText,
    setAboutText,
    selectedAnswers,
    setSelectedAnswers,
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
  } = useEditProfileLogic();

  const isSaving = saving || searchPrefsSaving;

  // Hook para la lógica del modal de roomie
  const roommateTabModal = useRoommateTabModal({
    roommatePrefsData,
    handleUpdate,
    selectedAnswers,
    setSelectedAnswers,
    isSaving,
  });

  // Lógica del modal para otras tabs (about y data)
  const openSelectionModal = (questionKey: string) => {
    if (isSaving) return;

    // Si es un campo de roomie, usar el hook de roomie
    if (
      [
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
      ].includes(questionKey)
    ) {
      roommateTabModal.openSelectionModal(questionKey);
      return;
    }

    // Para otras tabs
    setOtherTabsSelectedQuestion(questionKey);
    const selectedLabel = selectedAnswers[questionKey];
    const options = QUESTION_OPTIONS[questionKey as keyof typeof QUESTION_OPTIONS];
    const selectedOption = options?.find(option => option.label === selectedLabel);
    setOtherTabsSelectedValue(selectedOption?.value ?? "");
    setOtherTabsModalVisible(true);
  };

  const closeOtherTabsModal = () => {
    setOtherTabsModalVisible(false);
    setOtherTabsSelectedQuestion("");
    setOtherTabsSelectedValue("");
  };

  const handleOtherTabsModalSelect = (value: string) => {
    setOtherTabsSelectedValue(value);
  };

  const confirmOtherTabsSelection = () => {
    if (!otherTabsSelectedValue) return;

    const options =
      QUESTION_OPTIONS[otherTabsSelectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
    const selectedOption = options.find(option => option.value === otherTabsSelectedValue);
    const selectedLabel = selectedOption?.label ?? "";

    setSelectedAnswers(prev => ({ ...prev, [otherTabsSelectedQuestion]: selectedLabel }));
    handleUpdate(otherTabsSelectedQuestion, otherTabsSelectedValue);
    closeOtherTabsModal();
  };

  const getSelectedLabel = (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar";

  const hasBeenInitializedRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
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

  const handleBack = () => {
    const hasAnyUnsavedChanges = profileHasChanges || searchPrefsHasChanges;
    if (hasAnyUnsavedChanges) {
      setUnsavedChangesModalVisible(true);
    } else {
      router.replace("/(app)/profile");
    }
  };

  const handleDiscardChanges = async () => {
    if (profileHasChanges) resetToUserData();
    if (searchPrefsHasChanges) {
      await reinitializeSearchPrefs();
    } else {
      resetSearchPrefs();
    }
    resetUserFields();
    resetAboutAndAnswers();

    setUnsavedChangesModalVisible(false);
    router.replace("/(app)/profile");
  };

  const handleSaveAndExit = async () => {
    try {
      const savePromises: Promise<void>[] = [];
      if (profileHasChanges) savePromises.push(saveProfileData());
      savePromises.push(saveUserFields());
      if (searchPrefsHasChanges) savePromises.push(saveSearchPrefs());

      await Promise.all(savePromises);

      Toast.show({
        type: "success",
        text1: "¡Listo!",
        text2: "Tu perfil se actualizó correctamente",
        position: "bottom",
        visibilityTime: 3000,
      });

      setUnsavedChangesModalVisible(false);
      router.replace("/(app)/profile");
    } catch (error) {
      console.error("❌ Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "No se pudo guardar",
        position: "bottom",
        visibilityTime: 4000,
      });
    }
  };

  const handleSave = async () => {
    try {
      const savePromises: Promise<void>[] = [];

      if (profileHasChanges) {
        savePromises.push(saveProfileData());
      }

      if (userFieldsChanged) {
        savePromises.push(saveUserFields());
      }

      if (searchPrefsHasChanges) {
        savePromises.push(saveSearchPrefs());
      }

      if (savePromises.length === 0) {
        Toast.show({
          type: "info",
          text1: "Sin cambios",
          text2: "No hay cambios para guardar",
          position: "bottom",
          visibilityTime: 2000,
        });
        return;
      }

      await Promise.all(savePromises);
      Toast.show({
        type: "success",
        text1: "¡Listo!",
        text2: "Tu perfil se actualizó correctamente",
        position: "bottom",
        visibilityTime: 3000,
      });
      router.replace("/(app)/profile");
    } catch (error) {
      console.error("❌ Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "No se pudo guardar",
        position: "bottom",
        visibilityTime: 4000,
      });
    }
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: any) => {
      currentScrollYRef.current = event.nativeEvent.contentOffset.y;
    },
  });

  const handleExpandHeader = () => {
    const currentScrollY = currentScrollYRef.current;

    if (currentScrollY === 0) return;

    const duration = 800;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing suave (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const targetY = currentScrollY * (1 - easedProgress);

      scrollViewRef.current?.scrollTo({ y: targetY, animated: false });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <TabTransition>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#FFFFFF" />
        <LoadingModal visible={isSaving} />
        <EditProfileHeaderSection
          scrollY={scrollY}
          activeTab={activeTab}
          onTabChange={isSaving ? () => {} : setActiveTab}
          onBack={isSaving ? () => {} : handleBack}
          onSave={handleSave}
          isSaving={isSaving}
        />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* Tab Content */}
          <Animated.ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={!isSaving}
          >
            <View style={styles.contentContainer}>
              {activeTab === "data" && (
                <PersonalDataTab
                  getSelectedLabel={getSelectedLabel}
                  openSelectionModal={openSelectionModal}
                />
              )}
              {activeTab === "about" && (
                <AboutTab
                  aboutText={aboutText}
                  setAboutText={setAboutText}
                  getSelectedLabel={getSelectedLabel}
                  openSelectionModal={openSelectionModal}
                />
              )}
              {activeTab === "roommate" && (
                <RoommateTab
                  getSelectedLabel={getSelectedLabel}
                  openSelectionModal={openSelectionModal}
                />
              )}
            </View>
          </Animated.ScrollView>

          {/* Modal para roomie */}
          {activeTab === "roommate" && (
            <SelectionModal
              visible={roommateTabModal.modalVisible && !isSaving}
              title={QUESTION_TITLES[roommateTabModal.selectedQuestion] ?? ""}
              options={
                QUESTION_OPTIONS[
                  roommateTabModal.selectedQuestion as keyof typeof QUESTION_OPTIONS
                ] ?? []
              }
              selectedValue={roommateTabModal.selectedValue}
              onSelect={roommateTabModal.handleModalSelect}
              onClose={roommateTabModal.closeModal}
              onConfirm={roommateTabModal.confirmSelection}
              isMultiSelect={roommateTabModal.isArrayField(roommateTabModal.selectedQuestion)}
              selectedValues={
                roommateTabModal.isArrayField(roommateTabModal.selectedQuestion)
                  ? roommateTabModal.modalSelectedValues
                  : []
              }
            />
          )}

          {/* Modal para otras tabs */}
          {activeTab !== "roommate" && (
            <SelectionModal
              visible={otherTabsModalVisible && !isSaving}
              title={QUESTION_TITLES[otherTabsSelectedQuestion] ?? ""}
              options={
                QUESTION_OPTIONS[otherTabsSelectedQuestion as keyof typeof QUESTION_OPTIONS] ?? []
              }
              selectedValue={otherTabsSelectedValue}
              onSelect={handleOtherTabsModalSelect}
              onClose={closeOtherTabsModal}
              onConfirm={confirmOtherTabsSelection}
              isMultiSelect={false}
              selectedValues={[]}
            />
          )}
        </SafeAreaView>
      </View>
      <ExpandableTab scrollY={scrollY} onExpand={handleExpandHeader} />
      <UnsavedChangesModal
        visible={unsavedChangesModalVisible}
        onDiscard={handleDiscardChanges}
        onSaveAndExit={handleSaveAndExit}
        onCancel={() => setUnsavedChangesModalVisible(false)}
        isSaving={isSaving}
      />
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 150,
    paddingBottom: 20,
  },
  contentContainer: {
    backgroundColor: "#F8F9FA",
    marginTop: 20,
  },
});
