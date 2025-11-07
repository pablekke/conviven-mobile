import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface QuickActionButtonProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  helper: string;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  helper,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="border rounded-2xl px-3.5 py-3 flex-row items-center gap-3"
      style={{ borderColor: colors.border }}
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: `${colors.conviven.blue}12` }}
      >
        <Feather name={icon} size={18} color={colors.conviven.blue} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
      <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
};
