import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../../../context/ThemeContext";

export const EmptyChatState: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.conviven.blue}12` }]}>
        <Text style={styles.emoji}>💬</Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Aún no tienes mensajes</Text>

      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Explora perfiles en Descubre y comienza a conectar con tus futuros roomies
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/")}
        style={[styles.button, { backgroundColor: colors.conviven.blue }]}
        activeOpacity={0.8}
      >
        <Feather name="compass" size={18} color="#ffffff" />
        <Text style={styles.buttonText}>Ir a Descubre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontFamily: "Conviven-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: "Conviven-Regular",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Conviven-SemiBold",
    color: "#ffffff",
  },
});
