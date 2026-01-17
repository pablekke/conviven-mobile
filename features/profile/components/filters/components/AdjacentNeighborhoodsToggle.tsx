import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";
import { memo, useState, useEffect } from "react";

interface AdjacentNeighborhoodsToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const AdjacentNeighborhoodsToggle = memo(
  ({ value, onValueChange, disabled = false }: AdjacentNeighborhoodsToggleProps) => {
    const { colors } = useTheme();
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handlePress = () => {
      if (disabled) return;
      const newValue = !internalValue;
      setInternalValue(newValue);
      onValueChange(newValue);
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
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handlePress}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Incluir barrios adyacentes
            </Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Buscar también en barrios cercanos
            </Text>
          </View>
          <Switch
            value={internalValue}
            onValueChange={handlePress}
            trackColor={{
              false: colors.muted,
              true: colors.primary + "80",
            }}
            thumbColor={internalValue ? colors.primary : colors.mutedForeground}
            disabled={disabled}
          />
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
