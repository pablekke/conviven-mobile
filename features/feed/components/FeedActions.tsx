import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export interface FeedActionsProps {
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}

export function FeedActions({ onLike, onPass, onSuperLike, disabled = false }: FeedActionsProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between gap-4">
      <Pressable
        accessibilityRole="button"
        onPress={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full items-center justify-center"
        style={[styles.shadow, { backgroundColor: colors.muted }]}
      >
        <Ionicons name="close" size={28} color={colors.mutedForeground} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onLike}
        disabled={disabled}
        className="w-20 h-20 rounded-full items-center justify-center"
        style={[styles.shadowStrong, { backgroundColor: colors.conviven.blue }]}
      >
        <Ionicons name="heart" size={32} color={colors.primaryForeground} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onSuperLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full items-center justify-center border"
        style={[
          styles.shadow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="star" size={26} color={colors.conviven.orange} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  shadowStrong: {
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
