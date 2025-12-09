import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
import { QuestionRow } from "../../QuestionRow";

interface NiceToHaveSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const NiceToHaveSection: React.FC<NiceToHaveSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="star" title="Estaría bien tener..." />

      <QuestionRow
        question={QUESTION_TITLES.languagesPref}
        selectedValue={getSelectedLabel("languagesPref")}
        onPress={() => openSelectionModal("languagesPref")}
      />
      <QuestionRow
        question={QUESTION_TITLES.interestsPref}
        selectedValue={getSelectedLabel("interestsPref")}
        onPress={() => openSelectionModal("interestsPref")}
      />
      <QuestionRow
        question={QUESTION_TITLES.zodiacPref}
        selectedValue={getSelectedLabel("zodiacPref")}
        onPress={() => openSelectionModal("zodiacPref")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
