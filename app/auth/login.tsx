import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LoginCredentials } from "../../types/user";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    minHeight: height,
  },
});

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { colors } = useTheme();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      Alert.alert("Login Failed", err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 40,
          backgroundColor: colors.background,
        }}
      >
        {/* Header Section */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          {/* Logo */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: colors.primaryForeground,
                fontSize: 20,
                fontWeight: "bold",
                fontFamily: "Inter-Bold",
              }}
            >
              LOGO
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              color: colors.foreground,
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 8,
              fontFamily: "Inter-Bold",
            }}
          >
            Welcome Back
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
              fontFamily: "Inter-Regular",
            }}
          >
            Sign in to continue to your account
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={{
              width: width * 0.9,
              maxWidth: 400,
              backgroundColor: `${colors.destructive}15`,
              borderWidth: 1,
              borderColor: `${colors.destructive}30`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: colors.destructive,
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Inter-Regular",
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Sign Up Link */}
        <View
          style={{
            marginTop: 32,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 16,
              fontFamily: "Inter-Regular",
            }}
          >
            Don&apos;t have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/register")} activeOpacity={0.7}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
                fontFamily: "Inter-SemiBold",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
