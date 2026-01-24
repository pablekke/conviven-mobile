/* eslint-disable react-native/no-inline-styles */
import { useTheme } from "../../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { colors } = useTheme();

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const requirements: PasswordRequirement[] = [
    {
      label: "Mínimo 8 caracteres",
      isValid: hasMinLength,
    },
    {
      label: "Al menos una mayúscula",
      isValid: hasUpperCase,
    },
    {
      label: "Al menos una minúscula",
      isValid: hasLowerCase,
    },
    {
      label: "Al menos un número o símbolo",
      isValid: hasNumberOrSymbol,
    },
  ];

  return (
    <View className="mt-2">
      {requirements.map((req, index) => (
        <View
          key={index}
          className="flex-row items-center gap-2"
          style={{ marginBottom: index < requirements.length - 1 ? 8 : 0 }}
        >
          <Ionicons
            name={req.isValid ? "checkmark-circle" : "close-circle"}
            size={18}
            color={req.isValid ? "#10b981" : colors.mutedForeground}
          />
          <Text
            className={`text-sm font-conviven ${req.isValid ? "text-green-600" : ""}`}
            style={{ color: req.isValid ? "#10b981" : colors.mutedForeground }}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const validatePasswordRequirements = (password: string): boolean => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumberOrSymbol;
};
