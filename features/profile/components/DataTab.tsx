import { StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { QuestionRow } from "./QuestionRow";

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
  return (
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

        <View style={styles.rangeRow}>
          <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>Edad mínima</Text>
            <TextInput
              style={styles.rangeInput}
              value={minAge}
              onChangeText={text => {
                setMinAge(text);
                updateSearchFilters("minAge", parseInt(text, 10) || 18);
              }}
              keyboardType="numeric"
              placeholder="18"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>Edad máxima</Text>
            <TextInput
              style={styles.rangeInput}
              value={maxAge}
              onChangeText={text => {
                setMaxAge(text);
                updateSearchFilters("maxAge", parseInt(text, 10) || 50);
              }}
              keyboardType="numeric"
              placeholder="50"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.rangeRow}>
          <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>Presupuesto mín</Text>
            <TextInput
              style={styles.rangeInput}
              value={budgetMin}
              onChangeText={text => {
                setBudgetMin(text);
                updateSearchFilters("budgetMin", parseInt(text, 10) || 10000);
              }}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>Presupuesto máx</Text>
            <TextInput
              style={styles.rangeInput}
              value={budgetMax}
              onChangeText={text => {
                setBudgetMax(text);
                updateSearchFilters("budgetMax", parseInt(text, 10) || 50000);
              }}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <QuestionRow
          question="¿Solo perfiles con foto?"
          selectedValue={getSelectedLabel("onlyWithPhoto")}
          onPress={() => openSelectionModal("onlyWithPhoto")}
        />
      </View>
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
    color: "#222222",
  },
  rangeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  rangeField: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  rangeInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#222222",
    backgroundColor: "#FAFAFA",
  },
});
