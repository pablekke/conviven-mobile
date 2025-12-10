import { PersonalDataSection } from "./PersonalDataSection";
import { StyleSheet, ScrollView } from "react-native";

interface DataTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const DataTab: React.FC<DataTabProps> = ({ getSelectedLabel, openSelectionModal }) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <PersonalDataSection
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
