import React, { useState, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import TabTransition from "../../../components/TabTransition";
import {
  SelectionModal,
  DataTab,
  AboutTab,
  RoommateTab,
  ExpandableTab,
  EditProfileHeaderSection,
} from "../../../features/profile/components";
import type { TabType } from "../../../features/profile/components";
import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { useEditProfileLogic } from "../../../features/profile/hooks";

export default function EditProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const scrollViewRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentScrollYRef = useRef(0);

  const {
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
  } = useEditProfileLogic();

  const openSelectionModal = (questionKey: string) => {
    setSelectedQuestion(questionKey);
    const selectedLabel = selectedAnswers[questionKey];
    const options = QUESTION_OPTIONS[questionKey as keyof typeof QUESTION_OPTIONS];
    const selectedOption = options?.find(option => option.label === selectedLabel);
    setSelectedValue(selectedOption?.value ?? "");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedQuestion("");
    setSelectedValue("");
  };

  const confirmSelection = () => {
    const options = QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
    const selectedOption = options.find(option => option.value === selectedValue);
    const selectedLabel = selectedOption?.label ?? "";

    setSelectedAnswers(prev => ({ ...prev, [selectedQuestion]: selectedLabel }));
    handleUpdate(selectedQuestion, selectedValue);
    closeModal();
  };

  const getSelectedLabel = (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar";

  const handleBack = () => {
    const resetMap = {
      about: resetToUserData,
      roommate: resetSearchPrefs,
      data: resetSearchFilters,
    };
    const hasChangesMap = {
      about: profileHasChanges,
      roommate: searchPrefsHasChanges,
      data: searchFiltersHasChanges,
    };

    if (hasChangesMap[activeTab]) {
      resetMap[activeTab]();
    }
    router.replace("/(app)/profile");
  };

  const handleSave = async () => {
    try {
      const saveMap = {
        about: saveProfileData,
        roommate: saveSearchPrefs,
        data: saveSearchFilters,
      };
      const hasChangesMap = {
        about: profileHasChanges,
        roommate: searchPrefsHasChanges,
        data: searchFiltersHasChanges,
      };

      if (activeTab === "data" && searchFiltersHasChanges) {
        updateSearchFilters("minAge", parseInt(minAge, 10) || 18);
        updateSearchFilters("maxAge", parseInt(maxAge, 10) || 50);
        updateSearchFilters("budgetMin", parseInt(budgetMin, 10) || 10000);
        updateSearchFilters("budgetMax", parseInt(budgetMax, 10) || 50000);
      }

      if (hasChangesMap[activeTab]) {
        await saveMap[activeTab]();
        Toast.show({
          type: "success",
          text1: "¡Listo!",
          text2: "Tu perfil se actualizó correctamente",
          position: "bottom",
          visibilityTime: 3000,
        });
        router.replace("/(app)/profile");
      } else {
        Toast.show({
          type: "info",
          text1: "Sin cambios",
          text2: "No hay cambios para guardar",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
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

  const isSaving = saving || searchPrefsSaving || searchFiltersSaving;

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: any) => {
      currentScrollYRef.current = event.nativeEvent.contentOffset.y;
    },
  });

  const handleExpandHeader = () => {
    const currentScrollY = currentScrollYRef.current;

    if (currentScrollY === 0) return;

    // Animación más lenta y suave usando requestAnimationFrame
    const duration = 800; // Duración más larga para animación más lenta
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
        <EditProfileHeaderSection
          scrollY={scrollY}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBack}
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
          >
            <View style={styles.contentContainer}>
              {activeTab === "data" && (
                <DataTab
                  getSelectedLabel={getSelectedLabel}
                  openSelectionModal={openSelectionModal}
                  minAge={minAge}
                  setMinAge={setMinAge}
                  maxAge={maxAge}
                  setMaxAge={setMaxAge}
                  budgetMin={budgetMin}
                  setBudgetMin={setBudgetMin}
                  budgetMax={budgetMax}
                  setBudgetMax={setBudgetMax}
                  updateSearchFilters={updateSearchFilters}
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

          {/* Modal */}
          <SelectionModal
            visible={modalVisible}
            title={QUESTION_TITLES[selectedQuestion] ?? ""}
            options={QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? []}
            selectedValue={selectedValue}
            onSelect={setSelectedValue}
            onClose={closeModal}
            onConfirm={confirmSelection}
          />
        </SafeAreaView>
      </View>
      {/* Solapa desplegable independiente - fuera del container para estar por encima */}
      <ExpandableTab scrollY={scrollY} onExpand={handleExpandHeader} />
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    paddingHorizontal: 20,
  },
});
