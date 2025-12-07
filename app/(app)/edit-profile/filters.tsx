import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { StyleSheet, View, ActivityIndicator, Animated } from "react-native";
import { useFiltersScreen } from "../../../features/profile/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import TabTransition from "../../../components/TabTransition";
import { useTheme } from "../../../context/ThemeContext";
import Spinner from "../../../components/Spinner";
import { StatusBar } from "expo-status-bar";
import {
  SelectionModal,
  DataTab,
  ExpandableTab,
  EditProfileHeaderSection,
  UnsavedChangesModal,
  NeighborhoodSelectionModal,
} from "../../../features/profile/components";

export default function FiltersScreen() {
  const { colors } = useTheme();
  const {
    // Datos
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    preferredNeighborhoods,
    mainPreferredNeighborhoodId,
    includeAdjacentNeighborhoods,
    cachedFilters,
    updateSearchFilters,
    // Estados
    searchFiltersLoading,
    isSaving,
    canNavigate,
    // Modales
    modalVisible,
    neighborhoodModalVisible,
    selectedQuestion,
    selectedValue,
    openSelectionModal,
    closeModal,
    confirmSelection,
    closeNeighborhoodModal,
    setSelectedValue,
    getSelectedLabel,
    // Guardado y navegación
    unsavedChangesModalVisible,
    setUnsavedChangesModalVisible,
    handleSave,
    handleSaveAndExit,
    handleBack,
    handleDiscardChanges,
    // Scroll
    scrollViewRef,
    scrollY,
    handleScroll,
    handleExpandHeader,
    // Handlers específicos
    handleNeighborhoodConfirm,
  } = useFiltersScreen();

  return (
    <TabTransition>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#FFFFFF" />
        {searchFiltersLoading && (
          <View style={styles.loadingOverlay}>
            <Spinner size={52} color="#007BFF" trackColor="rgba(0, 123, 255, 0.15)" thickness={5} />
          </View>
        )}
        {isSaving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <EditProfileHeaderSection
          scrollY={scrollY}
          activeTab="data"
          onTabChange={() => {}}
          onBack={canNavigate ? handleBack : () => {}}
          onSave={handleSave}
          isSaving={isSaving}
          title="Filtros"
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
            scrollEnabled={canNavigate}
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
            visible={modalVisible && canNavigate}
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
        visible={neighborhoodModalVisible && canNavigate}
        selectedNeighborhoodIds={preferredNeighborhoods}
        mainNeighborhoodId={mainPreferredNeighborhoodId}
        mode={selectedQuestion === "mainPreferredNeighborhood" ? "main" : "multiple"}
        excludeNeighborhoodIds={
          selectedQuestion === "preferredNeighborhoods" && mainPreferredNeighborhoodId
            ? [mainPreferredNeighborhoodId]
            : []
        }
        onClose={closeNeighborhoodModal}
        onConfirm={handleNeighborhoodConfirm}
      />
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
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
