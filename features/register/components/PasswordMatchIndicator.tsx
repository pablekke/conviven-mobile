/* eslint-disable react-native/no-inline-styles */
import { useTheme } from "../../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

export default function PasswordMatchIndicator({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) {
  const { colors } = useTheme();

  if (!confirmPassword || confirmPassword.length === 0) {
    return null;
  }

  const isMatching = password === confirmPassword;

  return (
    <View className="mt-2">
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={isMatching ? "checkmark-circle" : "close-circle"}
          size={18}
          color={isMatching ? "#10b981" : colors.destructive}
        />
        <Text
          className={`text-sm font-conviven ${isMatching ? "text-green-600" : ""}`}
          style={{ color: isMatching ? "#10b981" : colors.destructive }}
        >
          {isMatching ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
        </Text>
      </View>
    </View>
  );
}
