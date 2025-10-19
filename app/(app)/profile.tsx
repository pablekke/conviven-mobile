import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import TabTransition from "../../components/TabTransition";
import { ProfileCard } from "../../features/profile/components";
import { useProfileScreen } from "../../features/profile/hooks";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userName, userAge, progressPercentage } = useProfileScreen();
  const { logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#007BFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TabTransition>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <ProfileCard
            avatar={user.avatar}
            userName={userName}
            userAge={userAge}
            progressPercentage={progressPercentage}
            onEditPress={() => router.push("./edit-profile")}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(app)")}>
            <Text style={styles.primaryButtonText}>Buscar compañero</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: "5%",
  },
  primaryButton: {
    width: "85%",
    height: 52,
    backgroundColor: "#007BFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    width: "85%",
    height: 52,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
