import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import RegisterForm from "../../components/RegisterForm";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { RegisterCredentials } from "../../types/user";

const styles = StyleSheet.create({
  contentContainer: { flexGrow: 1 },
});

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const { colors } = useTheme();

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      await register(credentials);
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "Go to Login",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
      Alert.alert(
        "Registration Failed",
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      className="bg-background"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <View className="w-full max-w-lg">
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full mb-4 items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-xl font-conviven-bold"
                style={{ color: colors.primaryForeground }}
              >
                LOGO
              </Text>
            </View>
            <Text
              className="text-3xl font-conviven-bold mb-1 text-center"
              style={{ color: colors.foreground }}
            >
              Create Account
            </Text>
            <Text
              className="font-conviven mb-8 text-center"
              style={{ color: colors.mutedForeground }}
            >
              Fill out the details below to get started
            </Text>
          </View>

          {error && (
            <View
              className="border p-3 rounded-xl mb-4"
              style={{
                backgroundColor: `${colors.destructive}20`,
                borderColor: `${colors.destructive}40`,
              }}
            >
              <Text className="text-sm font-conviven" style={{ color: colors.destructive }}>
                {error}
              </Text>
            </View>
          )}

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          <View className="mt-6 flex-row justify-center">
            <Text className="font-conviven" style={{ color: colors.mutedForeground }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")} activeOpacity={0.7}>
              <Text className="font-conviven-semibold" style={{ color: colors.primary }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
