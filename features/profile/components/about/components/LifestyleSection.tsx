import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
import { QuestionRow } from "../../QuestionRow";

interface LifestyleSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="home" title="Estilo de Convivencia" />

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
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
