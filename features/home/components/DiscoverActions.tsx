import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";

export interface DiscoverActionsProps {
  onDislike?: () => void;
  onLike?: () => void;
  onStar?: () => void; // opcional (oculto en el layout por defecto)
}

export const DiscoverActions: React.FC<DiscoverActionsProps> = ({ onDislike, onLike }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(12, insets.bottom),
        },
      ]}
    >
      <View style={styles.actionsContainer}>
        {/* Secundario (✕) */}
        <Pressable
          accessibilityRole="button"
          onPress={onDislike}
          style={[styles.dislikeButton, { backgroundColor: colors.muted }]}
        >
          <Ionicons name="close" size={24} color={colors.mutedForeground} />
        </Pressable>

        {/* Primario (❤) ocupa todo */}
        <Pressable
          accessibilityRole="button"
          onPress={onLike}
          style={[
            styles.likeButton,
            {
              backgroundColor: colors.conviven?.blue ?? colors.primary,
            },
          ]}
        >
          <Ionicons name="heart" size={26} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dislikeButton: {
    height: 56,
    width: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
