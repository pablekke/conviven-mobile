import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { memo } from "react";

interface PhotoGalleryButtonProps {
  photosCount: number;
  top?: number;
  onPress: () => void;
}

export const PhotoGalleryButton = memo(({ photosCount, top, onPress }: PhotoGalleryButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.photoGalleryButton, top !== undefined && { top }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <BlurView intensity={90} tint="extraLight" style={styles.photoGalleryButtonBlur}>
        <Feather name="image" size={18} color={colors.primary} />
        <Text style={[styles.photoGalleryButtonText, { color: colors.primary }]}>
          {photosCount}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
});

PhotoGalleryButton.displayName = "PhotoGalleryButton";

const styles = StyleSheet.create({
  photoGalleryButton: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  photoGalleryButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  photoGalleryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter-SemiBold",
  },
});
