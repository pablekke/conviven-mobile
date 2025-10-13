import React from "react";
import { Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface QuickBadgeProps {
  label: string;
}

export const QuickBadge: React.FC<QuickBadgeProps> = ({ label }) => {
  const { colors } = useTheme();

  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: `${colors.conviven.blue}12` }}
    >
      <Text className="text-xs font-conviven-semibold" style={{ color: colors.conviven.blue }}>
        {label}
      </Text>
    </View>
  );
};
