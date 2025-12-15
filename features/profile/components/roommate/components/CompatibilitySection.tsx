import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { StyleSheet, View, Text } from "react-native";
import { SectionHeader } from "../../SectionHeader";
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

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Convivencia</Text>
        <View style={styles.cardGroup}>
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
