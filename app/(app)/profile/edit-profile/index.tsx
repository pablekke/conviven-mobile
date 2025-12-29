import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../../features/profile/constants";
import { getFlagIconNameForLanguage } from "../../../../utils/languageFlags";
import { useEditProfileScreen } from "../../../../features/profile/hooks";
import TabTransition from "../../../../components/TabTransition";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { LoadingModal } from "@/components";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-ico-flags";
import {
  SelectionModal,
  PersonalDataTab,
  AboutTab,
  RoommateTab,
  ExpandableTab,
  EditProfileHeaderSection,
  UnsavedChangesModal,
} from "../../../../features/profile/components";

export default function EditProfileScreen() {
  const {
    user,
    activeTab,
    setActiveTab,
    isSaving,
    data,
    roommateTabModal,
    otherTabsModal,
    openSelectionModal,
    getSelectedLabel,
    scrollViewRef,
    scrollY,
    handleScroll,
    handleExpandHeader,
    unsavedChangesModalVisible,
    setUnsavedChangesModalVisible,
    handleSave,
    handleSaveAndExit,
    handleBack,
    handleDiscardChanges,
  } = useEditProfileScreen();

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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {/* Tab Content */}
            <Animated.ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              scrollEnabled={!isSaving}
              keyboardShouldPersistTaps="handled"
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
          </KeyboardAvoidingView>

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
  keyboardView: {
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
