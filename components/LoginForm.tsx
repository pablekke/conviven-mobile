import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { LoginCredentials } from "../types/user";

const { width } = Dimensions.get("window");

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState("firulete@ejemplo.com");
  const [password, setPassword] = useState("contraseña123");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { colors } = useTheme();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({ email, password });
      } catch (error) {
        throw error;
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: width * 0.9,
      maxWidth: 380,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 12,
      borderWidth: 0,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter-Bold",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
    fieldContainer: {
      marginBottom: 20,
    },
    label: {
      color: colors.foreground,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
      marginLeft: 4,
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter-Regular",
    },
    inputFocused: {
      borderColor: colors.conviven.blue,
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 12,
      marginTop: 6,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    forgotPasswordText: {
      color: colors.conviven.blue,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    buttonContainer: {
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.conviven.blue,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonDisabled: {
      backgroundColor: colors.muted,
      shadowOpacity: 0.1,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    buttonTextDisabled: {
      color: colors.background,
    },
    loadingContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    loadingText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      {/* Email Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : styles.inputFocused]}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setErrors({ ...errors, email: undefined })}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : styles.inputFocused]}
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            onFocus={() => setErrors({ ...errors, password: undefined })}
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() =>
          Alert.alert(
            "Recuperar Contraseña",
            "Esta función te redirigiría al flujo de recuperación de contraseña.",
          )
        }
        activeOpacity={0.7}
      >
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.conviven.blue} />
          <Text style={styles.loadingText}>Por favor espera...</Text>
        </View>
      )}
    </View>
  );
}
