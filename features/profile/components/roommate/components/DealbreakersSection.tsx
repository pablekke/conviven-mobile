import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { SectionHeader } from "../../SectionHeader";
import { QuestionRow } from "../../QuestionRow";
import { StyleSheet, View } from "react-native";

interface DealbreakersSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const DealbreakersSection: React.FC<DealbreakersSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="shield" title="No negociables" />

      <QuestionRow
        question={QUESTION_TITLES.noCigarettes}
        selectedValue={getSelectedLabel("noCigarettes")}
        onPress={() => openSelectionModal("noCigarettes")}
      />
      <QuestionRow
        question={QUESTION_TITLES.noWeed}
        selectedValue={getSelectedLabel("noWeed")}
        onPress={() => openSelectionModal("noWeed")}
      />
      <QuestionRow
        question={QUESTION_TITLES.petsPreference}
        selectedValue={getSelectedLabel("petsPreference")}
        onPress={() => openSelectionModal("petsPreference")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
