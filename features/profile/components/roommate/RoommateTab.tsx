import { CompatibilitySection, DealbreakersSection, NiceToHaveSection } from "./components";
import { StyleSheet, ScrollView } from "react-native";

interface RoommateTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const RoommateTab: React.FC<RoommateTabProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <DealbreakersSection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
      />
      <CompatibilitySection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
      />
      <NiceToHaveSection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
});
