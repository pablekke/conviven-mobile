import { useTheme } from "../../../../../../context/ThemeContext";
import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";

export const ChipsEmptyState = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        No hay barrios seleccionados
      </Text>
    </View>
  );
});

ChipsEmptyState.displayName = "ChipsEmptyState";

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
  },
});
