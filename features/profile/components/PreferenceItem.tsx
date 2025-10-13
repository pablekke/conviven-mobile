import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface PreferenceItemProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  summary: string;
  details: string;
  expanded: boolean;
  onToggle: () => void;
}

export const PreferenceItem: React.FC<PreferenceItemProps> = ({
  icon,
  title,
  summary,
  details,
  expanded,
  onToggle,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      className="border rounded-2xl px-4 py-3 mb-2.5"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start gap-3 flex-1 pr-4">
          <View
            className="w-9 h-9 rounded-2xl items-center justify-center"
            style={{ backgroundColor: `${colors.conviven.orange}15` }}
          >
            <MaterialCommunityIcons name={icon} size={20} color={colors.conviven.orange} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-conviven-semibold text-foreground">{title}</Text>
            <Text className="text-xs font-conviven text-muted-foreground mt-1">{summary}</Text>
            {expanded && (
              <Text className="text-sm font-conviven text-foreground mt-2 leading-5">
                {details}
              </Text>
            )}
          </View>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </View>
    </Pressable>
  );
};
