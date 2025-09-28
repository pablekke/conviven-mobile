import React from "react";
import { ScrollView, Text, View } from "react-native";

import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const name =
    user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User");
  const email = user?.email ?? "No email";

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="rounded-2xl bg-accent/60 p-5">
          <Text className="text-xl font-conviven-bold text-foreground mb-2">👋 Welcome, {name}!</Text>
          <Text className="font-conviven text-muted-foreground mb-4">
            You&apos;ve successfully logged into the app.
          </Text>
          <View className="bg-card border border-border p-4 rounded-xl">
            <Text className="font-conviven text-sm text-muted-foreground mb-1">Your email:</Text>
            <Text className="font-conviven-semibold text-foreground mb-3">{email}</Text>
            <Text className="font-conviven text-sm text-muted-foreground mb-1">User ID:</Text>
            <Text className="font-conviven-semibold text-foreground">{user?.id ?? "Not available"}</Text>
          </View>
        </View>

        <View className="space-y-4">
          <Text className="text-xl font-conviven-bold text-foreground">Features</Text>

          <View className="bg-muted/60 p-4 rounded-xl border border-border">
            <Text className="font-conviven-semibold text-foreground mb-1">Authentication Ready</Text>
            <Text className="font-conviven text-muted-foreground">
              The app connects to the Conviven backend for login, registration and profile retrieval.
            </Text>
          </View>

          <View className="bg-muted/60 p-4 rounded-xl border border-border">
            <Text className="font-conviven-semibold text-foreground mb-1">Clean Architecture</Text>
            <Text className="font-conviven text-muted-foreground">
              Follows domain-driven design with clear separation of concerns.
            </Text>
          </View>

          <View className="bg-muted/60 p-4 rounded-xl border border-border">
            <Text className="font-conviven-semibold text-foreground mb-1">Modern UI</Text>
            <Text className="font-conviven text-muted-foreground">
              Beautiful, responsive UI with NativeWind (Tailwind CSS).
            </Text>
          </View>
        </View>

        <Button label="Logout" onPress={logout} variant="secondary" />
      </View>
    </ScrollView>
  );
}
