import { useTheme } from "../../../../../../context/ThemeContext";
import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";

interface ChipsErrorStateProps {
  error: string;
}

export const ChipsErrorState = memo(({ error }: ChipsErrorStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.destructive }]}>{error}</Text>
    </View>
  );
});

ChipsErrorState.displayName = "ChipsErrorState";

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
});
