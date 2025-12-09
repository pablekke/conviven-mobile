import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import Spinner from "../../../components/Spinner";
import React from "react";

interface UnsavedChangesModalProps {
  visible: boolean;
  onDiscard: () => void;
  onSaveAndExit: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  visible,
  onDiscard,
  onSaveAndExit,
  onCancel,
  isSaving = false,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSaving ? undefined : onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Aún tienes cambios sin guardar
          </Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>
            ¿Qué deseas hacer?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.discardButton, isSaving && styles.buttonDisabled]}
              onPress={onDiscard}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <Text style={[styles.discardButtonText, { color: colors.background }]}>
                Salir sin guardar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.primary },
                isSaving && styles.buttonDisabled,
              ]}
              onPress={onSaveAndExit}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <Spinner size={20} color={colors.primaryForeground} thickness={2} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
                  Guardar y salir
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: colors.mutedForeground },
                isSaving && styles.textDisabled,
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  discardButton: {
    borderWidth: 1.5,
    borderColor: "red",
    backgroundColor: "red",
    opacity: 0.7,
  },
  saveButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discardButtonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
