import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isMultiSelect?: boolean;
  selectedValues?: string[];
  renderOptionLeft?: (option: { value: string; label: string }) => React.ReactNode;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  onConfirm,
  isMultiSelect = false,
  selectedValues = [],
  renderOptionLeft,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {options.map(option => {
              const isSelected = isMultiSelect
                ? selectedValues.includes(option.value)
                : selectedValue === option.value;
              const left = renderOptionLeft?.(option);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
                  onPress={() => onSelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.leftSlot}>{left ? left : null}</View>
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={20} color="#007BFF" style={styles.checkIcon} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>LISTO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    minHeight: "70%",
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  placeholder: {
    width: 32,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 500,
    flexGrow: 1,
  },
  optionButton: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
  },
  selectedOptionButton: {
    backgroundColor: "#EBF5FF",
    borderColor: "#007BFF",
  },
  optionText: {
    fontSize: 15,
    color: "#555555",
    fontWeight: "500",
    flex: 1,
  },
  selectedOptionText: {
    color: "#007BFF",
    fontWeight: "700",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSlot: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkIcon: {
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
