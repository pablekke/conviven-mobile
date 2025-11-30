import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
  Alert,
  Platform,
  Animated,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../context/AuthContext";
import { RegisterCredentials } from "../../types/user";
import { RegisterForm, RegisterHeaderSection } from "../../features/register/components";

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const handleBack = () => {
    router.back();
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FFFFFF" />
      <RegisterHeaderSection scrollY={scrollY} onBack={handleBack} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.select({ ios: "padding", android: "height" })}
        >
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.contentContainer}>
              {/* Error */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Form */}
              <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

              {/* Divider sutil */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Link a login */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>¿Ya tenés cuenta? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/login")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Ir a iniciar sesión"
                >
                  <Text style={styles.loginLinkButton}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 90,
    paddingBottom: 20,
  },
  contentContainer: {
    backgroundColor: "#F8F9FA",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    fontFamily: "Inter",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter",
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007BFF",
    fontFamily: "Inter-SemiBold",
  },
});
