import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import RegisterForm from "../../components/RegisterForm";
import { useAuth } from "../../context/AuthContext";
import { RegisterCredentials } from "../../types/user";

const styles = StyleSheet.create({
  contentContainer: { flexGrow: 1 },
});

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();

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
      Alert.alert("Registration Failed", err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      className="bg-background"
    >
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full max-w-lg">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary rounded-full mb-4 items-center justify-center">
              <Text className="text-xl font-conviven-bold text-primary-foreground">LOGO</Text>
            </View>
            <Text className="text-3xl font-conviven-bold text-foreground mb-1 text-center">
              Create Account
            </Text>
            <Text className="font-conviven text-muted-foreground mb-8 text-center">
              Fill out the details below to get started
            </Text>
          </View>

          {error && (
            <View className="bg-destructive/10 border border-destructive/40 p-3 rounded-xl mb-4">
              <Text className="text-sm font-conviven text-destructive">{error}</Text>
            </View>
          )}

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          <View className="mt-6 flex-row justify-center">
            <Text className="font-conviven text-muted-foreground">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.7}
            >
              <Text className="font-conviven-semibold text-primary">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
