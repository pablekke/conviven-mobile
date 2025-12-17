import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";
import { memo } from "react";

interface AdjacentNeighborhoodsToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const AdjacentNeighborhoodsToggle = memo(
  ({ value, onValueChange, disabled = false }: AdjacentNeighborhoodsToggleProps) => {
    const { colors } = useTheme();

    const handleToggle = () => {
      if (!disabled) {
        onValueChange(!value);
      }
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={handleToggle}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Incluir barrios adyacentes
            </Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Buscar también en barrios cercanos
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{
                false: colors.muted,
                true: colors.primary + "80",
              }}
              thumbColor={value ? colors.primary : colors.mutedForeground}
              disabled={disabled}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

AdjacentNeighborhoodsToggle.displayName = "AdjacentNeighborhoodsToggle";

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
  },
  switchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
