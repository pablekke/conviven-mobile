import { View, StyleSheet, Text } from "react-native";
import { QuestionRow } from "../../../QuestionRow";
import React from "react";

interface HabitsSubsectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const HabitsSubsection: React.FC<HabitsSubsectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>Hábitos</Text>
    <View style={styles.cardGroup}>
      <QuestionRow
        question="¿Fumás cigarrillos?"
        selectedValue={getSelectedLabel("smoking")}
        onPress={() => openSelectionModal("smoking")}
      />
      <QuestionRow
        question="¿Fumás marihuana?"
        selectedValue={getSelectedLabel("marijuana")}
        onPress={() => openSelectionModal("marijuana")}
      />
      <QuestionRow
        question="¿Tomás alcohol?"
        selectedValue={getSelectedLabel("alcohol")}
        onPress={() => openSelectionModal("alcohol")}
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
