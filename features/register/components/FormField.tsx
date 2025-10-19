import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
  numberOfLines = 1,
}: FormFieldProps) {
  const { colors } = useTheme();

  const inputClass = `p-4 border rounded-xl ${error ? "border-destructive" : "border-input"} bg-card text-foreground`;
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const errorClass = "mt-1 text-sm font-conviven-semibold text-destructive";

  const inputStyle = {
    backgroundColor: colors.card,
    color: colors.foreground,
  };

  return (
    <View className="mb-4">
      <Text className={labelClass}>{label}</Text>
      <TextInput
        className={inputClass}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={inputStyle}
      />
      {error && <Text className={errorClass}>{error}</Text>}
    </View>
  );
}
