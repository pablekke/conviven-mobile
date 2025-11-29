import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { QuestionRow } from "./QuestionRow";
import RangeSlider from "../../../components/RangeSlider";

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
}) => {
  // Formateador de moneda para presupuesto
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Formateador simple para edad
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

          <RangeSlider
            min={18}
            max={100}
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
            max={100000}
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

          <QuestionRow
            question="¿Solo perfiles con foto?"
            selectedValue={getSelectedLabel("onlyWithPhoto")}
            onPress={() => openSelectionModal("onlyWithPhoto")}
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
});
