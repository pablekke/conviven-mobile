import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useTheme } from "../../../context/ThemeContext";
import Spinner from "../../../components/Spinner";
import {
  SelectionModal,
  DataTab,
  AboutTab,
  RoommateTab,
} from "../../../features/profile/components";
import { QUESTION_TITLES, QUESTION_OPTIONS } from "../../../features/profile/constants";
import { useEditProfileLogic } from "../../../features/profile/hooks";

type TabType = "data" | "about" | "roommate";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222222" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Text style={styles.headerSubtitle}>Actualiza tu información personal</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
          {isSaving ? (
            <Spinner size={20} color="#007BFF" thickness={2} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: "data", icon: "user", label: "Datos" },
          { id: "about", icon: "star", label: "Sobre mí" },
          { id: "roommate", icon: "heart", label: "Roomie" },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Feather
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? "#FFFFFF" : "#666"}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
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
        <RoommateTab getSelectedLabel={getSelectedLabel} openSelectionModal={openSelectionModal} />
      )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007BFF",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
