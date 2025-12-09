import RangeSlider from "../../../../../components/RangeSlider";
import { SectionHeader } from "../../SectionHeader";
import { QuestionRow } from "../../QuestionRow";
import { StyleSheet, View } from "react-native";

interface SearchFiltersSectionProps {
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
}

export const SearchFiltersSection: React.FC<SearchFiltersSectionProps> = ({
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
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAge = (value: number) => {
    return `${value} años`;
  };

  return (
    <View style={styles.section}>
      <SectionHeader icon="filter" title="Filtros de Búsqueda" />

      <QuestionRow
        question="Preferencia de género"
        selectedValue={getSelectedLabel("genderPref")}
        onPress={() => openSelectionModal("genderPref")}
      />

      <QuestionRow
        question="¿Solo perfiles con foto?"
        selectedValue={getSelectedLabel("onlyWithPhoto")}
        onPress={() => openSelectionModal("onlyWithPhoto")}
      />

      <RangeSlider
        min={18}
        max={80}
        minValue={(() => {
          const val = parseInt(minAge, 10);
          return isNaN(val) ? 18 : val;
        })()}
        maxValue={(() => {
          const val = parseInt(maxAge, 10);
          return isNaN(val) ? 100 : val;
        })()}
        onValueChange={(min, max) => {
          setMinAge(min.toString());
          setMaxAge(max.toString());
          updateSearchFilters("minAge", min);
          updateSearchFilters("maxAge", max);
        }}
        step={1}
        label="Edad"
        valueFormatter={formatAge}
      />

      <RangeSlider
        min={0}
        max={80000}
        minValue={(() => {
          const val = parseInt(budgetMin, 10);
          return isNaN(val) ? 0 : val;
        })()}
        maxValue={(() => {
          const val = parseInt(budgetMax, 10);
          return isNaN(val) ? 100000 : val;
        })()}
        onValueChange={(min, max) => {
          setBudgetMin(min.toString());
          setBudgetMax(max.toString());
          updateSearchFilters("budgetMin", min);
          updateSearchFilters("budgetMax", max);
        }}
        step={1000}
        label="Presupuesto"
        valueFormatter={formatCurrency}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
