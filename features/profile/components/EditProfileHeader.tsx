import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import Spinner from "../../../components/Spinner";

interface EditProfileHeaderProps {
  title?: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  title,
  onBack,
  onSave,
  isSaving,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
        <Feather name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title ?? "Editar Perfil"}</Text>
      </View>
      <TouchableOpacity
        onPress={onSave}
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <Spinner size={20} color="#007BFF" thickness={2} />
        ) : (
          <Text style={styles.saveButtonText}>Guardar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
  },
  saveButton: {
    minWidth: 90,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007BFF",
    fontFamily: "Inter-SemiBold",
  },
});
