import type { SearchFiltersFormData } from "../services/searchFiltersService";
import Toast from "react-native-toast-message";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";

interface UseFiltersSaveProps {
  searchFiltersHasChanges: boolean;
  saveSearchFilters: (overrideValues?: Partial<SearchFiltersFormData>) => Promise<void>;
  resetSearchFilters: () => void;
  minAge: string;
  maxAge: string;
  budgetMin: string;
  budgetMax: string;
  isSaving: boolean;
  searchFiltersLoading: boolean;
}

export const useFiltersSave = ({
  searchFiltersHasChanges,
  saveSearchFilters,
  resetSearchFilters,
  minAge,
  maxAge,
  budgetMin,
  budgetMax,
  isSaving,
  searchFiltersLoading,
}: UseFiltersSaveProps) => {
  const router = useRouter();
  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] = useState(false);

  const buildOverrideValues = useCallback((): Partial<SearchFiltersFormData> => {
    const overrideValues: Partial<SearchFiltersFormData> = {};

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

    return Object.keys(overrideValues).length > 0
      ? overrideValues
      : ({} as Partial<SearchFiltersFormData>);
  }, [minAge, maxAge, budgetMin, budgetMax]);

  const showSuccessToast = useCallback(() => {
    Toast.show({
      type: "success",
      text1: "¡Listo!",
      text2: "Tu perfil se actualizó correctamente",
      position: "bottom",
      visibilityTime: 3000,
    });
  }, []);

  const showErrorToast = useCallback((error: unknown) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error instanceof Error ? error.message : "No se pudo guardar",
      position: "bottom",
      visibilityTime: 4000,
    });
  }, []);

  const handleSave = useCallback(async () => {
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

      const overrideValues = buildOverrideValues();
      await saveSearchFilters(overrideValues);
      showSuccessToast();
      router.back();
    } catch (error) {
      console.error("❌ Error:", error);
      showErrorToast(error);
    }
  }, [searchFiltersHasChanges, buildOverrideValues, saveSearchFilters, showSuccessToast, router]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      if (searchFiltersHasChanges) {
        const overrideValues = buildOverrideValues();
        await saveSearchFilters(overrideValues);
      }

      showSuccessToast();
      setUnsavedChangesModalVisible(false);
      router.replace("/(app)/profile");
    } catch (error) {
      console.error("❌ Error:", error);
      showErrorToast(error);
    }
  }, [searchFiltersHasChanges, buildOverrideValues, saveSearchFilters, showSuccessToast, router]);

  const handleBack = useCallback(() => {
    if (searchFiltersHasChanges) {
      setUnsavedChangesModalVisible(true);
    } else {
      router.replace("/(app)/profile");
    }
  }, [searchFiltersHasChanges, router]);

  const handleDiscardChanges = useCallback(() => {
    if (searchFiltersHasChanges) resetSearchFilters();
    setUnsavedChangesModalVisible(false);
    router.back();
  }, [searchFiltersHasChanges, resetSearchFilters, router]);

  const canNavigate = !isSaving && !searchFiltersLoading;

  return {
    unsavedChangesModalVisible,
    setUnsavedChangesModalVisible,
    handleSave,
    handleSaveAndExit,
    handleBack,
    handleDiscardChanges,
    canNavigate,
  };
};
