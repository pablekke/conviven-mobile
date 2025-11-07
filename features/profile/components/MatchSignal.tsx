import { Feather } from "@expo/vector-icons";

import { Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface MatchSignalProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: number;
  description: string;
}

export const MatchSignal: React.FC<MatchSignalProps> = ({ icon, label, value, description }) => {
  const { colors } = useTheme();
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name={icon} size={18} color={colors.conviven.blue} />
          <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        </View>
        <Text className="text-sm font-conviven-semibold text-foreground">{width}%</Text>
      </View>
      <View
        className="h-1.5 rounded-full mt-2"
        style={{ backgroundColor: `${colors.conviven.blue}16` }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: colors.conviven.blue }}
        />
      </View>
      <Text className="text-xs font-conviven text-muted-foreground mt-2 leading-4">
        {description}
      </Text>
    </View>
  );
};
