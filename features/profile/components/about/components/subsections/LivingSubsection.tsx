import { View, StyleSheet, Text } from "react-native";
import { QuestionRow } from "../../../QuestionRow";
import React from "react";

interface LivingSubsectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const LivingSubsection: React.FC<LivingSubsectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>Convivencia y Rutinas</Text>
    <View style={styles.cardGroup}>
      <QuestionRow
        question="¿Cuán ordenado/a sos?"
        selectedValue={getSelectedLabel("tidiness")}
        onPress={() => openSelectionModal("tidiness")}
      />
      <QuestionRow
        question="¿Recibís visitas en casa?"
        selectedValue={getSelectedLabel("visitors")}
        onPress={() => openSelectionModal("visitors")}
      />
      <QuestionRow
        question="¿Cuál es tu rutina de sueño?"
        selectedValue={getSelectedLabel("sleepRoutine")}
        onPress={() => openSelectionModal("sleepRoutine")}
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
