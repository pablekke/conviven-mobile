import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";

interface NeighborhoodChipProps {
  name: string;
  onRemove?: () => void;
  editable?: boolean;
}

export const NeighborhoodChip = memo(
  ({ name, onRemove, editable = true }: NeighborhoodChipProps) => {
    const { colors } = useTheme();

    return (
      <View
        style={[
          styles.chip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.chipText, { color: colors.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        {editable && onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

NeighborhoodChip.displayName = "NeighborhoodChip";

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minWidth: 60,
    maxWidth: 200,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    flexShrink: 1,
  },
  removeButton: {
    marginLeft: 4,
    padding: 2,
  },
});
