import { Feather } from "@expo/vector-icons";

import { Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface VerificationPillProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  tone: "success" | "pending";
}

export const VerificationPill: React.FC<VerificationPillProps> = ({ icon, label, tone }) => {
  const { colors } = useTheme();
  const background =
    tone === "success" ? `${colors.conviven.blue}18` : `${colors.conviven.orange}20`;
  const color = tone === "success" ? colors.conviven.blue : colors.conviven.orange;

  return (
    <View
      className="flex-row items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ backgroundColor: background }}
    >
      <Feather name={icon} size={16} color={color} />
      <Text className="text-xs font-conviven-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
};
