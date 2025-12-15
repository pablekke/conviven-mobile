import { QUESTION_TITLES } from "../../../constants/questionTitles";
import { StyleSheet, View, Text } from "react-native";
import { SectionHeader } from "../../SectionHeader";
import { QuestionRow } from "../../QuestionRow";

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

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Restricciones</Text>
        <View style={styles.cardGroup}>
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
