import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View, Text } from "react-native";
import { QuestionRow } from "../../QuestionRow";

interface RoutinesSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const RoutinesSection: React.FC<RoutinesSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="clock" title="Rutinas y hábitos" />

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Horarios</Text>
        <View style={styles.cardGroup}>
          <QuestionRow
            question="¿Cuál es tu rutina de sueño?"
            selectedValue={getSelectedLabel("sleepRoutine")}
            onPress={() => openSelectionModal("sleepRoutine")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
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
