import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
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

      <QuestionRow
        question="¿Cuál es tu rutina de sueño?"
        selectedValue={getSelectedLabel("sleepRoutine")}
        onPress={() => openSelectionModal("sleepRoutine")}
      />
      <QuestionRow
        question="¿Cuándo preferís estudiar/trabajar?"
        selectedValue={getSelectedLabel("workRoutine")}
        onPress={() => openSelectionModal("workRoutine")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
