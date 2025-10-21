import React, { useState } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  confirmPassword?: string;
  isConfirmField?: boolean;
}

export default function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  confirmPassword,
  isConfirmField = false,
}: PasswordFieldProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validación visual para confirmar contraseña
  const getPasswordMatchStatus = () => {
    if (
      !isConfirmField ||
      !confirmPassword ||
      !value ||
      confirmPassword.length === 0 ||
      value.length === 0
    )
      return null;

    if (value === confirmPassword) {
      return { isValid: true, icon: "checkmark-circle", color: "#10b981" };
    } else {
      return { isValid: false, icon: "close-circle", color: colors.destructive };
    }
  };

  const matchStatus = getPasswordMatchStatus();

  const inputClass = `p-4 pr-12 border rounded-xl ${error ? "border-destructive" : "border-input"} bg-card text-foreground`;
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const errorClass = "mt-1 text-sm font-conviven-semibold text-destructive";

  const inputStyle = {
    backgroundColor: colors.card,
    color: colors.foreground,
  };

  return (
    <View className="mb-4">
      <Text className={labelClass}>{label}</Text>
      <View className="relative">
        <TextInput
          className={inputClass}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="oneTimeCode"
          keyboardType="default"
          style={inputStyle}
        />

        {/* Ícono de ojo para mostrar/ocultar contraseña */}
        <View
          style={{
            position: "absolute",
            right: 12,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            width: 32,
          }}
        >
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ padding: 4 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        {/* Ícono de validación para confirmar contraseña */}
        {matchStatus && (
          <View
            style={{
              position: "absolute",
              right: 48,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              width: 24,
            }}
          >
            <Ionicons name={matchStatus.icon as any} size={18} color={matchStatus.color} />
          </View>
        )}
      </View>

      {error && <Text className={errorClass}>{error}</Text>}

      {/* Mensaje de validación para confirmar contraseña */}
      {isConfirmField &&
        value &&
        confirmPassword &&
        value.length > 0 &&
        confirmPassword.length > 0 && (
          <Text
            className={`mt-1 text-xs font-conviven ${
              matchStatus?.isValid ? "text-green-600" : "text-destructive"
            }`}
          >
            {matchStatus?.isValid
              ? "✓ Las contraseñas coinciden"
              : "✗ Las contraseñas no coinciden"}
          </Text>
        )}
    </View>
  );
}
