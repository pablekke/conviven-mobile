import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface ChecklistItemProps {
  label: string;
  helper: string;
  completed: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, helper, completed }) => {
  const { colors } = useTheme();
  const background = completed ? `${colors.conviven.blue}16` : colors.muted;
  const iconName = completed ? "check-circle" : "circle";
  const iconColor = completed ? colors.conviven.blue : colors.mutedForeground;

  return (
    <View
      className="flex-row items-start gap-3 px-3.5 py-3 rounded-2xl"
      style={{ backgroundColor: background }}
    >
      <View className="mt-[2px]">
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
    </View>
  );
};
