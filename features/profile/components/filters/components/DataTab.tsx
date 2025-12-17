import { SearchFiltersFormData } from "../../../services/searchFiltersService";
import { NeighborhoodsSection } from "../NeighborhoodsSection";
import { SearchFiltersSection } from "./SearchFiltersSection";
import { StyleSheet, ScrollView } from "react-native";

interface DataTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
  minAge: string;
  setMinAge: (value: string) => void;
  maxAge: string;
  setMaxAge: (value: string) => void;
  budgetMin: string;
  setBudgetMin: (value: string) => void;
  budgetMax: string;
  setBudgetMax: (value: string) => void;
  updateSearchFilters: (field: any, value: any) => void;
  formData: SearchFiltersFormData;
}

export const DataTab: React.FC<DataTabProps> = ({
  getSelectedLabel,
  openSelectionModal,
  minAge,
  setMinAge,
  maxAge,
  setMaxAge,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  updateSearchFilters,
  formData,
}) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <SearchFiltersSection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
        minAge={minAge}
        setMinAge={setMinAge}
        maxAge={maxAge}
        setMaxAge={setMaxAge}
        budgetMin={budgetMin}
        setBudgetMin={setBudgetMin}
        budgetMax={budgetMax}
        setBudgetMax={setBudgetMax}
        updateSearchFilters={updateSearchFilters}
      />

      <NeighborhoodsSection
        openSelectionModal={openSelectionModal}
        formData={formData}
        updateFormData={updateSearchFilters}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 50,
  },
});
