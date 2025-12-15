import { View, StyleSheet, Text } from "react-native";
import { QuestionRow } from "../../../QuestionRow";
import React from "react";

interface FoodSubsectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const FoodSubsection: React.FC<FoodSubsectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>Comida y Estilo de Vida</Text>
    <View style={styles.cardGroup}>
      <QuestionRow
        question="¿Con qué frecuencia cocinás?"
        selectedValue={getSelectedLabel("cooking")}
        onPress={() => openSelectionModal("cooking")}
      />
      <QuestionRow
        question="¿Tenés alguna dieta especial?"
        selectedValue={getSelectedLabel("diet")}
        onPress={() => openSelectionModal("diet")}
      />
      <QuestionRow
        question="Política de compartir cosas"
        selectedValue={getSelectedLabel("sharePolicy")}
        onPress={() => openSelectionModal("sharePolicy")}
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
