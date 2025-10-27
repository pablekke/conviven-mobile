import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export interface LikeDislikeButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  disabled?: boolean;
}

export function LikeDislikeButtons({
  onLike,
  onDislike,
  disabled = false,
}: LikeDislikeButtonsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onDislike}
        disabled={disabled}
        activeOpacity={0.85}
        style={[
          styles.circleButton,
          styles.dislikeButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="close" size={26} color={colors.mutedForeground} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onLike}
        disabled={disabled}
        activeOpacity={0.9}
        style={[styles.circleButton, styles.likeButton, { backgroundColor: colors.conviven.blue }]}
      >
        <Ionicons name="heart" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  dislikeButton: {
    borderWidth: 1,
  },
  likeButton: {
    flexGrow: 1,
    marginLeft: 16,
  },
});
