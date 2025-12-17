import { useTheme } from "../../../../../../context/ThemeContext";
import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";

interface EmptyStateProps {
  hasSearchQuery: boolean;
}

export const EmptyState = memo(({ hasSearchQuery }: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        {hasSearchQuery ? "No se encontraron barrios" : "No hay barrios disponibles"}
      </Text>
    </View>
  );
});

EmptyState.displayName = "EmptyState";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
