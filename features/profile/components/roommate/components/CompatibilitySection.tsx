import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
import { QuestionRow } from "../../QuestionRow";

interface CompatibilitySectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const CompatibilitySection: React.FC<CompatibilitySectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="heart" title="Preferencias de Compatibilidad" />

      <QuestionRow
        question={QUESTION_TITLES.tidinessMin}
        selectedValue={getSelectedLabel("tidinessMin")}
        onPress={() => openSelectionModal("tidinessMin")}
      />
      <QuestionRow
        question={QUESTION_TITLES.schedulePref}
        selectedValue={getSelectedLabel("schedulePref")}
        onPress={() => openSelectionModal("schedulePref")}
      />
      <QuestionRow
        question={QUESTION_TITLES.guestsMax}
        selectedValue={getSelectedLabel("guestsMax")}
        onPress={() => openSelectionModal("guestsMax")}
      />
      <QuestionRow
        question={QUESTION_TITLES.musicMax}
        selectedValue={getSelectedLabel("musicMax")}
        onPress={() => openSelectionModal("musicMax")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
