import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Animated, { AnimatedRef } from "react-native-reanimated";
import { ProfilePhoto } from "../../../../types/profilePhoto";
import { useTheme } from "../../../../context/ThemeContext";
import Spinner from "../../../../components/Spinner";
import { PRIMARY_PHOTO_SIZE } from "./constants";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface PrimaryPhotoDisplayProps {
  photo: ProfilePhoto;
  dropZoneRef: AnimatedRef<any>;
  isDraggingOverPrimary: boolean;
  onDelete: (id: string) => void;
  onEdit?: () => void;
  deletingPhotoId: string | null;
}

export const PrimaryPhotoDisplay: React.FC<PrimaryPhotoDisplayProps> = ({
  photo,
  dropZoneRef,
  isDraggingOverPrimary,
  onDelete,
  onEdit,
  deletingPhotoId,
}) => {
  const { colors } = useTheme();
  const isDeleting = deletingPhotoId === photo.id;

  return (
    <View style={styles.primaryPhotoWrapper}>
      <Animated.View
        ref={dropZoneRef}
        style={[
          styles.primaryPhotoContainer,
          isDraggingOverPrimary && [styles.draggingBorder, { borderColor: colors.primary }],
        ]}
      >
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.9}
          disabled={!onEdit || isDraggingOverPrimary}
          style={styles.photoTouchable}
        >
          <Image
            source={{ uri: photo.url }}
            style={[styles.primaryPhoto, isDraggingOverPrimary && styles.draggingPhoto]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Animated.View>
      <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
        <Feather name="star" size={14} color={colors.primaryForeground} />
        <Text style={[styles.primaryBadgeText, { color: colors.primaryForeground }]}>
          Principal
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.photoActionButton, styles.deleteButton]}
        onPress={() => onDelete(photo.id)}
        activeOpacity={0.8}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Spinner size={18} color={colors.destructiveForeground} thickness={2} />
        ) : (
          <Feather name="trash-2" size={18} color={colors.destructiveForeground} />
        )}
      </TouchableOpacity>
      {isDraggingOverPrimary && (
        <View style={styles.dropIndicator}>
          <Feather name="arrow-down" size={32} color={colors.primary} />
          <Text style={[styles.dropIndicatorText, { color: colors.primary }]}>
            Suelta para hacer principal
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  primaryPhotoWrapper: {
    width: PRIMARY_PHOTO_SIZE,
    height: PRIMARY_PHOTO_SIZE,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryPhotoContainer: {
    width: PRIMARY_PHOTO_SIZE,
    height: PRIMARY_PHOTO_SIZE,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  primaryPhoto: {
    width: "100%",
    height: "100%",
  },
  photoTouchable: {
    width: "100%",
    height: "100%",
  },
  draggingPhoto: {
    opacity: 0.5,
  },
  primaryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  primaryBadgeText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  photoActionButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: "rgba(220, 38, 38, 0.95)",
  },
  dropIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -30 }],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  dropIndicatorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  draggingBorder: {
    borderWidth: 3,
    borderStyle: "dashed",
  },
});
