import { useTheme } from "../../../context/ThemeContext";
import { Text, TextInput, View } from "react-native";
import React, { useRef } from "react";

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
  maxLength?: number;
  onFocus?: (inputRef: TextInput | null) => void;
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
  maxLength,
  onFocus,
}: FormFieldProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

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
        ref={inputRef}
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
        maxLength={maxLength}
        style={inputStyle}
        onFocus={() => onFocus?.(inputRef.current)}
      />
      {error && <Text className={errorClass}>{error}</Text>}
    </View>
  );
}
