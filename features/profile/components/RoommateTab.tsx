import { StyleSheet, Text, View, ScrollView } from "react-native";
import { QuestionRow } from "../components/QuestionRow";
import { Feather } from "@expo/vector-icons";

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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={16} color="#007BFF" />
          <Text style={styles.sectionTitle}>Dealbreakers</Text>
        </View>

        <QuestionRow
          question="¿Aceptás fumadores de cigarrillos?"
          selectedValue={getSelectedLabel("noCigarettes")}
          onPress={() => openSelectionModal("noCigarettes")}
        />
        <QuestionRow
          question="¿Aceptás consumidores de marihuana?"
          selectedValue={getSelectedLabel("noWeed")}
          onPress={() => openSelectionModal("noWeed")}
        />
        <QuestionRow
          question="¿Preferencias sobre mascotas?"
          selectedValue={getSelectedLabel("petsPreference")}
          onPress={() => openSelectionModal("petsPreference")}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="heart" size={16} color="#007BFF" />
          <Text style={styles.sectionTitle}>Preferencias de Compatibilidad</Text>
        </View>

        <QuestionRow
          question="Nivel mínimo de limpieza"
          selectedValue={getSelectedLabel("tidinessMin")}
          onPress={() => openSelectionModal("tidinessMin")}
        />
        <QuestionRow
          question="Preferencia de horario"
          selectedValue={getSelectedLabel("schedulePref")}
          onPress={() => openSelectionModal("schedulePref")}
        />
        <QuestionRow
          question="Frecuencia máxima de invitados"
          selectedValue={getSelectedLabel("guestsMax")}
          onPress={() => openSelectionModal("guestsMax")}
        />
        <QuestionRow
          question="Uso máximo de música/ruido"
          selectedValue={getSelectedLabel("musicMax")}
          onPress={() => openSelectionModal("musicMax")}
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
});
