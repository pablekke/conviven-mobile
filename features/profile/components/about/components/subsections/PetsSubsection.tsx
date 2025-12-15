import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { QuestionRow } from "../../../QuestionRow";

interface PetsSubsectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const PetsSubsection: React.FC<PetsSubsectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>Mascotas</Text>
    <View style={styles.cardGroup}>
      <QuestionRow
        question="¿Tenés mascotas?"
        selectedValue={getSelectedLabel("pets")}
        onPress={() => openSelectionModal("pets")}
      />
      <QuestionRow
        question="¿Aceptás mascotas?"
        selectedValue={getSelectedLabel("acceptPets")}
        onPress={() => openSelectionModal("acceptPets")}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});
