import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useResilience } from "@/context/ResilienceContext";
import { useTheme } from "@/context/ThemeContext";

export default function MaintenanceScreen() {
  const { colors } = useTheme();
  const { maintenanceMessage, statusPageUrl } = useResilience();

  const handleOpenStatus = () => {
    if (statusPageUrl) {
      Linking.openURL(statusPageUrl).catch(error => console.warn("status:open:error", error));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.foreground }]}>Estamos en mantenimiento</Text>
      {maintenanceMessage ? (
        <Text style={[styles.message, { color: colors.mutedForeground }]}>{maintenanceMessage}</Text>
      ) : null}
      <TouchableOpacity onPress={handleOpenStatus} style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Ver estado del sistema</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
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
});
