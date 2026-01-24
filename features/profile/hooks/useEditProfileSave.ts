import { useAuth } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";

interface UseEditProfileSaveProps {
  aboutHasChanges: boolean;
  userFieldsChanged: boolean;
  searchPrefsHasChanges: boolean;
  profileHasChanges: boolean;
  saveProfileData: () => Promise<void>;
  saveUserFields: () => Promise<void>;
  saveSearchPrefs: () => Promise<void>;
  resetToUserData: () => void;
  resetUserFields: () => void;
  resetSearchPrefs: () => void;
  reinitializeSearchPrefs: () => Promise<void>;
  resetAboutAndAnswers: () => void;
  isSaving: boolean;
}

export const useEditProfileSave = ({
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
}: UseEditProfileSaveProps) => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] = useState(false);

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

        await refreshUser();

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

  const handleBack = useCallback(() => {
    // Solo verificar los flags de cambios, NO llamar a buildSavePromises ya que eso ejecuta las funciones
    const hasAnyUnsavedChanges = aboutHasChanges || userFieldsChanged || searchPrefsHasChanges;

    if (hasAnyUnsavedChanges) {
      setUnsavedChangesModalVisible(true);
    } else {
      router.replace("/(app)/profile");
    }
  }, [aboutHasChanges, userFieldsChanged, searchPrefsHasChanges, router]);

  const handleDiscardChanges = useCallback(async () => {
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
  }, [
    profileHasChanges,
    searchPrefsHasChanges,
    resetToUserData,
    reinitializeSearchPrefs,
    resetSearchPrefs,
    resetUserFields,
    resetAboutAndAnswers,
    router,
  ]);

  return {
    unsavedChangesModalVisible,
    setUnsavedChangesModalVisible,
    handleSave,
    handleSaveAndExit,
    handleBack,
    handleDiscardChanges,
    isSaving,
  };
};
