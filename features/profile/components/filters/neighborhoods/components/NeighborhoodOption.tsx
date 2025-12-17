import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";

interface NeighborhoodOptionProps {
  name: string;
  isSelected: boolean;
  isMain?: boolean;
  onPress: () => void;
}

export const NeighborhoodOption = memo(
  ({ name, isSelected, isMain = false, onPress }: NeighborhoodOptionProps) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        style={[
          styles.button,
          isMain && styles.buttonMain,
          {
            backgroundColor: isSelected ? colors.primary + "20" : colors.muted,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={onPress}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.text,
              isSelected && styles.textSelected,
              {
                color: isSelected ? colors.primary : colors.foreground,
              },
            ]}
          >
            {name}
          </Text>
          {isMain && (
            <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.mainBadgeText, { color: colors.primaryForeground }]}>
                Principal
              </Text>
            </View>
          )}
        </View>
        {isSelected && (
          <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={16} color={colors.primaryForeground} />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

NeighborhoodOption.displayName = "NeighborhoodOption";

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonMain: {
    borderWidth: 2,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },
  textSelected: {
    fontWeight: "600",
  },
  mainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mainBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
