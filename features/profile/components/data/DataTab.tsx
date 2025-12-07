import { SearchFiltersFormData } from "../../services/searchFiltersService";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import RangeSlider from "../../../../components/RangeSlider";
import NeighborhoodsSection from "./NeighborhoodsSection";
import { Feather } from "@expo/vector-icons";
import { QuestionRow } from "../QuestionRow";

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
    <>
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="filter" size={16} color="#007BFF" />
            <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>
          </View>

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

          <NeighborhoodsSection
            openSelectionModal={openSelectionModal}
            formData={formData}
            updateFormData={updateSearchFilters}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    fontFamily: "Inter-Bold",
  },
  rangeLabel: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  neighborhoodsSection: {
    marginTop: 24,
  },
  neighborhoodsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  neighborhoodsTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  neighborhoodsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  neighborhoodsSectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  additionalNeighborhoods: {
    marginTop: 8,
  },
  toggleContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
});
