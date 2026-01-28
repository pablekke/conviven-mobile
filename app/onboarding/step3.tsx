import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";

export default function OnboardingStep3() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleFinish = () => {
    Toast.show({ type: "success", text1: "¡Bienvenido a Conviven!" });
    router.replace("/(app)");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.stepText}>Paso 3 de 3</Text>
          <Text style={styles.title}>Sobre mí</Text>
          <Text style={styles.subtitle}>Próximamente: Contanos un poco más sobre vos.</Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Funcionalidad en desarrollo</Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleFinish}
        >
          <Text style={styles.continueText}>Finalizar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  stepText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 32,
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  placeholderBox: {
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontFamily: "Inter-Medium",
    color: "#9CA3AF",
  },
  spacer: {
    height: 40,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginTop: "auto",
  },
  continueText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
