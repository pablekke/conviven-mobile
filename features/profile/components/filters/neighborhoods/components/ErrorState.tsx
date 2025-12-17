import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { memo } from "react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.retryButtonText, { color: colors.primaryForeground }]}>
          Reintentar
        </Text>
      </TouchableOpacity>
    </View>
  );
});

ErrorState.displayName = "ErrorState";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
});
