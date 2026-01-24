/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useState } from "react";
import { Neighborhood } from "../types";
import { IncrementalLocationModal } from "../../../components/IncrementalLocationModal";
import { Feather } from "@expo/vector-icons";

interface FormNeighborhoodSearchProps {
  label: string;
  onSelect: (neighborhood: Neighborhood) => void;
  error?: string;
  initialValue?: string;
  selectedNeighborhoodName?: string;
}

export default function FormNeighborhoodSearch({
  label,
  onSelect,
  error,
  selectedNeighborhoodName,
}: FormNeighborhoodSearchProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (neighborhood: Neighborhood) => {
    onSelect(neighborhood);
  };

  const inputClass = `p-4 border rounded-xl ${error ? "border-destructive" : "border-input"} bg-card flex-row items-center justify-between`;
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const errorClass = "mt-1 text-sm font-conviven-semibold text-destructive";

  return (
    <View className="mb-4">
      <Text className={labelClass}>{label}</Text>

      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderColor: error ? colors.destructive : colors.border,
        }}
        className={inputClass}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: selectedNeighborhoodName ? colors.foreground : colors.mutedForeground,
            fontFamily: selectedNeighborhoodName ? "Inter-SemiBold" : "Inter-Regular",
          }}
          className="text-base"
        >
          {selectedNeighborhoodName || "Buscá tu barrio..."}
        </Text>
        <Feather name="search" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      {error && <Text className={errorClass}>{error}</Text>}

      <IncrementalLocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
        initialQuery={selectedNeighborhoodName}
      />
    </View>
  );
}
