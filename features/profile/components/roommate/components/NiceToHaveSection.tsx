import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View, Text } from "react-native";
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

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Preferencias Personales</Text>
        <View style={styles.cardGroup}>
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
