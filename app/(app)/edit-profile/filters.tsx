import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { useFiltersScreen, useEditFiltersLogic } from "../../../features/profile/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import TabTransition from "../../../components/TabTransition";
import { GlassBackground, LoadingModal } from "@/components";
import { Animated, StyleSheet, View, Dimensions } from "react-native";
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
  const {
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    updateSearchFilters,
    searchFiltersLoading,
    isSaving,
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
    unsavedChangesModalVisible,
    setUnsavedChangesModalVisible,
    handleSave,
    handleSaveAndExit,
    handleBack,
    handleDiscardChanges,
    scrollViewRef,
    scrollY,
    handleScroll,
    handleExpandHeader,
    handleNeighborhoodConfirm,
    preferredLocations,
    mainPreferredNeighborhoodId,
  } = useFiltersScreen();

  const { searchFiltersData } = useEditFiltersLogic();

  return (
    <TabTransition>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#FFFFFF" />
        <LoadingModal visible={isSaving || searchFiltersLoading} />
        <EditProfileHeaderSection
          scrollY={scrollY}
          activeTab="data"
          onTabChange={() => {}}
          onBack={isSaving ? () => {} : handleBack}
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
            scrollEnabled={!isSaving}
            bounces={false}
            alwaysBounceVertical={false}
          >
            <View style={styles.contentContainer}>
              <GlassBackground intensity={90} />
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
                formData={searchFiltersData}
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
        selectedNeighborhoodIds={preferredLocations}
        mainNeighborhoodId={mainPreferredNeighborhoodId}
        mode={selectedQuestion === "mainPreferredNeighborhood" ? "main" : "multiple"}
        isFilterMode
        excludeNeighborhoodIds={
          selectedQuestion === "preferredLocations" && mainPreferredNeighborhoodId
            ? [mainPreferredNeighborhoodId]
            : []
        }
        onClose={closeNeighborhoodModal}
        onConfirm={handleNeighborhoodConfirm}
      />
    </TabTransition>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT - 120,
    paddingTop: 50,
    paddingBottom: 40,
  },
  contentContainer: {
    backgroundColor: "#F8F9FA",
    marginTop: 20,
  },
});
