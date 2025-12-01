import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { Animated, StyleSheet, View, ActivityIndicator } from "react-native";
import { useEditProfileLogic } from "../../../features/profile/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import TabTransition from "../../../components/TabTransition";
import { useTheme } from "../../../context/ThemeContext";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import { useRouter } from "expo-router"
import {
  SelectionModal,
  DataTab,
  ExpandableTab,
  EditProfileHeaderSection,
  UnsavedChangesModal,
  NeighborhoodSelectionModal,
} from "../../../features/profile/components";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] = useState(false);
  const [neighborhoodModalVisible, setNeighborhoodModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const scrollViewRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentScrollYRef = useRef(0);

  const {
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
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    updateSearchFilters,
    searchFiltersSaving,
    handleUpdate,
    preferredNeighborhoods,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
  } = useEditProfileLogic();

  const openSelectionModal = (questionKey: string) => {
    if (isSaving) return;

    if (questionKey === "preferredNeighborhoods" || questionKey === "mainPreferredNeighborhood") {
      setNeighborhoodModalVisible(true);
      setSelectedQuestion(questionKey);
      return;
    }
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

  const hasAnyUnsavedChanges = searchFiltersHasChanges;

  const handleBack = () => {
    if (hasAnyUnsavedChanges) {
      setUnsavedChangesModalVisible(true);
    } else {
      router.replace("/(app)/profile");
    }
  };

  const handleDiscardChanges = () => {
    if (searchFiltersHasChanges) resetSearchFilters();
    setUnsavedChangesModalVisible(false);
    router.replace("/(app)/profile");
  };

  const handleSaveAndExit = async () => {
    try {
      if (searchFiltersHasChanges) {
        const overrideValues: Partial<any> = {};
        if (minAge && !isNaN(parseInt(minAge, 10))) {
          overrideValues.minAge = parseInt(minAge, 10);
        }
        if (maxAge && !isNaN(parseInt(maxAge, 10))) {
          overrideValues.maxAge = parseInt(maxAge, 10);
        }
        if (budgetMin && !isNaN(parseInt(budgetMin, 10))) {
          overrideValues.budgetMin = parseInt(budgetMin, 10);
        }
        if (budgetMax && !isNaN(parseInt(budgetMax, 10))) {
          overrideValues.budgetMax = parseInt(budgetMax, 10);
        }

        await saveSearchFilters(
          Object.keys(overrideValues).length > 0 ? overrideValues : undefined,
        );
      }

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
      if (!searchFiltersHasChanges) {
        Toast.show({
          type: "info",
          text1: "Sin cambios",
          text2: "No hay cambios para guardar",
          position: "bottom",
          visibilityTime: 2000,
        });
        return;
      }

      const overrideValues: Partial<any> = {};
      if (minAge && !isNaN(parseInt(minAge, 10))) {
        overrideValues.minAge = parseInt(minAge, 10);
      }
      if (maxAge && !isNaN(parseInt(maxAge, 10))) {
        overrideValues.maxAge = parseInt(maxAge, 10);
      }
      if (budgetMin && !isNaN(parseInt(budgetMin, 10))) {
        overrideValues.budgetMin = parseInt(budgetMin, 10);
      }
      if (budgetMax && !isNaN(parseInt(budgetMax, 10))) {
        overrideValues.budgetMax = parseInt(budgetMax, 10);
      }

      await saveSearchFilters(Object.keys(overrideValues).length > 0 ? overrideValues : undefined);

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

  const isSaving = searchFiltersSaving;

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
        {isSaving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <EditProfileHeaderSection
          scrollY={scrollY}
          activeTab="data"
          onTabChange={() => {}}
          onBack={isSaving ? () => {} : handleBack}
          onSave={handleSave}
          isSaving={isSaving}
          title="Ajustes"
          showTabs={false}
          headerHeight={120}
        />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Animated.ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={!isSaving}
          >
            <View style={styles.contentContainer}>
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
                preferredNeighborhoods={preferredNeighborhoods}
                mainPreferredNeighborhoodId={mainPreferredNeighborhoodId}
                includeAdjacentNeighborhoods={includeAdjacentNeighborhoods}
                cachedFilters={cachedFilters}
              />
            </View>
          </Animated.ScrollView>

          <SelectionModal
            visible={modalVisible && !isSaving}
            title={QUESTION_TITLES[selectedQuestion] ?? ""}
            options={QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? []}
            selectedValue={selectedValue}
            onSelect={setSelectedValue}
            onClose={closeModal}
            onConfirm={confirmSelection}
          />
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
      <NeighborhoodSelectionModal
        visible={neighborhoodModalVisible && !isSaving}
        selectedNeighborhoodIds={preferredNeighborhoods}
        mainNeighborhoodId={mainPreferredNeighborhoodId}
        mode={selectedQuestion === "mainPreferredNeighborhood" ? "main" : "multiple"}
        excludeNeighborhoodIds={
          selectedQuestion === "preferredNeighborhoods" && mainPreferredNeighborhoodId
            ? [mainPreferredNeighborhoodId]
            : []
        }
        onClose={() => {
          setNeighborhoodModalVisible(false);
          setSelectedQuestion("");
        }}
        onConfirm={(selectedIds, mainId) => {
          if (selectedQuestion === "mainPreferredNeighborhood") {
            updateSearchFilters("mainPreferredNeighborhoodId", mainId || "");
          } else {
            updateSearchFilters("preferredNeighborhoods", selectedIds);
          }
        }}
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  contentContainer: {
    backgroundColor: "#F8F9FA",
    marginTop: 20,
  },
});
