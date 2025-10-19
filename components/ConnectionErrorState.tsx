import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useResilience } from "@/context/ResilienceContext";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  onRetry: () => void;
  message?: string;
}

export default function ConnectionErrorState({ onRetry, message }: Props) {
  const { colors } = useTheme();
  const { statusPageUrl } = useResilience();

  const handleOpenStatus = () => {
    if (statusPageUrl) {
      Linking.openURL(statusPageUrl).catch(error => console.warn("status:open:error", error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>No pudimos conectarnos</Text>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>{message ?? "Por favor, revisá tu conexión e intentá nuevamente."}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onRetry} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOpenStatus} style={[styles.secondaryButton, { borderColor: colors.primary }]}>
          <Text style={[styles.secondaryText, { color: colors.primary }]}>Ver estado del sistema</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
  },
});
