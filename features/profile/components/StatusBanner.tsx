import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface StatusBannerProps {
  label: string;
  description: string;
  accent: string;
  textColor: string;
  onEdit: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  label,
  description,
  accent,
  textColor,
  onEdit,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="rounded-2xl px-4 py-3 mb-4"
      style={{ backgroundColor: accent }}
      onPress={onEdit}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-conviven-semibold" style={{ color: textColor }}>
            {label}
          </Text>
          <Text className="text-xs font-conviven mt-1" style={{ color: `${textColor}cc` }}>
            {description}
          </Text>
        </View>
        <Feather name="edit-3" size={18} color={textColor} />
      </View>
    </TouchableOpacity>
  );
};
