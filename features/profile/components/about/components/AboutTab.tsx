import { StyleSheet, ScrollView } from "react-native";
import { LifestyleSection } from "./LifestyleSection";
import { RoutinesSection } from "./RoutinesSection";

interface AboutTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ getSelectedLabel, openSelectionModal }) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <LifestyleSection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
      />
      <RoutinesSection
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
    paddingTop: 8,
    paddingBottom: 20,
  },
});
