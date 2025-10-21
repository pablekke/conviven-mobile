import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import RegisterForm from "../../components/RegisterForm";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { RegisterCredentials } from "../../types/user";

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const { colors } = useTheme();

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      await register(credentials);
      Alert.alert("Éxito", "¡Cuenta creada exitosamente!", [
        { text: "Ir al inicio de sesión", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrarse";
      setError(msg);
      Alert.alert("Error de registro", msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        <ScrollView keyboardShouldPersistTaps="handled" className="flex-grow px-4 py-3">
          {/* Back arrow */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Volver al login"
            >
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center min-h-[560px]">
            {/* Header */}
            <View className="items-center mb-6">
              <Text className="text-3xl font-conviven-bold text-foreground text-center">
                Crear cuenta
              </Text>

              <View className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Text className="text-xs font-conviven-semibold text-primary">
                  Simple • Seguro • Conviven
                </Text>
              </View>

              <Text className="mt-3 text-center text-muted-foreground font-conviven">
                Completá tus datos para comenzar
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-destructive/10 border border-destructive/40 p-3 rounded-xl mb-4">
                <Text className="text-sm font-conviven text-destructive">{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

            {/* Divider sutil */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-[1px] bg-border/60" />
              <Text className="mx-3 text-xs text-muted-foreground font-conviven">o</Text>
              <View className="flex-1 h-[1px] bg-border/60" />
            </View>

            {/* Link a login */}
            <View className="flex-row justify-center">
              <Text className="font-conviven text-muted-foreground">¿Ya tenés cuenta? </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/login")}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Ir a iniciar sesión"
              >
                <Text className="font-conviven-semibold text-primary">Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
