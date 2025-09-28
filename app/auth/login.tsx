import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { LoginCredentials } from "../../types/user";

const styles = StyleSheet.create({
  contentContainer: { flexGrow: 1 },
});

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
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
      className="bg-background"
    >
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full max-w-sm">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary rounded-full mb-4 items-center justify-center">
              <Text className="text-xl font-conviven-bold text-primary-foreground">LOGO</Text>
            </View>
            <Text className="text-3xl font-conviven-bold text-foreground mb-1 text-center">
              Welcome Back
            </Text>
            <Text className="font-conviven text-muted-foreground mb-8 text-center">
              Sign in to continue to your account
            </Text>
          </View>

          {error && (
            <View className="bg-destructive/10 border border-destructive/40 p-3 rounded-xl mb-4">
              <Text className="text-sm font-conviven text-destructive">{error}</Text>
            </View>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <View className="mt-6 flex-row justify-center">
            <Text className="font-conviven text-muted-foreground">Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              activeOpacity={0.7}
            >
              <Text className="font-conviven-semibold text-primary">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
