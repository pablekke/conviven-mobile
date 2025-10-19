import { StyleSheet, Text, View } from "react-native";

import { useResilience } from "@/context/ResilienceContext";
import { useTheme } from "@/context/ThemeContext";

export default function OfflineBanner() {
  const { offline } = useResilience();
  const { colors } = useTheme();

  if (!offline) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.conviven.orange }]}> 
      <Text style={[styles.text, { color: colors.primaryForeground }]}>Modo limitado: sin conexión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
  },
});
