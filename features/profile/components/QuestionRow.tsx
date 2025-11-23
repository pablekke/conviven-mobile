import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface QuestionRowProps {
  question: string;
  selectedValue: string;
  onPress: () => void;
}

export const QuestionRow: React.FC<QuestionRowProps> = ({ question, selectedValue, onPress }) => {
  return (
    <TouchableOpacity style={styles.questionRow} onPress={onPress}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.questionRight}>
        <Text style={[styles.selectText, selectedValue !== "Seleccionar" && styles.selectedText]}>
          {selectedValue}
        </Text>
        <Feather name="chevron-right" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  questionText: {
    fontSize: 16,
    color: "#222222",
    flex: 1,
    marginRight: 16,
  },
  questionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectText: {
    fontSize: 14,
    color: "#666666",
  },
  selectedText: {
    color: "#007BFF",
    fontWeight: "600",
  },
});
