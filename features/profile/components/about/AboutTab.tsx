import { StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { QuestionRow } from "../QuestionRow";

interface AboutTabProps {
  aboutText: string;
  setAboutText: (text: string) => void;
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({
  aboutText,
  setAboutText,
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        <QuestionRow
          question="Género"
          selectedValue={getSelectedLabel("gender")}
          onPress={() => openSelectionModal("gender")}
        />
        <TextInput
          style={styles.aboutTextInput}
          multiline
          numberOfLines={6}
          placeholder="Cuéntanos sobre ti, qué buscas en un compañero/a..."
          placeholderTextColor="#999"
          value={aboutText}
          onChangeText={setAboutText}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="home" size={16} color="#007BFF" />
          <Text style={styles.sectionTitle}>Estilo de Convivencia</Text>
        </View>

        <QuestionRow
          question="¿Fumás cigarrillos?"
          selectedValue={getSelectedLabel("smoking")}
          onPress={() => openSelectionModal("smoking")}
        />
        <QuestionRow
          question="¿Fumás marihuana?"
          selectedValue={getSelectedLabel("marijuana")}
          onPress={() => openSelectionModal("marijuana")}
        />
        <QuestionRow
          question="¿Tomás alcohol?"
          selectedValue={getSelectedLabel("alcohol")}
          onPress={() => openSelectionModal("alcohol")}
        />
        <QuestionRow
          question="¿Tenés mascotas?"
          selectedValue={getSelectedLabel("pets")}
          onPress={() => openSelectionModal("pets")}
        />
        <QuestionRow
          question="¿Aceptás mascotas?"
          selectedValue={getSelectedLabel("acceptPets")}
          onPress={() => openSelectionModal("acceptPets")}
        />
        <QuestionRow
          question="¿Cuán ordenado/a sos?"
          selectedValue={getSelectedLabel("tidiness")}
          onPress={() => openSelectionModal("tidiness")}
        />
        <QuestionRow
          question="¿Recibís visitas en casa?"
          selectedValue={getSelectedLabel("visitors")}
          onPress={() => openSelectionModal("visitors")}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="clock" size={16} color="#007BFF" />
          <Text style={styles.sectionTitle}>Rutinas y hábitos</Text>
        </View>

        <QuestionRow
          question="¿Cuál es tu rutina de sueño?"
          selectedValue={getSelectedLabel("sleepRoutine")}
          onPress={() => openSelectionModal("sleepRoutine")}
        />
        <QuestionRow
          question="¿Cuándo preferís estudiar/trabajar?"
          selectedValue={getSelectedLabel("workRoutine")}
          onPress={() => openSelectionModal("workRoutine")}
        />
      </View>
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
  aboutTextInput: {
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
    textAlignVertical: "top",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    fontFamily: "Inter-Regular",
  },
});
