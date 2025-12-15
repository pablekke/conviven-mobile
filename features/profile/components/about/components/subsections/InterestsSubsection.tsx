import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface InterestsSubsectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const InterestsSubsection: React.FC<InterestsSubsectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>Intereses</Text>
    <TouchableOpacity
      style={styles.cardGroup}
      onPress={() => openSelectionModal("interests")}
      activeOpacity={0.7}
    >
      <View style={styles.interestsContent}>
        {getSelectedLabel("interests") !== "Seleccionar" ? (
          <View style={styles.chipsContainer}>
            {getSelectedLabel("interests")
              .split(", ")
              .map((interest, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            <View style={[styles.chip, styles.addChip]}>
              <Feather name="plus" size={16} color="#007BFF" />
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateRow}>
            <Text style={styles.placeholderText}>Agregar intereses</Text>
            <Feather name="chevron-right" size={18} color="#999" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  interestsContent: {
    padding: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Inter-Medium",
  },
  addChip: {
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  emptyStateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  placeholderText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
});
