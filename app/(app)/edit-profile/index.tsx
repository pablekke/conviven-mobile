import {
  useEditProfileLogic,
  useOtherTabsSelectionModal,
  useRoommateTabModal,
} from "../../../features/profile/hooks";
import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import type { TabType } from "../../../features/profile/components";
import TabTransition from "../../../components/TabTransition";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { LoadingModal } from "@/components";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-ico-flags";
import { getFlagIconNameForLanguage } from "../../../utils/languageFlags";
import {
  SelectionModal,
  PersonalDataTab,
  AboutTab,
  RoommateTab,
  ExpandableTab,
  EditProfileHeaderSection,
  UnsavedChangesModal,
} from "../../../features/profile/components";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] = useState(false);

  const scrollViewRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentScrollYRef = useRef(0);

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

  const hasBeenInitializedRef = useRef(false);

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

  const buildSavePromises = useCallback((): Promise<void>[] => {
    const promises: Promise<void>[] = [];
    if (aboutHasChanges) promises.push(saveProfileData());
    if (userFieldsChanged) promises.push(saveUserFields());
    if (searchPrefsHasChanges) promises.push(saveSearchPrefs());
    return promises;
  }, [
    aboutHasChanges,
    saveProfileData,
    saveSearchPrefs,
    saveUserFields,
    searchPrefsHasChanges,
    userFieldsChanged,
  ]);

  const runSave = useCallback(
    async ({ exit }: { exit: boolean }) => {
      try {
        const savePromises = buildSavePromises();

        if (savePromises.length === 0) {
          Toast.show({
            type: "info",
            text1: "Sin cambios",
            text2: "No hay cambios para guardar",
            position: "bottom",
            visibilityTime: 2000,
          });
          if (exit) {
            setUnsavedChangesModalVisible(false);
            router.replace("/(app)/profile");
          }
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

        if (exit) {
          setUnsavedChangesModalVisible(false);
        }
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
    },
    [buildSavePromises, router],
  );

  const handleSaveAndExit = useCallback(() => runSave({ exit: true }), [runSave]);
  const handleSave = useCallback(() => runSave({ exit: false }), [runSave]);

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
                  firstName={data.firstName}
                  lastName={data.lastName}
                  bio={data.bio}
                  occupation={data.occupation}
                  education={data.education}
                  birthDate={data.birthDate}
                  user={user}
                  draftLocation={data.draftLocation}
                  locationModalVisible={data.locationModalVisible}
                  setLocationModalVisible={data.setLocationModalVisible}
                  setFirstName={data.setFirstName}
                  setLastName={data.setLastName}
                  setBio={data.setBio}
                  setOccupation={data.setOccupation}
                  setEducation={data.setEducation}
                  setBirthDate={data.setBirthDate}
                  handleLocationConfirm={data.handleLocationConfirm}
                />
              )}
              {activeTab === "about" && (
                <AboutTab
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
              renderOptionLeft={
                roommateTabModal.selectedQuestion === "languagesPref"
                  ? option => (
                      <Icon
                        name={getFlagIconNameForLanguage(option.value || option.label)}
                        width={18}
                        height={18}
                      />
                    )
                  : undefined
              }
            />
          )}

          {/* Modal para otras tabs */}
          {activeTab !== "roommate" && (
            <SelectionModal
              visible={otherTabsModal.modalVisible && !isSaving}
              title={QUESTION_TITLES[otherTabsModal.selectedQuestion] ?? ""}
              options={
                QUESTION_OPTIONS[
                  otherTabsModal.selectedQuestion as keyof typeof QUESTION_OPTIONS
                ] ?? []
              }
              selectedValue={otherTabsModal.selectedValue}
              onSelect={otherTabsModal.onSelect}
              onClose={otherTabsModal.close}
              onConfirm={otherTabsModal.confirm}
              isMultiSelect={otherTabsModal.isArrayField(otherTabsModal.selectedQuestion)}
              selectedValues={otherTabsModal.selectedValues}
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
