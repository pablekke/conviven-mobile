import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import Animated, { AnimatedRef } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { ProfilePhoto } from "../../../../types/profilePhoto";
import { useTheme } from "../../../../context/ThemeContext";
import Spinner from "../../../../components/Spinner";
import { ADDITIONAL_PHOTO_SIZE } from "./constants";
import { useDraggablePhoto } from "../../hooks";
import { Trash2 } from "lucide-react-native";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface DraggablePhotoProps {
  photo: ProfilePhoto;
  photoIndex: number;
  dropZoneRef: AnimatedRef<any>;
  photoDropZoneRefs?: AnimatedRef<any>[];
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string, targetIndex: number | null) => void;
  onHoverChange: (isOver: boolean) => void;
  onPhotoHoverChange?: (photoId: string | null) => void;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  isAnotherDragged: boolean;
  isDraggedOver?: boolean;
  showDelete?: boolean;
  position?: number;
  draggedPhotoId: string | null;
}

export const DraggablePhoto: React.FC<DraggablePhotoProps> = ({
  photo,
  photoIndex,
  dropZoneRef,
  photoDropZoneRefs,
  onDragStart,
  onDragEnd,
  onDrop,
  onHoverChange,
  onPhotoHoverChange,
  isDeleting,
  onDelete,
  isAnotherDragged,
  isDraggedOver = false,
  showDelete = true,
  position,
  draggedPhotoId,
}) => {
  const { colors } = useTheme();

  // No mostrar overlay si yo soy la foto que se está arrastrando
  const isSelfDragged = draggedPhotoId === photo.id;

  const { panGesture, animatedStyle } = useDraggablePhoto({
    dropZoneRef,
    photoDropZoneRefs,
    onDragStart,
    onDragEnd,
    onDrop,
    onHoverChange,
    onPhotoHoverChange,
    photoId: photo.id,
    photoIndex,
  });

  const isDisabled = isDeleting || isAnotherDragged;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.additionalPhotoWrapper, animatedStyle]}>
        <Animated.View
          style={[
            styles.additionalPhotoTouchable,
            isDraggedOver && [styles.draggedOverBorder, { borderColor: colors.primary }],
          ]}
        >
          <Image source={{ uri: photo.url }} style={styles.additionalPhoto} resizeMode="contain" />

          {isDraggedOver && !isSelfDragged && (
            <View style={styles.photoOverlayDark}>
              <Feather name="refresh-cw" size={32} color={colors.primary} />
              <Text style={[styles.overlayText, { color: colors.primary }]}>
                Suelta para reordenar
              </Text>
            </View>
          )}
        </Animated.View>

        {position !== undefined && !isDraggedOver && (
          <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.positionText}>{position}</Text>
          </View>
        )}

        {showDelete && !isDraggedOver && (
          <TouchableOpacity
            style={[
              styles.photoDeleteButton,
              { backgroundColor: colors.destructive },
              isDeleting && styles.photoDeleteButtonDisabled,
            ]}
            onPress={() => onDelete(photo.id)}
            activeOpacity={0.8}
            disabled={isDisabled}
          >
            {isDeleting ? (
              <Spinner size={16} color={colors.destructiveForeground} thickness={2} />
            ) : (
              <Trash2 size={14} color={colors.destructiveForeground} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  additionalPhotoWrapper: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
    borderRadius: 12,
    overflow: "visible",
    position: "relative",
  },
  additionalPhotoTouchable: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  additionalPhoto: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  photoOverlayDark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayText: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    marginTop: 8,
    textAlign: "center",
  },
  photoActionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  photoActionText: {
    color: "#111827",
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  photoDeleteButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoDeleteButtonDisabled: {
    opacity: 0.7,
  },
  positionBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    color: "white",
    fontSize: 11,
    fontFamily: "Inter-Bold",
    letterSpacing: 0.5,
  },
  draggedOverBorder: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderRadius: 12,
  },
});
