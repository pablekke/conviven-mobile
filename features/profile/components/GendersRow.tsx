import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { QUESTION_OPTIONS } from "../constants/questionOptions";

interface GendersRowProps {
  selectedGenders: string[];
  onPress: () => void;
}

export const GendersRow: React.FC<GendersRowProps> = ({ selectedGenders, onPress }) => {
  const genderOptions = QUESTION_OPTIONS.genders || [];

  const getGendersLabel = (): string => {
    if (selectedGenders.length === 0) return "Seleccionar";
    if (selectedGenders.length === 1) {
      const option = genderOptions.find(opt => opt.value === selectedGenders[0]);
      return option?.label || selectedGenders[0];
    }
    return `${selectedGenders.length} seleccionados`;
  };

  const selectedLabel = useMemo(() => getGendersLabel(), [selectedGenders, genderOptions]);
  const hasSelection = selectedGenders.length > 0;

  return (
    <TouchableOpacity style={styles.questionRow} onPress={onPress}>
      <Text style={styles.questionText}>Géneros que busco</Text>
      <View style={styles.questionRight}>
        <Text style={[styles.selectText, hasSelection && styles.selectedText]}>
          {selectedLabel}
        </Text>
        <Feather name="chevron-right" size={18} color="#999" />
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
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
    marginRight: 16,
    fontWeight: "500",
    fontFamily: "Inter-Medium",
  },
  questionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter-Regular",
  },
  selectedText: {
    color: "#007BFF",
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
});
